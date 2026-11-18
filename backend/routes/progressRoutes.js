const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "neuronotes_secret_key";

const getUser = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    return jwt.verify(token, JWT_SECRET);
  } catch { return null; }
};

router.get("/progress", async (req, res) => {
  const user = getUser(req);
  if (!user) return res.json({ totalQuizzes: 0, totalCorrect: 0, totalSummaries: 0 });
  try {
    const { data } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return res.json({ totalQuizzes: 0, totalCorrect: 0, totalSummaries: 0 });
    res.json({
      totalQuizzes: data.total_quizzes,
      totalCorrect: data.total_correct,
      totalSummaries: data.total_summaries,
    });
  } catch { res.status(500).json({ error: "Failed" }); }
});

router.post("/progress/quiz", async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Login required" });
  const { correct } = req.body;
  try {
    const { data: existing } = await supabase
      .from("progress").select("*").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("progress").update({
        total_quizzes: existing.total_quizzes + 1,
        total_correct: existing.total_correct + (correct || 0),
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    } else {
      await supabase.from("progress").insert({
        user_id: user.id, total_quizzes: 1,
        total_correct: correct || 0, total_summaries: 0,
      });
    }
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed" }); }
});

router.post("/progress/summary", async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Login required" });
  try {
    const { data: existing } = await supabase
      .from("progress").select("*").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("progress").update({
        total_summaries: existing.total_summaries + 1,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    } else {
      await supabase.from("progress").insert({
        user_id: user.id, total_quizzes: 0, total_correct: 0, total_summaries: 1,
      });
    }
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed" }); }
});

module.exports = router;