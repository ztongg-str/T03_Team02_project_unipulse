import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const successMessage = location.state?.successMessage || "";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.redirectTo;
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate(user.role === "organizer" ? "/organizer/dashboard" : "/events");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
          <div className="auth-brand-card">
            <div className="auth-brand-avatars">
              <div className="auth-brand-avatar bg-[#FF7386] z-[3]">M</div>
              <div className="auth-brand-avatar bg-[#2EC4B6] z-[2] -ml-3">K</div>
              <div className="auth-brand-avatar bg-[#FDD348] z-[1] -ml-3">J</div>
            </div>
            <div>
              <div className="auth-brand-card-title">Join 2,400+ students</div>
              <div className="auth-brand-card-sub">active on campus today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <h2 className="auth-form-title">Welcome Back</h2>
          <p className="auth-form-subtitle">Sign in to your campus-wide experience.</p>

          {successMessage && <div className="alert alert-success">{successMessage}</div>}
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
            </div>

            <div className="auth-forgot-row">
              <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
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
