import { useState } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api"; 

export default function OrganizerLayout() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBackToStudent = async () => {
    try {
      const res = await authAPI.switchRole();
      localStorage.setItem("token", res.data.token);
      updateUser(res.data.user);
      navigate("/events", { replace: true });  // Go to student events page
    } catch (err) {
      console.error("Switch failed:", err);
      navigate("/login", { state: { redirectTo: "/events" } });
    }
  };

  return (
    <div className="org-layout">
      <div className={`org-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`org-sidebar ${sidebarOpen ? 'open' : ''}`}>
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

          <NavLink to="/organizer/qr-checkin" className={({ isActive }) => isActive ? "org-nav-item active" : "org-nav-item"}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 8h4v4H8z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Event QR Codes
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
          <button className="org-sidebar-switch-btn" onClick={handleBackToStudent}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L2 7l4 4M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Student
          </button>
          <button className="org-sidebar-logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H2a1 1 0 01-1-1V3a1 1 0 011-1h4M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="org-main">
        <header className="org-topbar">
          <div className="org-topbar-actions">
            <button className="org-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#584235" strokeWidth="2" strokeLinecap="round">
                {sidebarOpen ? (
                  <><path d="M5 5l12 12M17 5l-12 12" /></>
                ) : (
                  <><path d="M4 6h14M4 11h14M4 16h14" /></>
                )}
              </svg>
            </button>

            <div className="org-topbar-user">
              <div className="org-topbar-avatar">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "O"}
              </div>
              <div>
                <div className="org-topbar-name">{user?.fullName || user?.username}</div>
                <div className="org-topbar-role">{user?.role}</div>
              </div>
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
