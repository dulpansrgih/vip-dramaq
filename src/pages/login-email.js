import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginEmail() {
  const router = useRouter();
  const [step, setStep] = useState("send"); // send | verify
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth-email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.message || "Gagal");
      setStep("verify");
      setMsg("OTP sudah dikirim. Cek inbox/spam.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth-email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.message || "Gagal");
      router.push("/");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white/[0.04] border border-white/10 p-6">
        <div className="text-2xl font-black">Login Email</div>
        <div className="text-xs text-gray-500 mt-1">OTP 6 digit</div>

        <div className="mt-5 space-y-3">
          <input
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {step === "verify" && (
            <input
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none tracking-[6px] text-center font-black"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          )}

          {msg && <div className="text-xs text-gray-400">{msg}</div>}

          {step === "send" ? (
            <button
              disabled={loading}
              onClick={sendOtp}
              className="w-full py-3 rounded-2xl font-black bg-white text-black disabled:opacity-60"
            >
              {loading ? "Mengirim..." : "Kirim OTP"}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                disabled={loading}
                onClick={verifyOtp}
                className="w-full py-3 rounded-2xl font-black bg-white text-black disabled:opacity-60"
              >
                {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
              </button>
              <button
                onClick={() => setStep("send")}
                className="w-full py-3 rounded-2xl font-black bg-white/5 border border-white/10"
              >
                Kirim ulang OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
