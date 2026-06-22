import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `text-lg font-medium pb-1 transition-colors ${isActive ? "text-orange font-bold border-b-2 border-orange" : "text-judge-gray"}`;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to={user ? "/events" : "/"} className="navbar-logo">
            UniPulse
          </Link>

          {user && (
            <div className="flex items-center gap-6">
              <NavLink to="/" className={navLinkClass}>Home</NavLink>
              <NavLink to="/events" className={navLinkClass}>Events</NavLink>
              <NavLink to="/friends" className={navLinkClass}>Community</NavLink>
              <NavLink to="/history" className={navLinkClass}>History</NavLink>
            </div>
          )}

          {!user && (
            <div className="flex items-center gap-8">
              <NavLink to="/" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 500, color: isActive ? "var(--orange)" : "var(--judge-gray)" })}>Home</NavLink>
              <NavLink to="/events" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 500, color: isActive ? "var(--orange)" : "var(--judge-gray)" })}>Events</NavLink>
              <NavLink to="/friends" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 500, color: isActive ? "var(--orange)" : "var(--judge-gray)" })}>Community</NavLink>
              <NavLink to="/about" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 500, color: isActive ? "var(--orange)" : "var(--judge-gray)" })}>About</NavLink>
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-orange bg-orange text-white flex items-center justify-center text-base font-bold overflow-hidden">
                    {user.avatar ? (
                      <img src={`http://localhost:4000${user.avatar}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.fullName?.charAt(0) || user.username?.charAt(0)
                    )}
                  </div>
                  <span className="text-lg font-medium text-judge-gray">{user.fullName || user.username}</span>
                </Link>
                <button onClick={() => setShowLogoutModal(true)} className="btn btn-outlined btn-small">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outlined btn-small">Log in</Link>
                <Link to="/register" className="btn btn-primary btn-small">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 animate-[fadeIn_0.15s_ease]" onClick={() => setShowLogoutModal(false)}>
          <div className="bg-white rounded-2xl p-8 w-[400px] max-w-[90vw] shadow-[0_16px_48px_rgba(0,0,0,0.15)] animate-[scaleIn_0.15s_ease]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-[22px] text-cocoa mb-2">Leave UniPulse?</h3>
            <p className="text-base text-kabul mb-6 leading-relaxed">Are you sure you want to log out? You'll need to sign in again to access your account.</p>
            <div className="flex gap-3 justify-end">
              <button className="px-6 py-2.5 rounded-full font-semibold text-base bg-dawn-pink text-kabul hover:bg-[#E8D5CE]" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="px-6 py-2.5 rounded-full font-semibold text-base bg-orange text-white hover:bg-[#E66A00]" onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
