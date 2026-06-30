import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsAPI } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../common/ConfirmModal";

const statusFilters = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Active", value: "active" },
  { label: "Ended", value: "ended" },
  { label: "Rejected", value: "rejected" },
];

const categoryColors = {
  workshop: { bg: "rgba(255,198,68,0.18)", color: "#735C00" },
  festival: { bg: "rgba(255,94,120,0.15)", color: "#B32444" },
  sports: { bg: "rgba(34,197,94,0.15)", color: "#15803D" },
  academic: { bg: "rgba(59,130,246,0.15)", color: "#1D4ED8" },
  social: { bg: "rgba(255,122,0,0.12)", color: "#CC6200" },
  cultural: { bg: "rgba(255,198,68,0.18)", color: "#735C00" },
  networking: { bg: "rgba(255,94,120,0.15)", color: "#B32444" },
  other: { bg: "rgba(128,128,128,0.12)", color: "#555" },
};

export default function MyEvents() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [publishing, setPublishing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const fetchMyEvents = async () => {
    try {
      const res = await eventsAPI.getMy();
      const myEvents = res.data || [];
      setEvents(myEvents);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = events.filter((e) => {
    if (!filter) return true;
    if (filter === "ended") return isExpired(e.date);
    return e.status === filter;
  }).filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCount = events.length;
  const endedCount = events.filter((e) => isExpired(e.date)).length;
  const pendingCount = events.filter((e) => e.status === "pending").length;
  const approvedCount = events.filter(
    (e) => (e.status === "approved" || e.status === "active") && !isExpired(e.date)
  ).length;
  const rejectedCount = events.filter((e) => e.status === "rejected" || e.status === "cancelled").length;

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await eventsAPI.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id || e._id !== id));
      showToast("success", "Event deleted.");
    } catch {
      showToast("error", "Failed to delete event.");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const handlePublish = async (id) => {
    setPublishing(id);
    try {
      await eventsAPI.publish(id);
      setEvents((prev) =>
        prev.map((e) => (e.id === id || e._id === id ? { ...e, status: "pending" } : e))
      );
      showToast("success", "Event sent for approval!");
    } catch {
      showToast("error", "Failed to publish event.");
    } finally {
      setPublishing(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: { label: "Draft", className: "badge badge-orange" },
      pending: { label: "Pending", className: "badge-yellow" },
      approved: { label: "Approved", className: "badge-green" },
      active: { label: "Active", className: "badge-green" },
      rejected: { label: "Rejected", className: "badge badge-danger" },
      cancelled: { label: "Cancelled", className: "badge badge-danger" },
    };
    const s = map[status?.toLowerCase()] || {
      label: status || "Draft",
      className: "badge badge-orange",
    };
    return <span className={`badge ${s.className}`}>{s.label}</span>;
  };

  const getCategoryStyle = (cat) =>
    categoryColors[cat?.toLowerCase()] || categoryColors.other;

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="org-my-events">
      <div className="org-dashboard-header">
        <div>
          <h1 className="org-dashboard-title">My Events</h1>
          <p className="org-dashboard-subtitle">
            Manage all events you've created
          </p>
        </div>
        <Link to="/organizer/create-event" className="org-create-btn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 4v10M4 9h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Create New Event
        </Link>
      </div>

      <div className="org-stats-grid">
          {[
            { label: "Total Events", value: totalCount, color: "#FF7A00", bg: "rgba(255,122,0,0.1)" },
            { label: "Approved", value: approvedCount, color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
            { label: "Ended", value: endedCount, color: "#8A7A72", bg: "rgba(138,122,114,0.15)" },
            { label: "Pending", value: pendingCount, color: "#FDD348", bg: "rgba(253,211,72,0.15)" },
          ].map((stat) => (
          <div
            key={stat.label}
            className="org-stat-card border-t-[3px] border-solid"
            style={{ borderTopColor: stat.color }}
          >
            <div
              className="org-stat-icon"
              style={{ background: stat.bg, color: stat.color }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect
                  x="3"
                  y="4"
                  width="16"
                  height="15"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M3 9h16"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="org-stat-value">{stat.value}</div>
            <div className="org-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

        <div className="org-section-card">
        <div className="org-section-header">
          <h2 className="org-section-title">
            {filter ? `${filter.charAt(0).toUpperCase() + filter.slice(1)} Events` : "All Events"}
          </h2>
          <div className="org-myevents-status-filters">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`org-myevents-filter-btn ${
                  filter === f.value ? "active" : ""
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="org-myevents-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#8A7A72" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="#8A7A72" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search events by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="org-myevents-search-clear" onClick={() => setSearch("")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="#8A7A72" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="org-table-empty" style={{ padding: "60px 16px" }}>
            {filter
              ? `No ${filter} events found.`
              : "No events yet. Create your first event!"}
          </div>
        ) : (
          <div className="org-myevents-grid">
            {filtered.map((ev) => (
              <div key={ev.id || ev._id} className="org-myevents-card">
                <div className="org-myevents-card-image">
                  {ev.image ? (
                    <img src={ev.image} alt={ev.title} />
                  ) : (
                    <div
                      className="org-myevents-card-placeholder"
                      style={{
                        background: getCategoryStyle(ev.category).bg,
                        color: getCategoryStyle(ev.category).color,
                      }}
                    >
                      {ev.category?.charAt(0).toUpperCase() || "E"}
                    </div>
                  )}
                  <div className="org-myevents-card-badge">
                    {getStatusBadge(ev.status)}
                  </div>
                  <div
                    className="org-myevents-card-cat"
                    style={{
                      background: getCategoryStyle(ev.category).bg,
                      color: getCategoryStyle(ev.category).color,
                    }}
                  >
                    {ev.category}
                  </div>
                  {isExpired(ev.date) && (
                    <div className="org-myevents-card-ended">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M7 4v3.5M7 10h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Event Ended
                    </div>
                  )}
                </div>

                <div className="org-myevents-card-body">
                  <h3 className="org-myevents-card-title">{ev.title}</h3>

                  <div className="org-myevents-card-meta">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect
                        x="1.5"
                        y="2.5"
                        width="11"
                        height="10"
                        rx="2"
                        stroke="#8A7A72"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M1.5 6h11"
                        stroke="#8A7A72"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span>{formatDate(ev.date)}</span>
                    <span className="org-myevents-card-dot">·</span>
                    <span>{formatTime(ev.date)}</span>
                  </div>

                  <div className="org-myevents-card-meta">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1C4.5 1 2.5 3 2.5 5.5c0 3.5 4.5 7.5 4.5 7.5s4.5-4 4.5-7.5C11.5 3 9.5 1 7 1z"
                        stroke="#8A7A72"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="7"
                        cy="5.5"
                        r="1.5"
                        stroke="#8A7A72"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span>{ev.location || "No location set"}</span>
                  </div>

                  {ev.maxParticipants && (
                    <div className="org-myevents-card-meta">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle
                          cx="5"
                          cy="4.5"
                          r="2.5"
                          stroke="#8A7A72"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M1 12.5c0-2.5 2-4 4-4s4 1.5 4 4"
                          stroke="#8A7A72"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10 3.5A2.5 2.5 0 019 8"
                          stroke="#8A7A72"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M13 8.5c0-2-1.5-3-2.5-3"
                          stroke="#8A7A72"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>{ev.maxParticipants} participants max</span>
                    </div>
                  )}

                  <div className="org-myevents-card-actions">
                    <Link
                      to={`/events/${ev.id || ev._id}`}
                      className="org-action-btn"
                      title="View"
                    >
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3C5 3 2.5 5 1 8c1.5 3 4 5 7 5s6-2 7-5c-1-3-3.5-5-7-5z" stroke="currentColor" strokeWidth="2" />
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </Link>
                    {!isExpired(ev.date) && (
                      <Link
                        to={`/organizer/edit-event/${ev.id || ev._id}`}
                        className="org-action-btn"
                        title="Edit"
                      >
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                          <path d="M11.5 2.5l2 2L7 11H5V9l6.5-6.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    )}
                    {ev.status === "draft" && (
                      <button
                        onClick={() => handlePublish(ev.id || ev._id)}
                        disabled={publishing === (ev.id || ev._id)}
                        className="org-action-btn"
                        title="Publish"
                        style={{ color: "#22c55e" }}
                      >
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1v10M4 7l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 13h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(ev.id || ev._id)}
                      className="org-action-btn org-action-btn-danger"
                      title="Delete"
                    >
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M13 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
