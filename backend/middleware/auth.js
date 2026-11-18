const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "neuronotes_secret_key";

// Verify JWT token
const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Please login first!" });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token is invalid or expired!" });
  }
};

// Only admin can access
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required!" });
    }
    next();
  });
};

module.exports = { requireAuth, requireAdmin };
