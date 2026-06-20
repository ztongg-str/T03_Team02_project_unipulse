import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { registrationsAPI } from "../../services/api";

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

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
            <div key={reg.id} className="registration-card">
              <div className="registration-info">
                <Link to={`/events/${reg.eventId}`} className="no-underline text-inherit">
                  <h3>{reg.eventTitle}</h3>
                </Link>
                <p>{formatDate(reg.date)} &middot; {reg.location}</p>
                <p className="text-[13px] text-judge-gray mt-1">
                  Category: {reg.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
