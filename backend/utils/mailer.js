const nodemailer = require("nodemailer");

// 1. Transporter setup (Email bhejane wala engine)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Tera gmail (e.g. akshat@gmail.com)
    pass: process.env.EMAIL_PASS, // Tera 16-digit "App Password"
  },
});

// 2. OTP bhejane ka function
const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"NeuroNotes AI Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - NeuroNotes OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #ff2d78;">NeuroNotes AI</h2>
        <p>Bhai, tera password reset karne ka OTP ye raha:</p>
        <h1 style="background: #fdf6ee; padding: 10px; display: inline-block; letter-spacing: 5px; color: #1a0a10;">${otp}</h1>
        <p>Ye OTP 10 minute mein expire ho jayega. Kisi ke sath share mat karna!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = { sendOTP };