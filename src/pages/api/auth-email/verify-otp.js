import { getAdmin } from "@/confiq/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    const { email, otp } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanOtp = String(otp || "").trim();

    if (!cleanEmail || !cleanOtp) {
      return res.status(400).json({ ok: false, message: "Email/OTP wajib." });
    }

    const admin = getAdmin();
    const db = admin.firestore();

    const ref = db.collection("email_otps").doc(cleanEmail);
    const snap = await ref.get();
    if (!snap.exists) return res.status(400).json({ ok: false, message: "OTP tidak ditemukan." });

    const data = snap.data();
    if (!data?.otp || !data?.expiresAt) {
      return res.status(400).json({ ok: false, message: "OTP invalid." });
    }

    if (Date.now() > Number(data.expiresAt)) {
      await ref.delete().catch(() => {});
      return res.status(400).json({ ok: false, message: "OTP kadaluarsa." });
    }

    if (cleanOtp !== String(data.otp)) {
      return res.status(400).json({ ok: false, message: "OTP salah." });
    }

    // OTP benar -> buat session sederhana (tanpa nextauth): token random disimpan di cookie
    const token = crypto.randomUUID();

    const userRef = db.collection("users").doc(cleanEmail);
    const userSnap = await userRef.get();

    const now = admin.firestore.FieldValue.serverTimestamp();
    if (!userSnap.exists) {
      await userRef.set(
        {
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
          createdAt: now,
          lastLoginAt: now,
          loginCount: 1,
          auth: "email_otp",
        },
        { merge: true }
      );
    } else {
      await userRef.set(
        {
          lastLoginAt: now,
          loginCount: admin.firestore.FieldValue.increment(1),
          auth: "email_otp",
        },
        { merge: true }
      );
    }

    // simpan session token
    await db.collection("sessions").doc(token).set({
      email: cleanEmail,
      createdAt: now,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    // hapus OTP setelah dipakai
    await ref.delete().catch(() => {});

    // set cookie httpOnly
    res.setHeader(
      "Set-Cookie",
      `vip_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "Gagal verifikasi OTP." });
  }
}
