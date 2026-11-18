const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");
const { requireAdmin } = require("../middleware/auth");

// GET all users
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(users.map(u => ({ ...u, _id: u.id })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PUT — toggle role
router.put("/admin/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users").select("id, role").eq("id", req.params.id).maybeSingle();
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.id === req.user.id)
      return res.status(400).json({ error: "You cannot change your own role!" });
    const newRole = user.role === "admin" ? "user" : "admin";
    await supabase.from("users").update({ role: newRole }).eq("id", req.params.id);
    res.json({ message: `Role changed to ${newRole}`, role: newRole });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

// DELETE user
router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: "You cannot delete yourself!" });
    await supabase.from("history").delete().eq("user_id", req.params.id);
    await supabase.from("progress").delete().eq("user_id", req.params.id);
    await supabase.from("users").delete().eq("id", req.params.id);
    res.json({ success: true, message: "User and their history have been deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// GET user's history (admin)
router.get("/admin/users/:id/history", requireAdmin, async (req, res) => {
  try {
    const { data: history } = await supabase
      .from("history").select("*")
      .eq("user_id", req.params.id)
      .order("created_at", { ascending: false }).limit(50);
    res.json((history || []).map(h => ({ ...h, _id: h.id })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// GET stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const { count: totalUsers } = await supabase
      .from("users").select("*", { count: "exact", head: true });
    const { count: totalAdmins } = await supabase
      .from("users").select("*", { count: "exact", head: true }).eq("role", "admin");
    const { count: totalHistory } = await supabase
      .from("history").select("*", { count: "exact", head: true });
    const { data: recentUsers } = await supabase
      .from("users").select("id, name, email, role, created_at")
      .order("created_at", { ascending: false }).limit(5);
    res.json({
      totalUsers, totalAdmins, totalHistory,
      recentUsers: (recentUsers || []).map(u => ({ ...u, _id: u.id })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
