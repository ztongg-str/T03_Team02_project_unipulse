import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsAPI, registrationsAPI, savedEventsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

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
          <span>&#128205;{" "}
            {event.location ? (
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-orange-100 text-orange-700 text-sm font-semibold hover:bg-orange-200 transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {event.location}
              </a>
            ) : (
              event.location
            )}
          </span>
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
              <span className="badge badge-green" style={{ fontSize: 14, padding: "10px 20px" }}>
                You're registered
              </span>
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
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/events")}
          >
            Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}
