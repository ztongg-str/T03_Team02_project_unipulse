import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendDisabled(true);
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      showToast("success", "OTP sent to your email");
      setStep("reset");
      startResendTimer();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      setError(msg);
      showToast("error", msg);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await authAPI.resendOtp(email);
      showToast("success", "OTP resent");
      startResendTimer();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend OTP";
      setError(msg);
      showToast("error", msg);
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
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
      await authAPI.resetPassword(email, otp, password);
      showToast("success", "Password reset successfully! You can now sign in.");
      setStep("done");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password";
      setError(msg);
      showToast("error", msg);
    }
    setLoading(false);
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
            Enter your email and we&apos;ll send you a verification code to reset your password.
          </p>
          <div className="auth-brand-card">
            <div className="auth-brand-avatars">
              <div className="auth-brand-avatar bg-[#FF7386] z-[3]">M</div>
              <div className="auth-brand-avatar bg-[#2EC4B6] z-[2] -ml-3">K</div>
              <div className="auth-brand-avatar bg-[#FDD348] z-[1] -ml-3">J</div>
            </div>
            <div>
              <div className="auth-brand-card-title">Secure & fast</div>
              <div className="auth-brand-card-sub">OTP verification via email</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          {step === "email" && (
            <>
              <h2 className="auth-form-title">Forgot Password</h2>
              <p className="auth-form-subtitle">Enter your email to receive a verification code.</p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSendOtp}>
                <div className="auth-input-group">
                  <label>University Email</label>
                  <div className="auth-input-wrapper">
                    <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="4" width="16" height="12" rx="2" stroke="#85736B" strokeWidth="2"/>
                      <path d="M2 6l8 5 8-5" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                      type="email"
                      placeholder="e.g. juan@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send Verification Code"}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>

              <p className="auth-form-footer">
                Remember your password? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}

          {step === "reset" && (
            <>
              <h2 className="auth-form-title">Reset Password</h2>
              <p className="auth-form-subtitle">Enter the code sent to <strong>{email}</strong> and set a new password.</p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleReset}>
                <div className="auth-input-group">
                  <label>Verification Code</label>
                  <div className="auth-input-wrapper">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
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
                      type="password"
                      placeholder="Minimum 6 characters"
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
                      type="password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button
                  onClick={handleResend}
                  disabled={resendDisabled || loading}
                  style={{
                    background: "none", border: "none", color: resendDisabled ? "#bbb" : "#FF7A00",
                    cursor: resendDisabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit"
                  }}
                >
                  {resendDisabled ? `Resend code in ${resendTimer}s` : "Resend code"}
                </button>
              </div>

              <p className="auth-form-footer">
                <Link to="/login">Back to sign in</Link>
              </p>
            </>
          )}

          {step === "done" && (
            <>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px"
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#333", margin: "0 0 8px" }}>Password Reset!</h2>
                <p style={{ color: "#5A5A5A", fontSize: 14, marginBottom: 28 }}>
                  Your password has been updated successfully.
                </p>
                <Link to="/login" className="auth-submit-btn" style={{
                  display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none"
                }}>
                  Sign In Now
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
