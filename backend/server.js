const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const supabase = require("./db/supabase");

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Bahut zyada requests! Thodi der baad try karo." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limit
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "Bahut zyada login attempts! Thodi der baad try karo." },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI routes limit
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "AI requests bahut fast aa rahe hain! Thoda ruko." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Supabase connection check
supabase.from("users").select("count", { count: "exact", head: true })
  .then(({ error }) => {
    if (error) console.error("Supabase connection error:", error.message);
    else console.log("Supabase Connected ✅");
  });

// Routes
const summaryRoutes    = require("./routes/summaryRoutes");
const historyRoutes    = require("./routes/historyRoutes");
const quizRoutes       = require("./routes/quizRoutes");
const authRoutes       = require("./routes/authRoutes");
const progressRoutes   = require("./routes/progressRoutes");
const askRoutes        = require("./routes/askRoutes");
const flashcardsRoutes = require("./routes/flashcardsRoutes");
const adminRoutes      = require("./routes/adminRoutes");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/summary", aiLimiter);
app.use("/api/quiz", aiLimiter);
app.use("/api/ask", aiLimiter);
app.use("/api/flashcards", aiLimiter);

app.use("/api", progressRoutes);
app.use("/api", summaryRoutes);
app.use("/api", historyRoutes);
app.use("/api", quizRoutes);
app.use("/api", askRoutes);
app.use("/api", flashcardsRoutes);
app.use("/api", adminRoutes);

app.get("/", (req, res) => {
  res.json({ status: "NeuroNotes API running 🚀", version: "3.0", db: "Supabase" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Server mein kuch gadbad hui, dobara try karo!" });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err?.message);
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed. Process exited.");
    process.exit(0);
  });

  // Force exit after 3 seconds if connections close slowly
  setTimeout(() => {
    console.error("Forced shutdown due to timeout.");
    process.exit(1);
  }, 3000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));