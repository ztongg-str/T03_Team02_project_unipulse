import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { attendanceAPI } from "../../services/api";

const STATUS_STYLES = {
  Registered: { bg: "#FFF3E0", color: "#E65100", label: "Registered" },
  Attended: { bg: "#E8F5E9", color: "#2E7D32", label: "Attended" },
  Missing: { bg: "#FFEBEE", color: "#C62828", label: "Missing" },
};

export default function UserHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await attendanceAPI.getMyHistory();
      setHistory(res.data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredHistory =
    filter === "all"
      ? history
      : history.filter((e) => e.status === filter);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container history-page">
      <section className="history-hero">
        <h1 className="history-hero-title">My Attendance History</h1>
        <p className="history-hero-sub">Track all your event registrations and attendance status.</p>
      </section>

      <section className="history-section">
        <div className="history-section-header with-border">
          <div className="history-section-heading">
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
              <path d="M4 10L12 18L20 10" stroke="#85736E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>All Registrations</h2>
          </div>
          <div className="history-filter-group">
            <button
              className={`history-filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`history-filter-btn ${filter === "Registered" ? "active" : ""}`}
              onClick={() => setFilter("Registered")}
            >
              Registered
            </button>
            <button
              className={`history-filter-btn ${filter === "Attended" ? "active" : ""}`}
              onClick={() => setFilter("Attended")}
            >
              Attended
            </button>
            <button
              className={`history-filter-btn ${filter === "Missing" ? "active" : ""}`}
              onClick={() => setFilter("Missing")}
            >
              Missing
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="history-empty">
            <p>No registrations found.</p>
            <Link to="/events" className="btn btn-primary inline-flex mt-4">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="history-past-list">
            {filteredHistory.map((ev) => {
              const statusStyle = STATUS_STYLES[ev.status] || STATUS_STYLES.Registered;

              return (
                <div
                  key={ev.id}
                  className="hpl-card"
                  style={{
                    opacity: ev.status === "Missing" ? 0.6 : 1,
                  }}
                >
                  <div className="hpl-card-img">
                    {ev.image ? (
                      <img src={ev.image} alt={ev.title} />
                    ) : (
                      <div className="hpl-card-img-placeholder" />
                    )}
                  </div>

                  <div className="hpl-card-body">
                    <div className="hpl-card-meta">
                      <span className="hpl-meta-date">{formatDate(ev.date).toUpperCase()}</span>
                      <span className="hpl-meta-dot" />
                      <span className="hpl-meta-cat">{ev.category?.toUpperCase()}</span>
                    </div>
                    <h4 className="hpl-card-title">{ev.title}</h4>
                    <p className="hpl-card-sub">
                      {ev.location && (
                        <span style={{ color: "#8D6E63", fontSize: 13 }}>
                          {ev.location} &middot; {formatTime(ev.date)}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="hpl-card-actions">
                    <div className="hpl-card-status">
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {ev.status === "Attended" && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                        {ev.status === "Missing" && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M9 3L3 9M3 3l6 6" />
                          </svg>
                        )}
                        {ev.status === "Registered" && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="6" cy="6" r="4" />
                          </svg>
                        )}
                        {statusStyle.label}
                      </span>
                    </div>
                    <Link to={`/events/${ev.eventId}`} className="hpl-card-arrow">
                      <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                        <path d="M4 10L12 18L20 10" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
