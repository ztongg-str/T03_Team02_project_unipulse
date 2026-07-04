import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminEventsAPI } from "../../services/api";

const STATUS_COLORS = { pending: "#FF7A00", approved: "#22c55e", rejected: "#ef4444" };
const STATUS_BG = { pending: "rgba(255,122,0,0.12)", approved: "rgba(34,197,94,0.12)", rejected: "rgba(239,68,68,0.12)" };

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 480, maxWidth: "calc(100vw - 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#333" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#8A7A72", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const LIMIT = 10;

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };
  const setAL = (id, v) => setActionLoading((p) => ({ ...p, [id]: v }));

  const load = useCallback(() => {
    setLoading(true);
    adminEventsAPI.getAll({ page, limit: LIMIT, search: search || undefined, status: statusFilter || undefined, category: categoryFilter || undefined })
      .then((res) => { setEvents(res.data.events); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (ev) => {
    setAL(ev.id + "_a", true);
    try {
      const res = await adminEventsAPI.approve(ev.id);
      setEvents((p) => p.map((e) => e.id === ev.id ? { ...e, status: res.data.status } : e));
      showToast(`"${ev.title}" approved`);
    } catch (e) { showToast(e.response?.data?.message || "Failed", false); }
    setAL(ev.id + "_a", false);
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setAL(rejectTarget.id + "_r", true);
    try {
      const res = await adminEventsAPI.reject(rejectTarget.id, rejectReason);
      setEvents((p) => p.map((e) => e.id === rejectTarget.id ? { ...e, status: res.data.status, rejectionReason: res.data.rejectionReason } : e));
      showToast(`"${rejectTarget.title}" rejected`);
      setRejectTarget(null); setRejectReason("");
    } catch (e) { showToast(e.response?.data?.message || "Failed", false); }
    setAL(rejectTarget.id + "_r", false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setAL(deleteTarget.id + "_d", true);
    try {
      await adminEventsAPI.delete(deleteTarget.id);
      setEvents((p) => p.filter((e) => e.id !== deleteTarget.id));
      setTotal((t) => t - 1);
      showToast(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
    } catch (e) { showToast(e.response?.data?.message || "Failed", false); }
    setAL(deleteTarget.id + "_d", false);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toast && <div style={{ position: "fixed", top: 24, right: 24, zIndex: 200, background: toast.ok ? "#22c55e" : "#ef4444", color: "#fff", borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "fadeIn 0.2s" }}>{toast.msg}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: "#8A7A72", marginBottom: 4 }}>
            <span style={{ color: "#FF7A00", fontWeight: 600 }}>Admin Portal</span> › Events
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#333" }}>Event Management</h2>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="7" cy="7" r="4.5" stroke="#8A7A72" strokeWidth="1.5" /><path d="M11 11l3 3" stroke="#8A7A72" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title, organizer, or venue…" style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: "1.5px solid #E0E0E0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fff" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: "10px 16px", border: "1.5px solid #E0E0E0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer" }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} style={{ padding: "10px 16px", border: "1.5px solid #E0E0E0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer" }}>
          <option value="">All Types</option>
          <option value="academic">Academic</option>
          <option value="social">Social</option>
          <option value="sports">Sports</option>
          <option value="career">Career</option>
          <option value="workshop">Workshop</option>
          <option value="conference">Conference</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #FF7A00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F5F5F5" }}>
                    {["Title", "Status", "Organizer", "Type", "Date", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#8A7A72" }}>No events found</td></tr>
                  ) : events.map((ev) => (
                    <tr key={ev.id} style={{ borderTop: "1px solid #F0F0F0" }} onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"} onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                      <td style={{ padding: "14px 16px", maxWidth: 240 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                        <div style={{ fontSize: 12, color: "#8A7A72", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.location?.includes(",") ? <a href={`https://www.google.com/maps?q=${ev.location}`} target="_blank" rel="noopener noreferrer" style={{ color: "#FF7A00", textDecoration: "underline" }}>{ev.location}</a> : ev.location}</div>
                        {ev.status === "rejected" && ev.rejectionReason && (
                          <div style={{ fontSize: 11, color: "#ef4444", marginTop: 2, fontStyle: "italic" }} title={ev.rejectionReason}>
                            ↩ {ev.rejectionReason.length > 40 ? ev.rejectionReason.slice(0, 40) + "…" : ev.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: STATUS_BG[ev.status] || "rgba(138,122,114,0.12)", color: STATUS_COLORS[ev.status] || "#8A7A72", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {ev.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#5A5A5A", whiteSpace: "nowrap" }}>{ev.organizerName}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 8, background: "#F5F5F5", color: "#5A5A5A", textTransform: "uppercase" }}>{ev.category}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#8A7A72", whiteSpace: "nowrap" }}>{fmtDate(ev.date)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
                          {ev.status === "pending" && (
                            <>
                              <button onClick={() => handleApprove(ev)} disabled={actionLoading[ev.id + "_a"]} style={{ padding: "6px 12px", background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                ✓ Approve
                              </button>
                              <button onClick={() => { setRejectTarget(ev); setRejectReason(""); }} style={{ padding: "6px 12px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                ✕ Reject
                              </button>
                            </>
                          )}
                          {ev.status === "approved" && (
                            <button onClick={() => { setRejectTarget(ev); setRejectReason(""); }} style={{ padding: "6px 12px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                              Revoke
                            </button>
                          )}
                          {ev.status === "rejected" && (
                            <button onClick={() => handleApprove(ev)} disabled={actionLoading[ev.id + "_a"]} style={{ padding: "6px 12px", background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                              Re-approve
                            </button>
                          )}
                          <Link to={`/admin/events/edit/${ev.id}`} style={{ padding: "6px 10px", border: "1.5px solid #E0E0E0", color: "#8A7A72", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center" }} title="Edit">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2L7 11H5V9l6.5-6.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </Link>
                          <button onClick={() => setDeleteTarget(ev)} title="Delete" style={{ padding: "6px 10px", border: "1.5px solid #E0E0E0", color: "#8A7A72", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 12 }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M5 3V2h4v1M6 6v4M8 6v4M3 3l.7 8.3A1 1 0 004.7 12h4.6a1 1 0 001-.7L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #F0F0F0", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#8A7A72" }}>Showing {events.length} of {total} events</span>
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 8, border: p === page ? "none" : "1.5px solid #E0E0E0", background: p === page ? "#FF7A00" : "none", color: p === page ? "#fff" : "#333", fontWeight: p === page ? 700 : 400, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>{p}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <Modal title={`Reject: "${rejectTarget.title}"`} onClose={() => setRejectTarget(null)}>
          <p style={{ color: "#5A5A5A", fontSize: 14, marginBottom: 12 }}>Provide a clear reason so the organizer knows what to fix:</p>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Missing venue capacity details, date conflicts with existing approved event…" style={{ width: "100%", minHeight: 100, border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setRejectTarget(null)} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button onClick={handleReject} disabled={!rejectReason.trim() || actionLoading[rejectTarget.id + "_r"]} style={{ padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: rejectReason.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: rejectReason.trim() ? 1 : 0.5 }}>
              {actionLoading[rejectTarget.id + "_r"] ? "Rejecting…" : "Reject Event"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Delete Event?" onClose={() => setDeleteTarget(null)}>
          <p style={{ color: "#5A5A5A", fontSize: 14, marginBottom: 24 }}>
            This will permanently delete <strong>"{deleteTarget.title}"</strong> and all associated registrations. This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setDeleteTarget(null)} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button onClick={handleDelete} disabled={actionLoading[deleteTarget.id + "_d"]} style={{ padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {actionLoading[deleteTarget.id + "_d"] ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
