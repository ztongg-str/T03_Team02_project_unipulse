import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventsAPI, historyAPI, achievementsAPI, usersAPI } from "../../services/api";
import { SkeletonCard, SkeletonLine, SkeletonBlock } from "../common/Skeleton";

export default function StudentHome() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [achCount, setAchCount] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [upRes, evRes, achRes, profileRes] = await Promise.allSettled([
        historyAPI.getUpcoming(),
        eventsAPI.getAll(),
        achievementsAPI.getAllWithStatus(),
        usersAPI.getProfile(),
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
      if (profileRes.status === "fulfilled" && profileRes.value.data) {
        setUserLevel(profileRes.value.data.level || 1);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) return (
    <div className="page-container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <SkeletonBlock height="60px" />
      <div className="sh-quick-stats" style={{ display: "flex", gap: 16, marginTop: 32, marginBottom: 48 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="sh-stat-card" style={{ flex: 1, border: "none" }}>
            <SkeletonLine width="40px" />
            <SkeletonLine width="20px" />
            <SkeletonLine width="60px" />
          </div>
        ))}
      </div>
      <SkeletonBlock height="200px" />
    </div>
  );

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
      <section className="sh-quick-stats" style={{ display: "flex", gap: 16, marginBottom: 48 }}>
        <Link to="/achievements" className="sh-stat-card" style={{ flex: 1 }}>
          <span className="sh-stat-icon" style={{ background: "rgba(255,122,0,0.12)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.5 10H22L16 15L18 23L12 18L6 23L8 15L2 10H9.5L12 2Z" fill="#FF7A00" />
            </svg>
          </span>
          <span className="sh-stat-num">{achCount}</span>
          <span className="sh-stat-label">Achievements</span>
        </Link>
        <div className="sh-stat-card" style={{ flex: 1 }}>
          <span className="sh-stat-icon" style={{ background: "rgba(46,196,182,0.12)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#2EC4B6" />
            </svg>
          </span>
          <span className="sh-stat-num">{userLevel}</span>
          <span className="sh-stat-label">Level</span>
        </div>
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
          {upcoming.length > 0 && <Link to="/upcoming" className="sh-view-all">View All</Link>}
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
                  <p className="sh-upcoming-meta">{formatDate(ev.date)} &middot; {ev.location ? <a href={`https://www.google.com/maps?q=${encodeURIComponent(ev.location)}`} target="_blank" rel="noopener noreferrer" style={{ color: "#FF7A00", textDecoration: "underline" }}>{ev.location}</a> : ev.location}</p>
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
