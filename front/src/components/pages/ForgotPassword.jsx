import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess("OTP sent to your email. Please check your inbox.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setResendDisabled(true);
    try {
      await forgotPassword({ email });
      setSuccess("OTP resent successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setTimeout(() => setResendDisabled(false), 30000);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, password });
      navigate("/login", {
        state: { successMessage: "Password reset successfully. Please sign in with your new password." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
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
          <h1 className="auth-brand-heading">Reset your password.</h1>
          <p className="auth-brand-desc">
            Enter your email and we'll send you a one-time code to reset your
            password and get back on campus.
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
          {step === 1 ? (
            <>
              <h2 className="auth-form-title">Forgot Password</h2>
              <p className="auth-form-subtitle">
                Enter your email address and we'll send you a code to reset your password.
              </p>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSendOtp}>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading || !email}>
                  {loading ? "Sending..." : "Send Code"}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>

              <p className="auth-form-footer">
                <Link to="/login">Back to Login</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="auth-form-title">Enter Code</h2>
              <p className="auth-form-subtitle">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleResetPassword}>
                <div className="auth-input-group">
                  <label>OTP Code</label>
                  <div className="auth-input-wrapper">
                    <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="4" width="16" height="12" rx="2" stroke="#85736B" strokeWidth="2"/>
                      <path d="M2 6l8 5 8-5" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                      name="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>New Password</label>
                  <div className="auth-input-wrapper">
                    <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="4" y="9" width="12" height="9" rx="2" stroke="#85736B" strokeWidth="2"/>
                      <path d="M7 9V6a3 3 0 016 0v3" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                      name="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Confirm New Password</label>
                  <div className="auth-input-wrapper">
                    <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="4" y="9" width="12" height="9" rx="2" stroke="#85736B" strokeWidth="2"/>
                      <path d="M7 9V6a3 3 0 016 0v3" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading || !otp || !password}>
                  {loading ? "Resetting..." : "Reset Password"}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>

              <p className="auth-form-footer" style={{ marginTop: 16 }}>
                Didn't receive the code?{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-orange)",
                    fontWeight: 600,
                    fontFamily: "var(--font)",
                    fontSize: 14,
                    cursor: resendDisabled ? "not-allowed" : "pointer",
                    opacity: resendDisabled ? 0.6 : 1,
                  }}
                >
                  {resendDisabled ? "Resend in 30s" : "Resend Code"}
                </button>
              </p>

              <p className="auth-form-footer">
                <Link to="/login">Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
