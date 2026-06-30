import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";

const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: "#fff", borderRadius: 16, padding: "24px 28px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flex: "1 1 180px", minWidth: 0,
  }}>
    <div style={{ fontSize: 13, color: "#8A7A72", fontWeight: 500, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 36, fontWeight: 800, color: color || "#333", lineHeight: 1 }}>{value ?? "—"}</div>
    {sub && <div style={{ fontSize: 12, color: "#8A7A72", marginTop: 6 }}>{sub}</div>}
  </div>
);

const statusColor = (s) => ({
  pending: "#FF7A00", approved: "#22c55e", rejected: "#ef4444",
  live: "#22c55e", draft: "#8A7A72", past: "#8A7A72",
}[s] || "#8A7A72");

const statusBg = (s) => ({
  pending: "rgba(255,122,0,0.12)", approved: "rgba(34,197,94,0.12)", rejected: "rgba(239,68,68,0.12)",
}[s] || "rgba(138,122,114,0.12)");

const roleBadge = { admin: "#FF7A00", organizer: "#2EC4B6", student: "#8A7A72" };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminAPI.getDashboard()
      .then((res) => setData(res.data))
      .catch((e) => setError(e.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 36, height: 36, border: "3px solid #FF7A00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, color: "#ef4444", textAlign: "center" }}>{error}</div>
  );

  const d = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: "#8A7A72" }}>
        <span style={{ color: "#FF7A00", fontWeight: 600 }}>Admin Portal</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>Dashboard</span>
      </div>

      {/* Stat row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Total Users" value={d.totalUsers} sub={`${d.usersByRole.student} students · ${d.usersByRole.organizer} organizers`} color="#FF7A00" />
        <StatCard label="Total Events" value={d.totalEvents} sub={`${d.eventsByStatus.approved} approved`} color="#2EC4B6" />
        <StatCard label="Pending Verification" value={d.pendingVerifications} sub="awaiting review" color={d.pendingVerifications > 0 ? "#ef4444" : "#22c55e"} />
        <StatCard label="Total Registrations" value={d.totalRegistrations} color="#333" />
        <StatCard label="Pending Reports" value={d.pendingReports} color={d.pendingReports > 0 ? "#ef4444" : "#333"} />
      </div>

      {/* Event status breakdown */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#333", marginBottom: 16 }}>Event Status Breakdown</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(d.eventsByStatus).map(([status, count]) => (
            <div key={status} style={{
              padding: "10px 20px", borderRadius: 12,
              background: statusBg(status), display: "flex", flexDirection: "column", gap: 4, minWidth: 110,
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: statusColor(status) }}>{count}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: statusColor(status), textTransform: "capitalize" }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Events */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>Recent Events</div>
            <Link to="/admin/events" style={{ fontSize: 13, color: "#FF7A00", fontWeight: 600, textDecoration: "none" }}>See all →</Link>
          </div>
          {d.recentEvents.length === 0
            ? <div style={{ color: "#8A7A72", fontSize: 14, textAlign: "center", padding: 20 }}>No events yet</div>
            : d.recentEvents.map((ev) => (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: "#8A7A72" }}>{ev.organizerName}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: statusBg(ev.status), color: statusColor(ev.status), textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {ev.status}
                </span>
              </div>
            ))
          }
        </div>

        {/* Recent Users */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>Recent Users</div>
            <Link to="/admin/users" style={{ fontSize: 13, color: "#FF7A00", fontWeight: 600, textDecoration: "none" }}>See all →</Link>
          </div>
          {d.recentUsers.length === 0
            ? <div style={{ color: "#8A7A72", fontSize: 14, textAlign: "center", padding: 20 }}>No users yet</div>
            : d.recentUsers.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FF7A00", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {u.fullName?.charAt(0) || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{u.fullName}</div>
                  <div style={{ fontSize: 12, color: "#8A7A72" }}>@{u.username}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${roleBadge[u.role]}20`, color: roleBadge[u.role], textTransform: "capitalize", whiteSpace: "nowrap" }}>
                  {u.role}
                </span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Quick actions */}
      {d.pendingVerifications > 0 && (
        <div style={{ background: "rgba(255,122,0,0.08)", border: "1px solid rgba(255,122,0,0.3)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="#FF7A00" strokeWidth="2" />
            <path d="M11 7v5M11 15v1" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#FF7A00" }}>
              {d.pendingVerifications} event{d.pendingVerifications !== 1 ? "s" : ""} waiting for verification
            </div>
            <div style={{ fontSize: 13, color: "#8A7A72" }}>Review and approve or reject pending event submissions</div>
          </div>
          <Link to="/admin/verification" style={{ padding: "8px 18px", background: "#FF7A00", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            Review Now
          </Link>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
