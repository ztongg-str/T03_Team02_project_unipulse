import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { historyAPI } from "../../services/api";
export default function History() {
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await historyAPI.getPast();
      setPast(res.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredPast =
    filter === "all"
      ? past
      : filter === "attended"
        ? past.filter((e) => e.attended)
        : past.filter((e) => !e.attended);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container history-page">
      {/* Hero Section */}
      <section className="history-hero">
        <h1 className="history-hero-title">Event History</h1>
        <p className="history-hero-sub">Relive your past campus moments.</p>
      </section>

      {/* Past Events */}
      <section className="history-section">
        <div className="history-section-header with-border">
          <div className="history-section-heading" onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer' }}>
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <path d="M4 10L12 18L20 10" stroke="#85736E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Past Events</h2>
          </div>
          <div className="history-filter-group">
            <button
              className={`history-filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`history-filter-btn ${filter === "attended" ? "active" : ""} ${
                filter === "attended" ? "bg-orange text-white font-bold" : ""
              }`}
              onClick={() => setFilter("attended")}
            >
              Attended
            </button>
          </div>
        </div>

        {!collapsed && (
          filteredPast.length === 0 ? (
            <div className="history-empty">
              <p>No past events yet.</p>
            </div>
          ) : (
            <>
              <div className="history-past-list">
                {filteredPast.map((ev) => {
                  const isAttended = ev.attended || ev.status === "attended";
                  const isExpired = ev.status === "expired";
                  const isMissed = ev.status === "missed" || (!isAttended && ev.status !== "refunded" && ev.status !== "expired" && ev.status !== "approved");
                  const isRefunded = ev.status === "refunded";

                  let statusLabel;
                  let statusBadge;
                  if (isAttended) {
                    statusLabel = "Attended";
                    statusBadge = <span className="hpl-badge attended"><svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M1.5 5.5L7 11L12.5 5.5" stroke="#1A8038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Attended</span>;
                  } else if (isRefunded) {
                    statusLabel = "Not Attended";
                    statusBadge = <span className="hpl-badge refunded"><svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M1.5 5.5L7 11L12.5 5.5" stroke="#85736E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Refunded</span>;
                  } else if (isExpired) {
                    statusLabel = "Expired";
                    statusBadge = <span className="hpl-badge missed"><svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M1.5 5.5L7 11L12.5 5.5" stroke="#8A7A72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Expired</span>;
                  } else if (isMissed) {
                    statusLabel = "Not Attended";
                    statusBadge = <span className="hpl-badge missed"><svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M1.5 5.5L7 11L12.5 5.5" stroke="#BA1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Missed</span>;
                  } else {
                    statusLabel = "";
                    statusBadge = null;
                  }

                  return (
                    <div key={ev.id} className={`hpl-card ${!isAttended ? "hpl-card-muted" : ""}`}>
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
                          {statusLabel}{ev.description && !isExpired ? ` \u2022 ${ev.description}` : ""}
                        </p>
                      </div>

                      <div className="hpl-card-actions">
                        <div className="hpl-card-status">
                          {statusBadge}
                          <div className="hpl-card-xp">
                            {isAttended && ev.xpEarned > 0
                              ? `Earned ${ev.xpEarned} XP`
                              : (isMissed || isRefunded || isExpired) && "No XP Awarded"}
                          </div>
                        </div>
                        <Link to={`/events/${ev.eventId || ev.id}`} className="hpl-card-arrow">
                          <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                            <path d="M4 10L12 18L20 10" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredPast.length > 0 && filteredPast.length >= 3 && (
                <div className="history-load-more">
                  <button className="hpl-load-btn">Load More</button>
                </div>
              )}
            </>
          )
        )}
      </section>
    </div>
  );
}
