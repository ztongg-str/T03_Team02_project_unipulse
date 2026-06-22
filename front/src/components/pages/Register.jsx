import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.password || !form.username) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username || form.fullName.toLowerCase().replace(/\s+/g, ""),
        email: form.email,
        fullName: form.fullName,
        password: form.password,
        role: form.role,
      });
      navigate(form.role === "organizer" ? "/organizer/dashboard" : "/events");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
          <h1 className="auth-brand-heading">Join your campus rhythm.</h1>
          <p className="auth-brand-desc">
            Create your account and start exploring workshops, festivals, and
            events happening around your university.
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
          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-subtitle">Get started with your campus-wide experience.</p>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Role Toggle */}
          <div className="role-toggle-wrapper">
            <div className="role-toggle">
              <button
                type="button"
                className={`role-toggle-btn ${form.role === "student" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "student" })}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2l7 5v7l-7 5-7-5V7l7-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Student
              </button>
              <button
                type="button"
                className={`role-toggle-btn ${form.role === "organizer" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "organizer" })}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 5V3h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="10" cy="10" r="2" fill="currentColor"/>
                </svg>
                Organizer
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label>Full Name</label>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="4" stroke="#85736B" strokeWidth="2"/>
                  <path d="M3 18c0-4 3-7 7-7s7 3 7 7" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  name="fullName"
                  type="text"
                  placeholder="e.g. Juan dela Cruz"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
              <label>{form.role === "student" ? "Student ID" : "Username"}</label>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="2" width="12" height="16" rx="2" stroke="#85736B" strokeWidth="2"/>
                  <path d="M8 8h4M8 11h4" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  name="username"
                  type="text"
                  placeholder={form.role === "student" ? "e.g. 2024-00001" : "e.g. eventhub"}
                  value={form.username}
                  onChange={handleChange}
                  required
                  minLength={3}
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
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create My Account"}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          <p className="auth-form-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>

          <div className="auth-form-links">
            <Link to="/">Terms of Service</Link>
            <span>&middot;</span>
            <Link to="/">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
