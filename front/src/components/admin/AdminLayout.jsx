import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ── Role display helpers ────────────────────────────────────────────────────
const ROLE_LABELS = {
  superadmin: "Super Admin",
  developer:  "Developer",
  coordinator: "Co-Ordinator",
  admin: "Admin", // legacy
};

const ROLE_COLORS = {
  superadmin:  "#FF7A00",
  developer:   "#6366f1",
  coordinator: "#2EC4B6",
  admin:       "#FF7A00",
};

// ── Nav item definitions with role access lists ─────────────────────────────
// 'roles' = which admin sub-roles can see this item
const ALL_NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    roles: ["superadmin", "developer", "coordinator"],
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
    to: "/admin/users",
    label: "Users",
    roles: ["superadmin", "coordinator"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M2 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 9a3 3 0 000 0M14 9c1.1 0 2 .4 2.7 1M16.7 10c.8.8 1.3 2 1.3 3.2V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/admin/events",
    label: "Events",
    roles: ["superadmin", "coordinator"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/admin/verification",
    label: "Event Verification",
    roles: ["superadmin", "coordinator"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12.4 7.3H18L13.7 10.7L15.4 16L10 12.7L4.6 16L6.3 10.7L2 7.3H7.6L10 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/admin/query-console",
    label: "Query Console",
    roles: ["superadmin", "developer"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 8l3 3-3 3M11 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/admin/settings",
    label: "Settings",
    roles: ["superadmin", "developer", "coordinator"],
    // Settings shows different tabs based on role — handled inside AdminSettings
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  const role = user?.role || "superadmin";
  const roleLabel = ROLE_LABELS[role] || "Admin";
  const roleColor = ROLE_COLORS[role] || "#FF7A00";

  // Filter nav items to those the current role can see
  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        overlayRef.current &&
        overlayRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [sidebarOpen]);

  // Close sidebar on route change (mobile)
  const handleNavClick = () => {
    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  return (
    <div className="org-layout">
      {/* Overlay — only rendered when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          ref={overlayRef}
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 98,
          }}
        />
      )}

      <aside ref={sidebarRef} className={`org-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="org-sidebar-header">
          <div className="org-sidebar-logo">UniPulse</div>
          <div
            className="org-sidebar-subtitle"
            style={{ color: roleColor, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}
          >
            {roleLabel} Portal
          </div>
        </div>

        <nav className="org-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? "org-nav-item active" : "org-nav-item")}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Role badge in sidebar */}
        <div style={{ padding: "10px 20px 0" }}>
          <div style={{
            background: `${roleColor}18`,
            border: `1px solid ${roleColor}40`,
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
          }}>
            <div style={{ fontSize: 10, color: "#8A7A72", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Access Level</div>
            <div style={{ color: roleColor, fontWeight: 700 }}>{roleLabel}</div>
            {role === "superadmin" && <div style={{ fontSize: 10, color: "#8A7A72", marginTop: 2 }}>Full access to all features</div>}
            {role === "developer" && <div style={{ fontSize: 10, color: "#8A7A72", marginTop: 2 }}>Backup, recovery & query console</div>}
            {role === "coordinator" && <div style={{ fontSize: 10, color: "#8A7A72", marginTop: 2 }}>Users, events & verification</div>}
          </div>
        </div>

        <div className="org-sidebar-footer">
          <div className="org-sidebar-user">
            <div className="org-sidebar-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : (user?.fullName?.charAt(0) || "A")}
            </div>
            <div className="org-sidebar-user-info">
              <div className="org-sidebar-user-name">{user?.fullName || user?.username}</div>
              <div className="org-sidebar-user-role" style={{ color: roleColor }}>
                {roleLabel}
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
            {/* ── Mobile hamburger — FIXED ── */}
            <button
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px", borderRadius: 8,
                display: "none", // shown via CSS at ≤900px
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round">
                {sidebarOpen ? (
                  <>
                    <path d="M5 5l12 12" />
                    <path d="M17 5l-12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 6h14" />
                    <path d="M4 11h14" />
                    <path d="M4 16h14" />
                  </>
                )}
              </svg>
            </button>
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
                <span style={{ fontSize: 11, color: roleColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {roleLabel}
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
