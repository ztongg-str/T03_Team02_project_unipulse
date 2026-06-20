import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventsAPI, historyAPI, achievementsAPI, streaksAPI } from "../../services/api";

export default function StudentHome() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [achCount, setAchCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [upRes, evRes, achRes, stRes] = await Promise.allSettled([
        historyAPI.getUpcoming(),
        eventsAPI.getAll(),
        achievementsAPI.getAllWithStatus(),
        streaksAPI.getMy(),
      ]);
      if (upRes.status === "fulfilled") setUpcoming(upRes.value.data?.slice(0, 3) || []);
      if (evRes.status === "fulfilled") {
        const all = evRes.value.data?.events || evRes.value.data || [];
        setFeatured(all.filter((e) => e.status === "approved").slice(0, 4));
      }
      if (achRes.status === "fulfilled") {
        const all = achRes.value.data || [];
        setAchCount(all.filter((a) => a.unlocked).length);
      }
      if (stRes.status === "fulfilled") {
        setStreak(stRes.value.data?.currentStreak || 0);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      {/* Welcome */}
      <section style={{ marginBottom: 48 }}>
        <h1 style={{ fontWeight: 800, fontSize: 40, color: "#201A18", marginBottom: 4 }}>
          Welcome back, {user?.fullName || user?.username}
        </h1>
        <p style={{ fontSize: 16, color: "#53433F" }}>
          Here&apos;s what&apos;s happening on campus today.
        </p>
      </section>

      {/* Quick Stats */}
      <section style={{ display: "flex", gap: 16, marginBottom: 48 }}>
        <Link to="/achievements" className="sh-stat-card" style={{ flex: 1 }}>
          <span className="sh-stat-icon" style={{ background: "rgba(255,122,0,0.12)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.5 10H22L16 15L18 23L12 18L6 23L8 15L2 10H9.5L12 2Z" fill="#FF7A00" />
            </svg>
          </span>
          <span className="sh-stat-num">{achCount}</span>
          <span className="sh-stat-label">Achievements</span>
        </Link>
        <Link to="/streaks" className="sh-stat-card" style={{ flex: 1 }}>
          <span className="sh-stat-icon" style={{ background: "rgba(239,68,68,0.12)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C10.5 8 6 10 6 16C6 19.3137 8.68629 22 12 22C15.3137 22 18 19.3137 18 16C18 10 13.5 8 12 2Z" fill="#EF4444" />
            </svg>
          </span>
          <span className="sh-stat-num">{streak}</span>
          <span className="sh-stat-label">Day Streak</span>
        </Link>
        <Link to="/history" className="sh-stat-card" style={{ flex: 1 }}>
          <span className="sh-stat-icon" style={{ background: "rgba(34,197,94,0.12)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="sh-stat-num">{upcoming.length}</span>
          <span className="sh-stat-label">Upcoming</span>
        </Link>
      </section>

      {/* Upcoming Events */}
      <section style={{ marginBottom: 48 }}>
        <div className="sh-section-header">
          <h2>Your Upcoming Events</h2>
          {upcoming.length > 0 && <Link to="/history" className="sh-view-all">View All</Link>}
        </div>
        {upcoming.length === 0 ? (
          <div className="sh-empty">
            <p>No upcoming events. <Link to="/events">Browse events</Link> to register.</p>
          </div>
        ) : (
          <div className="sh-upcoming-list">
            {upcoming.map((ev) => (
              <Link key={ev.id} to={`/events/${ev.eventId || ev.id}`} className="sh-upcoming-card">
                <div className="sh-upcoming-body">
                  <div className="sh-upcoming-cat" style={{
                    background: "#FFDBCC",
                    color: "#803D00",
                    padding: "2px 8px",
                    borderRadius: 9999,
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    display: "inline-block",
                    marginBottom: 8,
                    width: "fit-content",
                  }}>
                    {ev.category}
                  </div>
                  <h3 className="sh-upcoming-title">{ev.title}</h3>
                  <p className="sh-upcoming-meta">{formatDate(ev.date)} &middot; {ev.location}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4L13 10L7 16" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Events */}
      <section>
        <div className="sh-section-header">
          <h2>Featured Events</h2>
          <Link to="/events" className="sh-view-all">View All</Link>
        </div>
        {featured.length === 0 ? (
          <div className="sh-empty"><p>No events available right now.</p></div>
        ) : (
          <div className="sh-featured-grid">
            {featured.map((ev) => (
              <Link key={ev.id} to={`/events/${ev.id}`} className="sh-featured-card">
                <div className="sh-featured-img" />
                <div className="sh-featured-body">
                  <span className="sh-featured-cat" style={{
                    background: "#F4DED7",
                    color: "#241A17",
                    padding: "2px 8px",
                    borderRadius: 9999,
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    display: "inline-block",
                    marginBottom: 6,
                    width: "fit-content",
                  }}>
                    {ev.category}
                  </span>
                  <h4 className="sh-featured-title">{ev.title}</h4>
                  <p className="sh-featured-meta">{formatDate(ev.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
