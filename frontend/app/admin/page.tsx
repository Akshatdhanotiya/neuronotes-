"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5001";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0608; --surface: #110810; --card: #1a0f14;
    --border: rgba(255,255,255,0.07); --pink: #ff2d78; --pink-light: #ff6ea8;
    --pink-soft: rgba(255,45,120,0.12); --text: #f0e8ec; --muted: #7a6570; --muted2: #b89aa6;
    --green: #22c55e; --red: #ef4444; --yellow: #f59e0b;
  }
  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; }
  .admin-wrap { min-height: 100vh; display: flex; flex-direction: column; }
  .admin-nav { height: 64px; background: rgba(10,6,8,0.95); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 50; }
  .admin-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 0.1em; color: var(--text); }
  .admin-logo span { color: var(--pink); }
  .admin-badge { background: linear-gradient(135deg, var(--pink), #e8005a); color: white; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.15em; padding: 3px 10px; border-radius: 100px; text-transform: uppercase; margin-left: 10px; }
  .nav-user-info { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: var(--muted2); }
  .back-btn { padding: 7px 16px; border-radius: 8px; border: 1.5px solid var(--border); background: transparent; color: var(--muted2); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .back-btn:hover { border-color: var(--pink); color: var(--pink); background: var(--pink-soft); }
  .admin-body { flex: 1; padding: 2rem; max-width: 1300px; margin: 0 auto; width: 100%; }
  .admin-title { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; letter-spacing: 0.05em; margin-bottom: 0.3rem; }
  .admin-title span { color: var(--pink); }
  .admin-sub { font-size: 0.85rem; color: var(--muted); margin-bottom: 2rem; }
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: var(--card); border: 1.5px solid var(--border); border-radius: 16px; padding: 1.25rem 1.5rem; position: relative; overflow: hidden; transition: all 0.25s; }
  .stat-card:hover { border-color: rgba(255,45,120,0.3); box-shadow: 0 8px 28px rgba(255,45,120,0.1); transform: translateY(-3px); }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--pink), var(--pink-light)); }
  .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; color: var(--pink); line-height: 1; }
  .stat-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }
  .stat-icon { font-size: 1.8rem; position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%); opacity: 0.2; }
  .section-title { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--pink); margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .search-bar { background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 11px 16px; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.88rem; outline: none; width: 100%; max-width: 360px; margin-bottom: 1rem; transition: all 0.2s; }
  .search-bar:focus { border-color: var(--pink); box-shadow: 0 0 0 3px rgba(255,45,120,0.1); }
  .search-bar::placeholder { color: var(--muted); }
  .users-table { width: 100%; border-collapse: collapse; background: var(--card); border-radius: 16px; overflow: hidden; border: 1.5px solid var(--border); }
  .users-table th { background: rgba(255,45,120,0.08); padding: 12px 16px; text-align: left; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--pink); border-bottom: 1.5px solid var(--border); }
  .users-table td { padding: 13px 16px; font-size: 0.85rem; color: var(--muted2); border-bottom: 1px solid var(--border); vertical-align: middle; }
  .users-table tr:last-child td { border-bottom: none; }
  .users-table tr:hover td { background: rgba(255,45,120,0.04); }
  .user-name { font-weight: 700; color: var(--text); font-size: 0.9rem; }
  .user-email { font-size: 0.78rem; color: var(--muted); margin-top: 2px; }
  .role-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 100px; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
  .role-admin { background: rgba(255,45,120,0.15); color: var(--pink); border: 1px solid rgba(255,45,120,0.3); }
  .role-user { background: rgba(255,255,255,0.05); color: var(--muted2); border: 1px solid var(--border); }
  .action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
  .btn { padding: 6px 14px; border-radius: 8px; border: 1.5px solid; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .btn-promote { border-color: rgba(255,45,120,0.4); color: var(--pink); background: var(--pink-soft); }
  .btn-promote:hover { background: var(--pink); color: white; box-shadow: 0 4px 14px rgba(255,45,120,0.3); }
  .btn-demote { border-color: rgba(245,158,11,0.4); color: var(--yellow); background: rgba(245,158,11,0.08); }
  .btn-demote:hover { background: var(--yellow); color: #1a0a10; }
  .btn-history { border-color: var(--border); color: var(--muted2); background: transparent; }
  .btn-history:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
  .btn-delete { border-color: rgba(239,68,68,0.4); color: var(--red); background: rgba(239,68,68,0.08); }
  .btn-delete:hover { background: var(--red); color: white; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
  .modal-box { background: var(--surface); border: 1.5px solid var(--border); border-radius: 20px; width: 90%; max-width: 680px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,0.5); animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes popIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .modal-head { padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.05em; color: var(--text); }
  .modal-title span { color: var(--pink); }
  .modal-close { float: right; background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1.2rem; line-height: 1; padding: 4px; transition: color 0.2s; }
  .modal-close:hover { color: var(--pink); }
  .modal-body { padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1; }
  .history-item { background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 1rem; margin-bottom: 8px; animation: fadeUp 0.3s ease both; transition: border-color 0.2s; }
  .history-item:hover { border-color: rgba(255,45,120,0.25); }
  .history-url { font-size: 0.78rem; color: var(--pink); font-weight: 700; margin-bottom: 4px; word-break: break-all; }
  .history-summary { font-size: 0.78rem; color: var(--muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .history-meta { font-size: 0.68rem; color: var(--muted); margin-top: 6px; }
  .empty-state { text-align: center; padding: 3rem; color: var(--muted); }
  .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
  .loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 2rem; color: var(--muted); font-size: 0.88rem; }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--pink); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .access-denied { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; text-align: center; }
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 12px 20px; font-size: 0.85rem; font-weight: 600; color: var(--text); box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: fadeUp 0.3s ease; z-index: 9999; display: flex; align-items: center; gap: 8px; }
  .toast.success { border-color: rgba(34,197,94,0.4); }
  .toast.error { border-color: rgba(239,68,68,0.4); }
`;

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [historyUser, setHistoryUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("nn_token") || "" : "";

  useEffect(() => {
    const u = localStorage.getItem("nn_user");
    const t = localStorage.getItem("nn_token");
    if (!u || !t) { router.push("/"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    if (parsed.role === "admin") fetchAll();
    else setLoading(false);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchStats()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const d = await res.json();
      if (Array.isArray(d)) setUsers(d);
    } catch { showToast("Failed to fetch users!", "error"); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const d = await res.json();
      setStats(d);
    } catch {}
  };

  const toggleRole = async (userId: string) => {
    setActionLoading(userId + "_role");
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/role`, {
        method: "PUT", headers: { Authorization: `Bearer ${getToken()}` }
      });
      const d = await res.json();
      if (d.error) showToast(d.error, "error");
      else {
        showToast(`Role changed to ${d.role}! ✅`);
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: d.role } : u));
        fetchStats();
      }
    } catch { showToast("Failed to update role!", "error"); }
    setActionLoading(null);
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All of their history will also be deleted!`)) return;
    setActionLoading(userId + "_del");
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` }
      });
      const d = await res.json();
      if (d.error) showToast(d.error, "error");
      else { showToast(`${name} has been deleted!`); setUsers(prev => prev.filter(u => u._id !== userId)); fetchStats(); }
    } catch { showToast("Failed to delete user!", "error"); }
    setActionLoading(null);
  };

  const openHistory = async (u: any) => {
    setHistoryUser(u); setHistory([]); setHistoryLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users/${u._id}/history`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const d = await res.json();
      setHistory(Array.isArray(d) ? d : []);
    } catch { showToast("Failed to retrieve history!", "error"); }
    setHistoryLoading(false);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <><style>{styles}</style><div className="loading" style={{ minHeight: "100vh" }}><div className="spinner" /><span>Loading Admin Panel...</span></div></>;

  if (!user || user.role !== "admin") return (
    <><style>{styles}</style>
      <div className="access-denied">
        <div style={{ fontSize: "4rem" }}>🚫</div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "4rem", color: "var(--pink)" }}>ACCESS DENIED</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>You do not have admin access!</p>
        <button className="back-btn" style={{ marginTop: "1rem" }} onClick={() => router.push("/")}>← Go Back</button>
      </div>
    </>
  );

  return (
    <><style>{styles}</style>
      {toast && <div className={`toast ${toast.type}`}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}</div>}

      {historyUser && (
        <div className="modal-overlay" onClick={() => setHistoryUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <button className="modal-close" onClick={() => setHistoryUser(null)}>✕</button>
              <div className="modal-title">History of <span>{historyUser.name}</span></div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px" }}>{historyUser.email}</div>
            </div>
            <div className="modal-body">
              {historyLoading ? <div className="loading"><div className="spinner" /><span>Loading...</span></div>
                : history.length === 0 ? <div className="empty-state"><div className="empty-icon">📭</div><p>No history found</p></div>
                : history.map((item, i) => (
                  <div key={item._id} className="history-item" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="history-url">{item.input?.substring(0, 80)}{item.input?.length > 80 ? "..." : ""}</div>
                    <div className="history-summary">{item.summary}</div>
                    <div className="history-meta">🌐 {item.language} · 🕐 {fmt(item.createdAt)}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      <div className="admin-wrap">
        <nav className="admin-nav">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="admin-logo">NEURO<span>NOTES</span></div>
            <span className="admin-badge">Admin Panel</span>
          </div>
          <div className="nav-user-info">
            <span>👑 {user.name}</span>
            <button className="back-btn" onClick={() => router.push("/")}>← Dashboard</button>
          </div>
        </nav>

        <div className="admin-body">
          <div className="admin-title">ADMIN <span>DASHBOARD</span></div>
          <div className="admin-sub">Manage data, roles, and history of all users</div>

          {stats && (
            <div className="stats-row">
              {[
                { num: stats.totalUsers, label: "Total Users", icon: "👥" },
                { num: stats.totalAdmins, label: "Admins", icon: "👑" },
                { num: stats.totalHistory, label: "Total Summaries", icon: "📝" },
                { num: stats.totalUsers - stats.totalAdmins, label: "Regular Users", icon: "🙋" },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-icon">{s.icon}</div>
                </div>
              ))}
            </div>
          )}

          <div className="section-title">All Users</div>
          <input className="search-bar" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />

          <div style={{ overflowX: "auto" }}>
            <table className="users-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td><div className="user-name">{u.name}</div><div className="user-email">{u.email}</div></td>
                    <td><span className={`role-badge ${u.role === "admin" ? "role-admin" : "role-user"}`}>{u.role === "admin" ? "👑 Admin" : "🙋 User"}</span></td>
                    <td style={{ fontSize: "0.78rem" }}>{fmt(u.createdAt)}</td>
                    <td>
                      <div className="action-btns">
                        <button className={`btn ${u.role === "admin" ? "btn-demote" : "btn-promote"}`} onClick={() => toggleRole(u._id)} disabled={!!actionLoading || u._id === user.id}>
                          {actionLoading === u._id + "_role" ? "..." : u.role === "admin" ? "⬇ Demote" : "⬆ Make Admin"}
                        </button>
                        <button className="btn btn-history" onClick={() => openHistory(u)}>📋 History</button>
                        <button className="btn btn-delete" onClick={() => deleteUser(u._id, u.name)} disabled={!!actionLoading || u._id === user.id}>
                          {actionLoading === u._id + "_del" ? "..." : "🗑 Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="empty-state" style={{ marginTop: "2rem" }}><div className="empty-icon">🔍</div><p>No users found</p></div>}
        </div>
      </div>
    </>
  );
}