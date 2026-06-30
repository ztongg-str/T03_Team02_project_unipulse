import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsAPI, registrationsAPI } from "../../services/api";

export default function EventRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("detail");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [evRes, regRes] = await Promise.all([
        eventsAPI.getById(id),
        registrationsAPI.getEventRegistrations(id),
      ]);
      setEvent(evRes.data || evRes);
      setRegistrations(regRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error)
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        <button className="btn btn-outlined mt-4" onClick={() => navigate("/organizer/my-events")}>
          Back to My Events
        </button>
      </div>
    );

  const tabClass = (t) =>
    `px-5 py-2.5 text-sm font-semibold rounded-lg transition cursor-pointer ${
      tab === t
        ? "bg-orange-500 text-white shadow-md"
        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
    }`;

  return (
    <div className="w-full">
      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
        <button className={tabClass("detail")} onClick={() => setTab("detail")}>
          Event Detail
        </button>
        <button className={tabClass("attendee")} onClick={() => setTab("attendee")}>
          Attendee ({registrations.length})
        </button>
        <div className="ml-auto">
          <button
            className="px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-gray-800 rounded-lg transition cursor-pointer"
            onClick={() => navigate("/organizer/my-events")}
            title="Back to My Events"
          >
            Back
          </button>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="org-section-card min-h-[300px]">
        {tab === "detail" ? (
          <>
            <div className="org-section-header">
              <h2 className="org-section-title">Event Detail</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 1v2.5M11 1v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{event.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.date)} at {formatTime(event.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1C5 1 2.5 3 1 6c1.5 3 4 5 7 5s6-2 7-5c-1-3-3.5-5-7-5z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{event.location}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Location</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 4v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 capitalize">{event.category}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Category</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 4v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p>
                    <span className={`badge ${event.status === "approved" ? "badge-green" : event.status === "pending" ? "badge-yellow" : "badge-pink"}`}>
                      {event.status}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Status</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="org-section-header">
              <h2 className="org-section-title">
                Attendee ({registrations.length})
              </h2>
            </div>
            <div className="mt-4">
              {registrations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                      <circle cx="6" cy="5" r="3" stroke="#8A7A72" strokeWidth="1.5" />
                      <path d="M1 14c0-3 2.5-5 5-5s5 2 5 5" stroke="#8A7A72" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">No attendees yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30 transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                        {reg.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{reg.fullName}</p>
                        <p className="text-xs text-gray-400">{reg.email}</p>
                      </div>
                      <div className="text-xs text-gray-400 text-right whitespace-nowrap">
                        Joined {formatDate(reg.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
