import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsAPI, registrationsAPI, historyAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await historyAPI.moveExpired();
      const [eventsRes, regRes] = await Promise.allSettled([
        eventsAPI.getAll(),
        registrationsAPI.getMy(),
      ]);
      if (eventsRes.status === "fulfilled") {
        const allEvents = eventsRes.value.data?.events || [];
        const myEvents = user ? allEvents.filter(e => e.organizerId === user.id || e.userId === user.id) : allEvents;
        if (myEvents.length === 0) {
          setEvents(allEvents.slice(0, 10));
        } else {
          setEvents(myEvents);
        }
      }
      if (regRes.status === "fulfilled") {
        const regs = regRes.value.data || [];
        setRegistrationsCount(regs.length);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const totalEvents = events.length;
  const pendingEvents = events.filter(e => e.status === "pending" && new Date(e.date) > now).length;
  const approvedEvents = events.filter(e => (e.status === "approved" || e.status === "active") && new Date(e.date) > now).length;

  const stats = [
    { label: "Total Events", value: totalEvents, icon: "calendar", color: "#FF7A00", bg: "rgba(255,122,0,0.1)" },
    { label: "Events Pending", value: pendingEvents, icon: "clock", color: "#FDD348", bg: "rgba(253,211,72,0.15)" },
    { label: "Approved Events", value: approvedEvents, icon: "check", color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
    { label: "Registrations", value: registrationsCount, icon: "users", color: "#FF7386", bg: "rgba(255,115,134,0.12)" },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: "Pending", className: "badge-yellow" },
      approved: { label: "Approved", className: "badge-green" },
      active: { label: "Active", className: "badge-green" },
      rejected: { label: "Rejected", className: "badge badge-danger" },
      cancelled: { label: "Cancelled", className: "badge badge-danger" },
    };
    const s = map[status?.toLowerCase()] || { label: status || "Draft", className: "badge badge-orange" };
    return <span className={`badge ${s.className}`}>{s.label}</span>;
  };

  const now = new Date();
  const activeEvents = events
    .filter(e => e.status !== "cancelled" && e.status !== "rejected" && new Date(e.date) > now)
    .slice(0, 5);
  const pastCreatedEvents = events
    .filter(e => e.status !== "cancelled" && e.status !== "rejected" && new Date(e.date) <= now)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const notifications = [
    { id: 1, text: "New registration for Music Festival", time: "5 min ago", type: "registration" },
    { id: 2, text: "Tech Workshop has been approved", time: "2 hours ago", type: "approval" },
    { id: 3, text: "3 attendees cancelled for Art Exhibition", time: "1 day ago", type: "cancellation" },
    { id: 4, text: "Sports Day event pending review", time: "2 days ago", type: "pending" },
  ];

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="org-dashboard">
      <div className="org-dashboard-header">
        <div>
          <h1 className="org-dashboard-title">Dashboard</h1>
          <p className="org-dashboard-subtitle">Welcome back, {user?.fullName || user?.username}!</p>
        </div>
        <Link to="/organizer/create-event" className="org-create-btn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Create New Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="org-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="org-stat-card border-t-[3px] border-solid" style={{ borderTopColor: stat.color }}>
            <div className="org-stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                {stat.icon === "calendar" && (
                  <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
                )}
                {stat.icon === "clock" && (
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                )}
                {stat.icon === "check" && (
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                )}
                {stat.icon === "users" && (
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                )}
              </svg>
            </div>
            <div className="org-stat-value">{stat.value}</div>
            <div className="org-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="org-dashboard-grid">
        {/* Recent Events Table */}
        <div className="org-section-card">
          <div className="org-section-header">
            <h2 className="org-section-title">Recent Events</h2>
            <Link to="/organizer/my-events" className="org-section-link">View All</Link>
          </div>
          <div className="org-table-wrapper">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="org-table-empty">No upcoming events.</td>
                  </tr>
                ) : (
                  activeEvents.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <div className="org-table-event-name">{ev.title}</div>
                      </td>
                      <td className="org-table-date">{formatDate(ev.date)}</td>
                      <td>{getStatusBadge(ev.status)}</td>
                      <td>
                        <div className="org-table-actions">
                          <Link to={`/events/${ev.id}`} className="org-action-btn" title="View">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 3C5 3 2.5 5 1 8c1.5 3 4 5 7 5s6-2 7-5c-1-3-3.5-5-7-5z" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </Link>
                          <button className="org-action-btn" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M11.5 2.5l2 2L7 11H5V9l6.5-6.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="org-section-card">
          <div className="org-section-header">
            <h2 className="org-section-title">Notifications</h2>
            <button className="org-section-link bg-transparent border-none cursor-pointer">Mark all read</button>
          </div>
          <div className="org-notif-list">
            {notifications.map((n) => (
              <div key={n.id} className="org-notif-item">
                <div className={`org-notif-dot ${n.type}`} />
                <div className="org-notif-content">
                  <div className="org-notif-text">{n.text}</div>
                  <div className="org-notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Past Events */}
      <div className="org-section-card">
        <div className="org-section-header">
          <h2 className="org-section-title">Past Events</h2>
        </div>
        <div className="org-table-wrapper">
          <table className="org-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pastCreatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="org-table-empty">No past events yet.</td>
                </tr>
              ) : (
                pastCreatedEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <div className="org-table-event-name">{ev.title}</div>
                    </td>
                    <td className="org-table-date">{formatDate(ev.date)}</td>
                    <td><span className="badge badge-orange">Ended</span></td>
                    <td>
                      <Link to={`/events/${ev.id}`} className="org-action-btn" title="View">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3C5 3 2.5 5 1 8c1.5 3 4 5 7 5s6-2 7-5c-1-3-3.5-5-7-5z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="org-quick-actions">
        <h2 className="org-section-title">Quick Actions</h2>
        <div className="org-quick-grid">
          <Link to="/organizer/create-event" className="org-quick-card">
            <div className="org-quick-icon bg-[rgba(255,122,0,0.1)] text-[#FF7A00]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>Create Event</span>
          </Link>
          <Link to="/friends" className="org-quick-card">
            <div className="org-quick-icon bg-[rgba(255,115,134,0.1)] text-[#FF7386]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                <circle cx="15" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 20c0-4 3-7 6-7h6c3 0 6 3 6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>Invite Friends</span>
          </Link>
          <Link to="/organizer/my-events" className="org-quick-card">
            <div className="org-quick-icon bg-[rgba(46,196,182,0.1)] text-[#2EC4B6]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 10h16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span>Manage Events</span>
          </Link>
          <Link to="/profile" className="org-quick-card">
            <div className="org-quick-icon bg-[rgba(253,211,72,0.15)] text-[#FDD348]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 22c0-5 4-9 8-9s8 4 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>View Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
