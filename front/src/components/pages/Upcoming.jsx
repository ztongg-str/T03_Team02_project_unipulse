import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { historyAPI } from "../../services/api";

export default function Upcoming() {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const fetchUpcoming = async () => {
    try {
      const res = await historyAPI.getUpcoming();
      setUpcoming((res.data || []).filter((e) => new Date(e.date) > new Date()));
    } catch {
      setUpcoming([]);
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

  const renderUpcomingBento = () => {
    if (!mainUpcoming) return null;

    return (
      <div className="history-upcoming-bento">
        {mainUpcoming && (
          <Link to={`/events/${mainUpcoming.eventId || mainUpcoming.id}`} className="huc-featured-card" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
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
                  {mainUpcoming.location ? <a href={`https://www.google.com/maps?q=${encodeURIComponent(mainUpcoming.location)}`} target="_blank" rel="noopener noreferrer" style={{ color: "#FF7A00", textDecoration: "underline" }}>{mainUpcoming.location}</a> : mainUpcoming.location}
                </span>
              </div>
            </div>
          </Link>
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

  return (
    <div className="page-container history-page">
      <section className="history-hero">
        <h1 className="history-hero-title">Upcoming Events</h1>
        <p className="history-hero-sub">Events you've registered for that are coming up soon.</p>
      </section>

      <section className="history-section">
        {upcoming.length === 0 ? (
          <div className="history-empty">
            <p>No upcoming events. <Link to="/events">Browse events</Link> to register.</p>
          </div>
        ) : (
          renderUpcomingBento()
        )}
      </section>
    </div>
  );
}
