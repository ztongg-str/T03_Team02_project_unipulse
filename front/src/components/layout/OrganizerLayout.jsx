import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function OrganizerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="org-layout">
      <aside className="org-sidebar">
        <div className="org-sidebar-header">
          <div className="org-sidebar-logo">UniPulse</div>
          <div className="org-sidebar-subtitle">University Events</div>
        </div>

        <nav className="org-sidebar-nav">
          <NavLink to="/organizer/dashboard" className={({ isActive }) => isActive ? "org-nav-item active" : "org-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Dashboard
          </NavLink>
          <NavLink to="/organizer/my-events" className={({ isActive }) => isActive ? "org-nav-item active" : "org-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 8h14M10 3v14" stroke="currentColor" strokeWidth="2"/>
            </svg>
            My Events
          </NavLink>
          <NavLink to="/organizer/create-event" className={({ isActive }) => isActive ? "org-nav-item active" : "org-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create Event
          </NavLink>
          <NavLink to="/organizer/reports" className={({ isActive }) => isActive ? "org-nav-item active" : "org-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 17V5a2 2 0 012-2h10a2 2 0 012 2v12l-4-2-4 2-4-2-4 2z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Reports
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "org-nav-item active" : "org-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 18c0-4 3-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Profile
          </NavLink>
          <NavLink to="/friends" className={({ isActive }) => isActive ? "org-nav-item active" : "org-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="13" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 17c0-3 2.5-5 5-5s5 2 5 5M10 17c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Community
          </NavLink>
          <NavLink to="/organizer/settings" className={({ isActive }) => isActive ? "org-nav-item active" : "org-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.5 3.5l2 2M14.5 14.5l2 2M3.5 16.5l2-2M14.5 5.5l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Settings
          </NavLink>
        </nav>

        <div className="org-sidebar-footer">
          <div className="org-sidebar-user">
            <div className="org-sidebar-avatar">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "O"}
            </div>
            <div className="org-sidebar-user-info">
              <div className="org-sidebar-user-name">{user?.fullName || user?.username}</div>
              <div className="org-sidebar-user-role">Event Organizer</div>
            </div>
          </div>
          <button className="org-sidebar-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 16H3a1 1 0 01-1-1V3a1 1 0 011-1h4M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="org-main">
        <header className="org-topbar">
          <div className="org-topbar-search">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="5" stroke="#85736B" strokeWidth="2"/>
              <path d="M12 12l4 4" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search events, attendees..." />
          </div>
          <div className="org-topbar-actions">
            <button className="org-topbar-icon-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 00-6 6v4l-2 3h16l-2-3V8a6 6 0 00-6-6zM8 16a2 2 0 004 0" stroke="#584235" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="org-topbar-user">
              <div className="org-topbar-avatar">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "O"}
              </div>
              <span className="org-topbar-name">{user?.fullName || user?.username}</span>
            </div>
          </div>
        </header>
        <main className="org-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
