import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { historyAPI } from "../../services/api";

export default function History() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [movedNotice, setMovedNotice] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const moveRes = await historyAPI.moveExpired();
      if (moveRes?.data?.moved > 0) {
        setMovedNotice(moveRes.data.moved);
      }
    } catch (err) {
      console.error("moveExpired failed:", err);
    }
    try {
      const [upRes, pastRes] = await Promise.all([
        historyAPI.getUpcoming(),
        historyAPI.getPast(),
      ]);
      setUpcoming(upRes.data || []);
      setPast(pastRes.data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
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

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    if (diff < 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "TODAY";
    if (days === 1) return "TOMORROW";
    return `${days} DAYS`;
  };

  const filteredPast =
    filter === "all"
      ? past
      : filter === "attended"
        ? past.filter((e) => e.attended)
        : past.filter((e) => !e.attended);

  const mainUpcoming = upcoming[0] || null;
  const sideUpcoming = upcoming.slice(1, 3);

  const categoryColors = {
    workshop: { bg: "#F4DED7", text: "#241A17" },
    social: { bg: "#FFDBCC", text: "#803D00" },
    tech: { bg: "#FFDBCC", text: "#803D00" },
    sports: { bg: "#D6EAF8", text: "#1A5276" },
    culture: { bg: "#F5EEF8", text: "#6C3483" },
    academic: { bg: "#E8F8F5", text: "#0E6655" },
  };

  const getCategoryStyle = (cat) => {
    const key = cat?.toLowerCase() || "";
    return categoryColors[key] || { bg: "#F4DED7", text: "#241A17" };
  };

  const upBadgeLabel = (count) => {
    if (count === 0) return "0 ACTIVE";
    return `${count} ACTIVE`;
  };

  const renderUpcomingBento = () => {
    if (!mainUpcoming) return null;

    return (
      <div className="history-upcoming-bento">
        {mainUpcoming && (
          <div className="huc-featured-card">
            <div className="huc-featured-img bg-section-bg">
              {mainUpcoming.image && (
                <img src={mainUpcoming.image} alt={mainUpcoming.title} />
              )}
            </div>
            <div className="huc-featured-body">
              <div className="huc-featured-tags">
                <span
                  className="huc-category-pill"
                  style={{
                    background: getCategoryStyle(mainUpcoming.category).bg,
                    color: getCategoryStyle(mainUpcoming.category).text,
                  }}
                >
                  {mainUpcoming.category}
                </span>
                <span className="huc-registered-pill">
                  <svg width="14" height="14" viewBox="0 0 14 16" fill="none">
                    <path d="M1.5 5.5L7 11L12.5 5.5" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Registered
                </span>
              </div>
              <h3 className="huc-featured-title">{mainUpcoming.title}</h3>
              <div className="huc-featured-meta">
                <span>
                  <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                    <path d="M14 2H16C16.5304 2 17.0391 2.21071 17.4142 2.58579C17.7893 2.96086 18 3.46957 18 4V20C18 20.5304 17.7893 21.0391 17.4142 21.4142C17.0391 21.7893 16.5304 22 16 22H2C1.46957 22 0.960859 21.7893 0.585786 21.4142C0.210714 21.0391 0 20.5304 0 20V4C0 3.46957 0.210714 2.96086 0.585786 2.58579C0.960859 2.21071 1.46957 2 2 2H4V0H6V2H12V0H14V2Z" fill="#53433F"/>
                  </svg>
                  {formatDate(mainUpcoming.date)}, {formatTime(mainUpcoming.date)}
                </span>
                <span>
                  <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                    <path d="M9 0C4.029 0 0 4.029 0 9C0 15.75 9 22 9 22C9 22 18 15.75 18 9C18 4.029 13.971 0 9 0ZM9 12C7.343 12 6 10.657 6 9C6 7.343 7.343 6 9 6C10.657 6 12 7.343 12 9C12 10.657 10.657 12 9 12Z" fill="#53433F"/>
                  </svg>
                  {mainUpcoming.location}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="huc-side-cards">
          {sideUpcoming.length === 0 && (
            <div className="huc-side-empty">
              <p>No more upcoming events</p>
            </div>
          )}
          {sideUpcoming.map((ev) => {
            const days = getDaysUntil(ev.date);
            return (
              <div key={ev.id} className="huc-side-card">
                <div className="huc-side-body">
                  <div className="huc-side-top">
                    <span
                      className="huc-category-pill"
                      style={{
                        background: getCategoryStyle(ev.category).bg,
                        color: getCategoryStyle(ev.category).text,
                      }}
                    >
                      {ev.category}
                    </span>
                    <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                      <path d="M4 10L12 18L20 10" stroke="#85736E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="huc-side-title">{ev.title}</h4>
                  <p className="huc-side-desc">{ev.description}</p>
                </div>
                <div className="huc-side-footer">
                  <div className="huc-side-border" />
                  {days && <span className="huc-side-date">{days}</span>}
                  <Link to={`/events/${ev.eventId || ev.id}`} className="huc-side-link">
                    View Details
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                      <path d="M2 10H14M14 10L8 4M14 10L8 16" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;

  const handleRefresh = async () => {
    setLoading(true);
    setMovedNotice(null);
    await fetchData();
  };

  return (
    <div className="page-container history-page">
      {/* Hero Section */}
      <section className="history-hero">
        <h1 className="history-hero-title">Event History</h1>
        <p className="history-hero-sub">Manage your registrations and relive past campus moments.</p>
      </section>

      {/* Moved notification */}
      {movedNotice && (
        <div className="history-notice">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#FF7A00" strokeWidth="1.5" />
            <path d="M10 6V11M10 13V14" stroke="#FF7A00" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{movedNotice} event{movedNotice > 1 ? "s have" : " has"} passed &mdash; check your Past Events below.</span>
          <button className="history-notice-dismiss" onClick={() => setMovedNotice(null)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="#85736E" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Upcoming Events */}
      <section className="history-section">
        <div className="history-section-header">
          <div className="history-section-heading">
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
              <path d="M4 10L12 18L20 10" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Upcoming Events</h2>
          </div>
          <span className="history-active-badge">{upBadgeLabel(upcoming.length)}</span>
        </div>

        {upcoming.length === 0 ? (
          <div className="history-empty">
            <p>No upcoming events. <Link to="/events">Browse events</Link> to register.</p>
          </div>
        ) : (
          renderUpcomingBento()
        )}
      </section>

      {/* Past Events */}
      <section className="history-section">
        <div className="history-section-header with-border">
          <div className="history-section-heading">
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
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

        <button className="history-refresh-btn" onClick={handleRefresh}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C10.5 2 12.5 3.5 13.5 5.5" stroke="#FF7A00" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9.5 2H13.5V6" stroke="#FF7A00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh
        </button>

        {filteredPast.length === 0 ? (
          <div className="history-empty">
            <p>No past events yet.</p>
          </div>
        ) : (
          <div className="history-past-list">
            {filteredPast.map((ev) => {
              const isAttended = ev.attended || ev.status === "attended";
              const isMissed = ev.status === "missed" || (!isAttended && ev.status !== "refunded");
              const isRefunded = ev.status === "refunded";

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
                      {isAttended && `Attended`}
                      {isMissed && `Not Attended`}
                      {isRefunded && `Not Attended`}
                      {ev.description ? ` \u2022 ${ev.description}` : ""}
                    </p>
                  </div>

                  <div className="hpl-card-actions">
                    <div className="hpl-card-status">
                      {isAttended && (
                        <span className="hpl-badge attended">
                          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                            <path d="M1.5 5.5L7 11L12.5 5.5" stroke="#1A8038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Attended
                        </span>
                      )}
                      {isMissed && (
                        <span className="hpl-badge missed">
                          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                            <path d="M1.5 5.5L7 11L12.5 5.5" stroke="#BA1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Missed
                        </span>
                      )}
                      {isRefunded && (
                        <span className="hpl-badge refunded">
                          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                            <path d="M1.5 5.5L7 11L12.5 5.5" stroke="#85736E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Refunded
                        </span>
                      )}
                      <div className="hpl-card-xp">
                        {isAttended && ev.xpEarned > 0
                          ? `Earned ${ev.xpEarned} XP`
                          : (isMissed || isRefunded) && "No XP Awarded"}
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
        )}

        {filteredPast.length > 0 && filteredPast.length >= 3 && (
          <div className="history-load-more">
            <button className="hpl-load-btn">Load More</button>
          </div>
        )}
      </section>
    </div>
  );
}
