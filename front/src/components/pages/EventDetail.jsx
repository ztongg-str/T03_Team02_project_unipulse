import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsAPI, registrationsAPI, savedEventsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../common/ConfirmModal";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchEvent();
    checkSaved();
    checkRegistered();
  }, [id, user]);

  const checkSaved = async () => {
    if (!user) return;
    try {
      const res = await savedEventsAPI.check(id);
      setSaved(res.data.saved);
    } catch {}
  };

  const checkRegistered = async () => {
    if (!user) return;
    try {
      const res = await registrationsAPI.check(id);
      setRegistered(res.data.registered);
    } catch {}
  };

  const toggleSave = async () => {
    if (!user) return;
    try {
      if (saved) {
        await savedEventsAPI.unsave(id);
        setSaved(false);
      } else {
        await savedEventsAPI.save(id);
        setSaved(true);
      }
    } catch {}
  };

  const fetchEvent = async () => {
    try {
      const res = await eventsAPI.getById(id);
      setEvent(res.data);
    } catch {
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setRegistering(true);
    try {
      await registrationsAPI.register(Number(id));
      setRegistered(true);
      showToast("success", "Successfully registered for this event!");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    setShowCancelModal(false);
    setRegistering(true);
    try {
      await registrationsAPI.cancelByEvent(Number(id));
      setRegistered(false);
      showToast("success", "Registration cancelled.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to cancel registration");
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="loading">Loading event...</div>;
  if (!event) return null;

  return (
    <div className="page-container">
      <div className="event-detail">
        <div className="event-detail-image">
          {event.image ? (
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <span>{event.category} Event</span>
          )}
        </div>

        <h1>{event.title}</h1>

        <div className="event-detail-meta">
          <span>&#128197; {formatDate(event.date)}</span>
          <span>&#128338; {formatTime(event.date)}</span>
          <span>&#128205; {event.location}</span>
          <span>&#128100; {event.organizerName}</span>
          <span>
            <span className={`badge ${event.status === "approved" ? "badge-green" : "badge-yellow"}`}>
              {event.status}
            </span>
          </span>
        </div>

        <div className="event-detail-description">
          {event.description}
        </div>

        <div className="mb-4 text-[15px] text-judge-gray">
          <strong>Category:</strong> {event.category}
          {event.maxParticipants && (
            <span className="ml-6">
              <strong>Max Participants:</strong> {event.maxParticipants}
            </span>
          )}
        </div>

        <div className="event-detail-actions">
          {user ? (
            registered ? (
              <button
                className="btn btn-outlined"
                onClick={() => setShowCancelModal(true)}
                disabled={registering}
              >
                {registering ? "Cancelling..." : "Cancel Registration"}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleRegister}
                disabled={registering}
              >
                {registering ? "Registering..." : "Register for Event"}
              </button>
            )
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/login")}
            >
              Log in to Register
            </button>
          )}
          {user && (
            <button
              className={`btn ${saved ? "btn-inverted" : "btn-outlined"}`}
              onClick={toggleSave}
            >
              {saved ? "Saved" : "Save Event"}
            </button>
          )}
          {registered && (
            <span className="badge badge-green" style={{ fontSize: 14, padding: "10px 20px" }}>
              You're registered
            </span>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/events")}
          >
            Back to Events
          </button>
        </div>
      </div>
      <ConfirmModal
        open={showCancelModal}
        title="Cancel Registration"
        message="Are you sure you want to cancel your registration for this event?"
        confirmLabel="Yes, Cancel"
        onConfirm={handleCancelRegistration}
        onCancel={() => setShowCancelModal(false)}
        danger
      />
    </div>
  );
}
