import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { friendsAPI } from "../../services/api";

export default function FriendProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventTab, setEventTab] = useState("upcoming");

  useEffect(() => {
    fetchFriend();
  }, [userId]);

  const fetchFriend = async () => {
    try {
      const res = await friendsAPI.getProfile(userId);
      setFriend(res.data);
    } catch {
      navigate("/friends");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const now = new Date();
  const upcomingEvents = (friend?.events || []).filter(
    (e) => new Date(e.date) >= now
  );
  const pastEvents = (friend?.events || []).filter(
    (e) => new Date(e.date) < now
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (!friend) return null;

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-avatar-large overflow-hidden">
          {friend.avatar ? (
            <img src={`http://localhost:4000${friend.avatar}`} alt="" className="w-full h-full object-cover" />
          ) : (
            friend.fullName?.charAt(0) || friend.username?.charAt(0)
          )}
        </div>
        <div className="profile-info">
          <h1>{friend.fullName}</h1>
          <p>@{friend.username} &middot; {friend.role} &middot; Lv.{friend.level || 1}</p>
          {friend.bio && <p className="mt-2">{friend.bio}</p>}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-judge-gray">
              Joined {formatDate(friend.createdAt)}
            </span>
            <span className="text-sm font-semibold" style={{ color: "#FF7A00" }}>
              {friend.friendCount || 0} {friend.friendCount === 1 ? "Friend" : "Friends"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6 mb-4">
        <button className="btn btn-secondary btn-small" onClick={() => navigate("/friends")}>
          &larr; Back to Friends
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-cocoa mb-4">Joined Events</h2>

        {friend.events && friend.events.length > 0 ? (
          <>
            <div className="flex gap-1 mb-4 border-b border-border-color">
              <button
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  eventTab === "upcoming"
                    ? "text-orange border-b-2 border-orange"
                    : "text-judge-gray hover:text-cocoa"
                }`}
                onClick={() => setEventTab("upcoming")}
              >
                Upcoming ({upcomingEvents.length})
              </button>
              <button
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  eventTab === "past"
                    ? "text-orange border-b-2 border-orange"
                    : "text-judge-gray hover:text-cocoa"
                }`}
                onClick={() => setEventTab("past")}
              >
                Past ({pastEvents.length})
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(eventTab === "upcoming" ? upcomingEvents : pastEvents).map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-xl p-4 border border-border-color cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/events/${ev.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-orange-bg flex items-center justify-center text-lg font-bold text-orange flex-shrink-0 overflow-hidden">
                      {ev.image ? (
                        <img src={`http://localhost:4000${ev.image}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        ev.title?.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-cocoa text-sm truncate">{ev.title}</div>
                      <div className="text-xs text-judge-gray mt-0.5">{ev.category}</div>
                      <div className="text-xs text-judge-gray mt-0.5">{formatDate(ev.date)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-border-color">
            <p className="text-judge-gray">No events joined yet</p>
          </div>
        )}
      </div>
    </div>
  );
}