import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { eventsAPI } from "../../services/api";

export default function QRCheckIn() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState({});
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventsAPI.getMy({ status: "approved" });
      const evts = res.data || [];
      setEvents(evts);

      const codes = {};
      for (const ev of evts) {
        codes[ev.id] = await QRCode.toDataURL(String(ev.id), {
          width: 300,
          margin: 2,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        });
      }
      setQrCodes(codes);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (eventId, title) => {
    setDownloading(eventId);
    const link = document.createElement("a");
    link.download = `${title.replace(/\s+/g, "_")}_QR.png`;
    link.href = qrCodes[eventId];
    link.click();
    setDownloading(null);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="page-header">
        <h1>Event QR Codes</h1>
        <p>Download or print QR codes for each event to display at the venue.</p>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <h3>No approved events yet</h3>
          <p>Create and publish an event to generate its QR code.</p>
          <Link to="/organizer/create-event" className="btn btn-primary inline-flex mt-4">
            Create Event
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {events.map((ev) => (
            <div
              key={ev.id}
              className="qr-event-card"
            >
              <div
                style={{
                  width: 130,
                  height: 130,
                  flexShrink: 0,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {qrCodes[ev.id] ? (
                  <img
                    src={qrCodes[ev.id]}
                    alt={`QR for ${ev.title}`}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ color: "#aaa", fontSize: 12 }}>Generating...</span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "#3E2723" }}>
                  {ev.title}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "#8D6E63" }}>
                  {formatDate(ev.date)} &middot; {ev.location}
                </p>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#A1887F" }}>Code:</span>
                  <span style={{
                    fontFamily: "monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: 6,
                    color: "#3E2723",
                    background: "#FFF0E5",
                    padding: "4px 12px",
                    borderRadius: 8,
                  }}>
                    {ev.checkin_code || "------"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => downloadQR(ev.id, ev.title)}
                  disabled={!qrCodes[ev.id]}
                  className="btn btn-primary"
                  style={{ padding: "8px 16px", fontSize: 13, whiteSpace: "nowrap" }}
                >
                  {downloading === ev.id ? "Downloading..." : "Download QR"}
                </button>
                <Link
                  to={`/events/${ev.id}`}
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: "#FF7A00",
                    textDecoration: "underline",
                  }}
                >
                  View Event
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
