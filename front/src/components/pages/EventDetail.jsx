import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsAPI, registrationsAPI, savedEventsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchEvent();
    checkSaved();
  }, [id, user]);

  const checkSaved = async () => {
    if (!user) return;
    try {
      const res = await savedEventsAPI.check(id);
      setSaved(res.data.saved);
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
    setMsg({ type: "", text: "" });
    try {
      await registrationsAPI.register(Number(id));
      setMsg({ type: "success", text: "Successfully registered for this event!" });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Registration failed",
      });
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

        {msg.text && (
          <div className={`alert alert-${msg.type}`}>{msg.text}</div>
        )}

        <div className="event-detail-actions">
          {user ? (
            <button
              className="btn btn-primary"
              onClick={handleRegister}
              disabled={registering}
            >
              {registering ? "Registering..." : "Register for Event"}
            </button>
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
