const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../db/supabase");
const { sendOTP } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "neuronotes_secret_key";

const FAKE_DOMAINS = [
  "mailinator.com","tempmail.com","guerrillamail.com","10minutemail.com",
  "yopmail.com","throwam.com","fakeinbox.com","sharklasers.com","guerrillamailblock.com",
  "grr.la","guerrillamail.info","guerrillamail.biz","guerrillamail.de","guerrillamail.net",
  "guerrillamail.org","spam4.me","trashmail.com","trashmail.me","trashmail.net",
  "dispostable.com","mailnull.com","spamgourmet.com","maildrop.cc","discard.email",
  "getairmail.com","filzmail.com","tempinbox.com","mailtemp.net","safetymail.info",
];

const isFakeEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return FAKE_DOMAINS.includes(domain);
};

// 1. REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password)
      return res.status(400).json({ error: "Please fill in all fields!" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters long!" });
    if (isFakeEmail(email))
      return res.status(400).json({ error: "Fake/disposable emails are not allowed! Please use a real email." });

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing)
      return res.status(400).json({ error: "This email is already registered!" });

    const hashed = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from("users")
      .insert({ name, email, password: hashed })
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(400).json({ error: "Email not found!" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password!" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// 3. FORGOT PASSWORD — instant response, email in background
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: "User not found!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Save OTP to DB
    await supabase
      .from("users")
      .update({ reset_password_otp: otp, otp_expiry: otpExpiry })
      .eq("id", user.id);

    // Send email (await required for Vercel serverless functions)
    await sendOTP(email, otp);

    res.json({ message: "OTP has been sent to your email!" });

  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// 4. RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const now = new Date().toISOString();
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("reset_password_otp", otp)
      .gt("otp_expiry", now)
      .maybeSingle();

    if (!user) return res.status(400).json({ error: "Invalid or expired OTP!" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase
      .from("users")
      .update({ password: hashed, reset_password_otp: null, otp_expiry: null })
      .eq("id", user.id);

    res.json({ message: "Password badal gaya! Ab login karo." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

module.exports = router;