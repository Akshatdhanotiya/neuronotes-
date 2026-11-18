const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");
const jwt = require("jsonwebtoken");

const getUserId = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return "guest";
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || "guest";
  } catch {
    return "guest";
  }
};

router.get("/history", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { data: history, error } = await supabase
      .from("history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    const mapped = (history || []).map(h => ({ ...h, _id: h.id }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.delete("/history/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { error } = await supabase
      .from("history")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

module.exports = router;