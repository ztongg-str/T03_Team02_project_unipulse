import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    to: "/admin/events",
    label: "Events",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M2 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 9a3 3 0 000 0M14 9c1.1 0 2 .4 2.7 1M16.7 10c.8.8 1.3 2 1.3 3.2V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/admin/verification",
    label: "Event Verification",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12.4 7.3H18L13.7 10.7L15.4 16L10 12.7L4.6 16L6.3 10.7L2 7.3H7.6L10 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.5 3.5l2 2M14.5 14.5l2 2M3.5 16.5l2-2M14.5 5.5l2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
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
          <div className="org-sidebar-subtitle" style={{ color: "#FF7A00", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
            Admin Portal
          </div>
        </div>

        <nav className="org-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => isActive ? "org-nav-item active" : "org-nav-item"}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="org-sidebar-footer">
          <div className="org-sidebar-user">
            <div className="org-sidebar-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : (user?.fullName?.charAt(0) || "A")}
            </div>
            <div className="org-sidebar-user-info">
              <div className="org-sidebar-user-name">{user?.fullName || user?.username}</div>
              <div className="org-sidebar-user-role">
                {user?.role === "admin" ? "Admin" : user?.role}
              </div>
            </div>
          </div>
          <button className="org-sidebar-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 16H3a1 1 0 01-1-1V3a1 1 0 011-1h4M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="org-main">
        <header className="org-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>Admin Dashboard</span>
          </div>
          <div className="org-topbar-actions">
            <div className="org-topbar-user">
              <div className="org-topbar-avatar">
                {user?.avatar
                  ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  : (user?.fullName?.charAt(0) || "A")}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="org-topbar-name">{user?.fullName || user?.username}</span>
                <span style={{ fontSize: 11, color: "#FF7A00", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {user?.role === "admin" ? "Senior Admin" : user?.role}
                </span>
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
