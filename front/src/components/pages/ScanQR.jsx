import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { attendanceAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function ScanQR() {
  const [tab, setTab] = useState("scan"); // "scan" | "code"
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeInput, setCodeInput] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!scanning || result) return;
    let cancelled = false;

    const init = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("NOT_SUPPORTED");
        }
        const scanner = new Html5Qrcode("qr-reader");
        if (cancelled) return;
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => { if (!cancelled) handleScan(decodedText); },
          () => {}
        );
      } catch (err) {
        if (cancelled) return;
        if (err?.message === "NOT_SUPPORTED") {
          setError("Camera not available. Make sure you're using HTTPS on your phone\u2019s browser and grant camera permission.");
        } else {
          setError("Could not access camera. Please allow camera permissions in your browser settings.");
        }
        setScanning(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [scanning]);

  const startScanner = () => {
    setError("");
    setMessage("");
    setResult(null);
    setScanning(true);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScan = async (eventId) => {
    await stopScanner();
    setResult(eventId);
    setLoading(true);

    try {
      const res = await attendanceAPI.checkIn(eventId);
      setMessage(res.message || "Check-in successful! You earned 50 XP.");
    } catch (err) {
      const msg = err.response?.data?.message || "Check-in failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...codeInput];
    next[index] = value;
    setCodeInput(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeInput[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      submitCode();
    }
  };

  const submitCode = async () => {
    const code = codeInput.join("");
    if (code.length !== 6) return;
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await attendanceAPI.checkInByCode(code);
      setMessage(res.message || "Check-in successful! You earned 50 XP.");
      setResult("code");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid code. Please try again.";
      setError(msg);
      setCodeInput(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
    setMessage("");
    setCodeInput(["", "", "", "", "", ""]);
  };

  const codeDigits = codeInput.map((d, i) => (
    <input
      key={i}
      ref={(el) => (inputRefs.current[i] = el)}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={d}
      onChange={(e) => handleCodeDigitChange(i, e.target.value)}
      onKeyDown={(e) => handleCodeKeyDown(i, e)}
      style={{
        width: 44,
        height: 52,
        fontSize: 24,
        fontWeight: 700,
        fontFamily: "monospace",
        textAlign: "center",
        border: error ? "2px solid #C62828" : "2px solid #E0D5CF",
        borderRadius: 10,
        outline: "none",
        color: "#3E2723",
        background: "#fff",
        transition: "border-color 0.15s",
      }}
      onFocus={(e) => { e.target.style.borderColor = "#FF7A00"; }}
      onBlur={(e) => { e.target.style.borderColor = error ? "#C62828" : "#E0D5CF"; }}
    />
  ));

  return (
    <div className="page-container" style={{ maxWidth: 500, margin: "0 auto" }}>
      <div className="page-header">
        <h1>Check In</h1>
        <p>Scan the event QR code or enter the 6-digit code displayed at the venue.</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "#F5F0EB", borderRadius: 12, padding: 4 }}>
          <button
            onClick={() => { setTab("scan"); setError(""); }}
            style={{
              flex: 1,
              padding: "10px 16px",
              border: "none",
              borderRadius: 10,
              background: tab === "scan" ? "#fff" : "transparent",
              color: tab === "scan" ? "#FF7A00" : "#8D6E63",
              fontWeight: tab === "scan" ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "var(--font)",
              boxShadow: tab === "scan" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="5" height="5" rx="1" />
              <rect x="16" y="3" width="5" height="5" rx="1" />
              <rect x="3" y="16" width="5" height="5" rx="1" />
              <rect x="16" y="16" width="5" height="5" rx="1" />
              <path d="M8 7h8M8 17h8M7 8v8M17 8v8" />
            </svg>
            Scan QR
          </button>
          <button
            onClick={() => { setTab("code"); setError(""); }}
            style={{
              flex: 1,
              padding: "10px 16px",
              border: "none",
              borderRadius: 10,
              background: tab === "code" ? "#fff" : "transparent",
              color: tab === "code" ? "#FF7A00" : "#8D6E63",
              fontWeight: tab === "code" ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "var(--font)",
              boxShadow: tab === "code" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 12h18M12 3v18" />
            </svg>
            Enter Code
          </button>
        </div>

        {tab === "scan" && !scanning && !result && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, margin: "0 auto 16px",
              background: error ? "#FFEBEE" : "#FFF0E0",
              borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              {error ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 8v4M12 16h.01" /><circle cx="12" cy="12" r="10" />
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="5" height="5" rx="1" /><rect x="16" y="3" width="5" height="5" rx="1" />
                  <rect x="3" y="16" width="5" height="5" rx="1" /><rect x="16" y="16" width="5" height="5" rx="1" />
                  <path d="M8 7h8M8 17h8M7 8v8M17 8v8" />
                </svg>
              )}
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: error ? "#C62828" : "#3E2723" }}>
              {error ? "Camera Error" : "Scan to Check In"}
            </h3>
            <p style={{ margin: "0 0 4px", fontSize: 14, color: error ? "#C62828" : "#8D6E63" }}>
              {error || "Point your camera at the event QR code"}
            </p>
            {!error && (
              <button onClick={startScanner} className="btn btn-primary" style={{ padding: "12px 32px", fontSize: 15 }}>
                Open Camera
              </button>
            )}
            {error && (
              <button onClick={() => setError("")} className="btn btn-primary" style={{ padding: "12px 32px", fontSize: 15, marginTop: 12 }}>
                Try Again
              </button>
            )}
          </div>
        )}

        {tab === "scan" && scanning && (
          <div>
            <div id="qr-reader" style={{ width: "100%", maxWidth: 400, margin: "0 auto", borderRadius: 12, overflow: "hidden" }} />
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button onClick={stopScanner} className="btn btn-outlined" style={{ padding: "10px 24px", fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        )}

        {tab === "code" && !result && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, margin: "0 auto 16px",
              background: error ? "#FFEBEE" : "#FFF0E0",
              borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={error ? "#C62828" : "#FF7A00"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "#3E2723" }}>Enter Event Code</h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#8D6E63" }}>
              Type the 6-digit code shown at the venue
            </p>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
              {codeDigits}
            </div>

            {error && (
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#C62828" }}>{error}</p>
            )}

            <button
              onClick={submitCode}
              disabled={codeInput.join("").length !== 6 || loading}
              className="btn btn-primary"
              style={{ padding: "12px 32px", fontSize: 15, opacity: codeInput.join("").length !== 6 ? 0.5 : 1 }}
            >
              {loading ? "Checking in..." : "Check In"}
            </button>
          </div>
        )}

        {result && !scanning && (
          <div style={{ textAlign: "center" }}>
            {loading ? (
              <div style={{ padding: 32 }}><div className="loading">Checking in...</div></div>
            ) : message ? (
              <div>
                <div style={{
                  width: 64, height: 64, margin: "0 auto 16px",
                  background: "#E8F5E9", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "#2E7D32" }}>{message}</h3>
                {result !== "code" && (
                  <p style={{ margin: "0 0 20px", fontSize: 13, color: "#8D6E63" }}>Event #{result}</p>
                )}
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={handleReset} className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>Check In Again</button>
                  <button onClick={() => navigate("/history")} className="btn btn-outlined" style={{ padding: "10px 20px", fontSize: 14 }}>View History</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  width: 64, height: 64, margin: "0 auto 16px",
                  background: "#FFEBEE", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: "#C62828" }}>{error}</h3>
                <button onClick={handleReset} className="btn btn-primary" style={{ padding: "10px 24px", fontSize: 14, marginTop: 16 }}>Try Again</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
