import { useState, useEffect, useCallback } from "react";
import { adminEventsAPI } from "../../services/api";

const STATUS_COLORS = { pending: "#FF7A00", approved: "#22c55e", rejected: "#ef4444" };
const STATUS_BG = { pending: "rgba(255,122,0,0.12)", approved: "rgba(34,197,94,0.12)", rejected: "rgba(239,68,68,0.12)" };

function RejectModal({ event, onClose, onRejected }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await adminEventsAPI.reject(event.id, reason);
      onRejected(res.data);
      onClose();
    } catch (e) { setError(e.response?.data?.message || "Failed to reject"); }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 480, maxWidth: "calc(100vw - 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#333" }}>Reject Event</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#8A7A72", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ background: "#FFF8F0", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{event.title}</div>
          <div style={{ fontSize: 12, color: "#8A7A72", marginTop: 2 }}>by {event.organizerName}</div>
        </div>
        <p style={{ color: "#5A5A5A", fontSize: 14, marginBottom: 10 }}>Provide a reason so the organizer knows what to improve:</p>
        {error && <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Please add venue capacity, confirm date doesn't conflict with semester exams, and include a budget estimate…" style={{ width: "100%", minHeight: 110, border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!reason.trim() || loading} style={{ padding: "10px 24px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: reason.trim() && !loading ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: reason.trim() && !loading ? 1 : 0.5 }}>
            {loading ? "Rejecting…" : "Reject Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, onApproved, onRejected }) {
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      const res = await adminEventsAPI.approve(event.id);
      onApproved(res.data);
    } catch (e) { console.error(e); }
    setApproveLoading(false);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD";
  const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const isPending = event.status === "pending";

  return (
    <>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", border: isPending ? "2px solid rgba(255,122,0,0.3)" : "2px solid transparent" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,122,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="#FF7A00" strokeWidth="2" />
              <path d="M3 10h18M8 3v4M16 3v4" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#333", marginBottom: 4 }}>{event.title}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STATUS_BG[event.status], color: STATUS_COLORS[event.status], textTransform: "uppercase" }}>{event.status}</span>
              <span style={{ fontSize: 12, color: "#8A7A72" }}>by <strong style={{ color: "#5A5A5A" }}>{event.organizerName}</strong></span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 8, background: "#F5F5F5", color: "#5A5A5A", textTransform: "uppercase" }}>{event.category}</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#8A7A72", whiteSpace: "nowrap", textAlign: "right", flexShrink: 0 }}>
            <div>Submitted</div>
            <div style={{ fontWeight: 600, color: "#5A5A5A" }}>{fmtDateShort(event.createdAt)}</div>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          <Detail icon="📍" label="Location" value={event.location ? <a href={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" style={{ color: "#FF7A00", textDecoration: "underline" }}>{event.location}</a> : "—"} />
          <Detail icon="📅" label="Event Date" value={fmtDate(event.date)} />
          <Detail icon="👥" label="Max Participants" value={event.maxParticipants ? `${event.maxParticipants} people` : "—"} />
          {event.status !== "pending" && event.verifiedAt && (
            <Detail icon="✅" label="Verified At" value={fmtDateShort(event.verifiedAt)} />
          )}
        </div>

        {event.description && (
          <div style={{ padding: "0 24px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#8A7A72", marginBottom: 4 }}>DESCRIPTION</div>
            <p style={{ margin: 0, fontSize: 14, color: "#5A5A5A", lineHeight: 1.6 }}>{event.description}</p>
          </div>
        )}

        {event.status === "rejected" && event.rejectionReason && (
          <div style={{ margin: "0 24px 16px", background: "rgba(239,68,68,0.08)", borderLeft: "3px solid #ef4444", borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>REJECTION REASON</div>
            <p style={{ margin: 0, fontSize: 13, color: "#5A5A5A" }}>{event.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div style={{ padding: "16px 24px", borderTop: "1px solid #F0F0F0", display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setRejectModal(true)} style={{ padding: "10px 20px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              ✕ Reject
            </button>
            <button onClick={handleApprove} disabled={approveLoading} style={{ padding: "10px 24px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: approveLoading ? 0.7 : 1 }}>
              {approveLoading ? "Approving…" : "✓ Approve Event"}
            </button>
          </div>
        )}
      </div>

      {rejectModal && (
        <RejectModal event={event} onClose={() => setRejectModal(false)} onRejected={(data) => { onRejected(data); setRejectModal(false); }} />
      )}
    </>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#8A7A72", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{icon} {label}</div>
      <div style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "", label: "All" },
];

export default function AdminVerification() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const LIMIT = 8;

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminEventsAPI.getAll({ page, limit: LIMIT, status: tab || undefined, search: search || undefined })
      .then((res) => { setEvents(res.data.events); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, tab, search]);

  useEffect(() => { load(); }, [load]);

  const handleApproved = (updated) => {
    setEvents((p) => p.map((e) => e.id === updated.id ? { ...e, ...updated } : e));
    if (tab === "pending") setEvents((p) => p.filter((e) => e.id !== updated.id));
    showToast(`"${updated.title}" approved ✓`);
  };

  const handleRejected = (updated) => {
    setEvents((p) => p.map((e) => e.id === updated.id ? { ...e, ...updated } : e));
    if (tab === "pending") setEvents((p) => p.filter((e) => e.id !== updated.id));
    showToast(`"${updated.title}" rejected`);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toast && <div style={{ position: "fixed", top: 24, right: 24, zIndex: 200, background: toast.ok ? "#22c55e" : "#ef4444", color: "#fff", borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "fadeIn 0.2s" }}>{toast.msg}</div>}

      <div>
        <div style={{ fontSize: 13, color: "#8A7A72", marginBottom: 4 }}>
          <span style={{ color: "#FF7A00", fontWeight: 600 }}>Admin Portal</span> › Event Verification
        </div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#333" }}>Event Verification</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8A7A72" }}>Review and approve or reject events submitted by organizers.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#F5F5F5", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }} style={{ padding: "8px 20px", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? "#FF7A00" : "#5A5A5A", background: tab === t.key ? "#fff" : "none", cursor: "pointer", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 400 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
          <circle cx="7" cy="7" r="4.5" stroke="#8A7A72" strokeWidth="1.5" /><path d="M11 11l3 3" stroke="#8A7A72" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search events…" style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: "1.5px solid #E0E0E0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fff" }} />
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <div style={{ width: 36, height: 36, border: "3px solid #FF7A00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : events.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 60, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === "pending" ? "🎉" : "📋"}</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>
            {tab === "pending" ? "All caught up!" : "No events found"}
          </div>
          <div style={{ fontSize: 14, color: "#8A7A72", marginTop: 4 }}>
            {tab === "pending" ? "No pending events waiting for review." : "Try adjusting your filters."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, color: "#8A7A72" }}>{total} event{total !== 1 ? "s" : ""}</div>
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} onApproved={handleApproved} onRejected={handleRejected} />
          ))}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingTop: 8 }}>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, borderRadius: 8, border: p === page ? "none" : "1.5px solid #E0E0E0", background: p === page ? "#FF7A00" : "#fff", color: p === page ? "#fff" : "#333", fontWeight: p === page ? 700 : 400, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
