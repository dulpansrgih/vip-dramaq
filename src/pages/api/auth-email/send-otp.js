import nodemailer from "nodemailer";
import { getAdmin } from "@/confiq/firebaseAdmin";
import { isValidEmail, makeOtp6, otpExpiresAt } from "@/confiq/auth";


export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    const { email } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ ok: false, message: "Email tidak valid." });
    }

    const otp = makeOtp6();
    const expiresAt = otpExpiresAt(10);

    // save OTP to Firestore (hashed minimal, tapi biar cepat: simpan plain + TTL pendek)
    const admin = getAdmin();
    const db = admin.firestore();

    await db.collection("email_otps").doc(cleanEmail).set(
      {
        email: cleanEmail,
        otp, // kalau mau lebih aman nanti kita hash
        expiresAt,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const from = process.env.SMTP_FROM || "no-reply@example.com";

    await transporter.sendMail({
      from,
      to: cleanEmail,
      subject: "Kode OTP Login • VIP DramaQ",
      text: `Kode OTP kamu: ${otp}\nBerlaku 10 menit.\nJika kamu tidak merasa login, abaikan email ini.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>VIP DramaQ</h2>
          <p>Gunakan kode OTP ini untuk login:</p>
          <div style="font-size:32px;font-weight:800;letter-spacing:6px;margin:16px 0">${otp}</div>
          <p style="color:#666">Berlaku 10 menit. Jika kamu tidak merasa login, abaikan email ini.</p>
        </div>
      `,
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "Gagal kirim OTP." });
  }
}
