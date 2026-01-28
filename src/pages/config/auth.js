export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function makeOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function otpExpiresAt(minutes = 10) {
  return Date.now() + minutes * 60 * 1000;
}
