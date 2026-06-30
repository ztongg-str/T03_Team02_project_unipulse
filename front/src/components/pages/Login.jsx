import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      showToast("success", "Welcome back! You're logged in.");
      const redirectTo = location.state?.redirectTo;
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate(user.role === "organizer" ? "/organizer/dashboard" : "/events");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.2"/>
              <path d="M24 10l4.5 11H40l-9 7.5 3.5 11.5L24 32l-10.5 8L17 28.5 8 21h11.5L24 10z" fill="white"/>
            </svg>
            <span>UniPulse</span>
          </div>
          <h1 className="auth-brand-heading">Welcome back to campus.</h1>
          <p className="auth-brand-desc">
            Sign in to continue exploring events, connecting with friends, and
            keeping your campus rhythm alive.
          </p>
          <div className="auth-brand-card" style={{ padding: "16px 20px", background: "#fff" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 12 }}>
              Demo Accounts
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontWeight: 700, color: "#000" }}>Super Admin</div>
                <div style={{ color: "#000", fontFamily: "monospace" }}>superadmin@unipulse.edu</div>
                <div style={{ color: "#000", fontFamily: "monospace" }}>SuperAdmin@123</div>
              </div>
              <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontWeight: 700, color: "#000" }}>Developer</div>
                <div style={{ color: "#000", fontFamily: "monospace" }}>developer@unipulse.edu</div>
                <div style={{ color: "#000", fontFamily: "monospace" }}>Developer@123</div>
              </div>
              <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontWeight: 700, color: "#000" }}>Coordinator</div>
                <div style={{ color: "#000", fontFamily: "monospace" }}>coordinator@unipulse.edu</div>
                <div style={{ color: "#000", fontFamily: "monospace" }}>Coordinator@123</div>
              </div>
              <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontWeight: 700, color: "#000" }}>User (demo)</div>
                <div style={{ color: "#000", fontFamily: "monospace" }}>musich717@gmail.com</div>
                <div style={{ color: "#000", fontFamily: "monospace" }}>qwerty</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <h2 className="auth-form-title">Welcome Back</h2>
          <p className="auth-form-subtitle">Sign in to your campus-wide experience.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label>University Email</label>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="#85736B" strokeWidth="2"/>
                  <path d="M2 6l8 5 8-5" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  name="email"
                  type="email"
                  placeholder="e.g. juan@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="9" width="12" height="9" rx="2" stroke="#85736B" strokeWidth="2"/>
                  <path d="M7 9V6a3 3 0 016 0v3" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ textAlign: "right", marginTop: 6 }}>
                <Link to="/forgot-password" style={{ fontSize: 13, color: "#FF7A00", fontWeight: 600, textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          <p className="auth-form-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
