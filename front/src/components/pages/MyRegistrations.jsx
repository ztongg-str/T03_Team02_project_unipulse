import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { registrationsAPI } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../common/ConfirmModal";

export default function MyRegistrations() {
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await registrationsAPI.getMy();
      setRegistrations(res.data || []);
    } catch {
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId) => {
    setCancelling(eventId);
    try {
      const reg = registrations.find((r) => r.eventId === eventId);
      if (reg) await registrationsAPI.cancel(reg.id);
      setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));
      showToast("success", "Registration cancelled.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to cancel registration.");
    } finally {
      setCancelling(null);
      setCancelTarget(null);
    }
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
    <div className="page-container">
      <div className="page-header">
        <h1>My Registrations</h1>
        <p>Events you've signed up for</p>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          <h3>No registrations yet</h3>
          <p>Browse events and register for ones you like</p>
          <Link to="/events" className="btn btn-primary inline-flex mt-4">
            Browse Events
          </Link>
        </div>
      ) : (
        <div>
          {registrations.map((reg) => (
            <div key={reg.id} className="registration-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="registration-info">
                <Link to={`/events/${reg.eventId}`} className="no-underline text-inherit">
                  <h3>{reg.eventTitle}</h3>
                </Link>
                <p>{formatDate(reg.date)} &middot; {reg.location}</p>
                <p className="text-[13px] text-judge-gray mt-1">
                  Category: {reg.category}
                </p>
              </div>
              <button
                onClick={() => setCancelTarget(reg.eventId)}
                disabled={cancelling === reg.eventId}
                className="btn btn-outlined"
                style={{ fontSize: 13, padding: "6px 16px", flexShrink: 0 }}
              >
                {cancelling === reg.eventId ? "Cancelling..." : "Cancel"}
              </button>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel Registration"
        message="Are you sure you want to cancel your registration for this event?"
        confirmLabel="Yes, Cancel"
        onConfirm={() => handleCancel(cancelTarget)}
        onCancel={() => setCancelTarget(null)}
        danger
      />
    </div>
  );
}
