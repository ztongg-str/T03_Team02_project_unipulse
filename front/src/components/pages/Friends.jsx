import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { friendsAPI, savedEventsAPI } from "../../services/api";

const CATEGORIES = [
  { id: "all", label: "All Friends", icon: "users" },
  { id: "requests", label: "Requests", icon: "user-plus" },
  { id: "saved", label: "Saved", icon: "bookmark" },
];

export default function Friends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchFriends();
    fetchDiscover();
    fetchPendingRequests();
    fetchSentRequests();
  }, []);

  useEffect(() => {
    if (activeCategory === "saved") {
      fetchSavedEvents();
    }
  }, [activeCategory]);

  const fetchFriends = async () => {
    try {
      const res = await friendsAPI.getMy();
      setFriends(res.data || []);
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscover = async () => {
    try {
      const res = await friendsAPI.discover();
      setDiscover(res.data || []);
    } catch {
      setDiscover([]);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await friendsAPI.getPending();
      setPendingRequests(res.data || []);
    } catch {
      setPendingRequests([]);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const res = await friendsAPI.getSent();
      setSentRequests(res.data || []);
    } catch {
      setSentRequests([]);
    }
  };

  const fetchSavedEvents = async () => {
    setSavedLoading(true);
    try {
      const res = await savedEventsAPI.getAll();
      setSavedEvents(res.data || []);
    } catch {
      setSavedEvents([]);
    } finally {
      setSavedLoading(false);
    }
  };

  const handleUnsave = async (eventId) => {
    try {
      await savedEventsAPI.unsave(eventId);
      setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
      setMsg({ type: "success", text: "Event removed from saved" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to unsave" });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await friendsAPI.search(searchQuery);
      setSearchResults(res.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (userId) => {
    try {
      await friendsAPI.add(userId);
      setMsg({ type: "success", text: "Friend request sent!" });
      setSearchResults([]);
      setSearchQuery("");
      fetchDiscover();
      fetchSentRequests();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to send request" });
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await friendsAPI.acceptRequest(requestId);
      setMsg({ type: "success", text: "Friend request accepted!" });
      fetchPendingRequests();
      fetchFriends();
      fetchDiscover();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to accept request" });
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await friendsAPI.declineRequest(requestId);
      setMsg({ type: "success", text: "Friend request declined" });
      fetchPendingRequests();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to decline request" });
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove this friend?")) return;
    try {
      await friendsAPI.remove(id);
      setMsg({ type: "success", text: "Friend removed" });
      fetchFriends();
      fetchDiscover();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to remove" });
    }
  };

  const filteredFriends = activeCategory === "all"
    ? friends
    : [];

  const isFriend = (userId) => friends.some((f) => f.friendId === userId);

  const hasPendingRequest = (userId) =>
    pendingRequests.some((r) => r.fromUserId === userId);

  const hasSentRequest = (userId) =>
    sentRequests.some((r) => r.toUserId === userId);

  const categoryIcon = (icon, active) => {
    const color = active ? "#FF7A00" : "currentColor";
    if (icon === "users") {
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="5" r="3" stroke={color} strokeWidth="2"/><circle cx="11" cy="5" r="3" stroke={color} strokeWidth="2"/><path d="M2 15c0-3 2-5 5-5h4c3 0 5 2 5 5" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
    }
    if (icon === "user-plus") {
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="5" r="3" stroke={color} strokeWidth="2"/><path d="M12 5v6M15 8h-6" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M2 14c0-3 2-5 5-5h3" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
    }
    if (icon === "bookmark") {
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 2h10v14l-5-4-5 4V2z" stroke={color} strokeWidth="2" strokeLinejoin="round"/></svg>;
    }
    return null;
  };

  if (loading) return <div className="loading">Loading community...</div>;

  return (
    <div className="friends-layout">
      <aside className="friends-sidebar">
        <h2 className="friends-sidebar-title">Community</h2>

        <nav className="friends-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`friends-category ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {categoryIcon(cat.icon, activeCategory === cat.id)}
              <span>{cat.label}</span>
              {cat.id === "requests" && pendingRequests.length > 0 && (
                <span className="friends-pending-count">{pendingRequests.length}</span>
              )}
              </button>
          ))}
        </nav>
      </aside>

      <div className="friends-content">
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {activeCategory === "requests" ? (
          <>
            <div className="friends-section-header">
              <h3 className="friends-section-title">
                Pending Requests
                <span className="friends-count"> ({pendingRequests.length})</span>
              </h3>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <h3>No pending requests</h3>
                <p>When someone sends you a friend request, it will appear here</p>
              </div>
            ) : (
              <div className="friends-pending-section">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="friends-pending-card">
                    <div className="friends-pending-avatar overflow-hidden">
                      {req.avatar ? (
                        <img src={`http://localhost:4000${req.avatar}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        req.fullName?.charAt(0) || req.username?.charAt(0)
                      )}
                    </div>
                    <div className="friend-card-name">{req.fullName}</div>
                    <div className="friend-card-username">@{req.username}</div>
                    <div className="friends-pending-actions">
                      <button className="friends-pending-accept" onClick={() => handleAccept(req.id)}>
                        Accept
                      </button>
                      <button className="friends-pending-decline" onClick={() => handleDecline(req.id)}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeCategory === "saved" ? (
          <>
            <div className="friends-section-header">
              <h3 className="friends-section-title">
                Saved Events
                <span className="friends-count"> ({savedEvents.length})</span>
              </h3>
            </div>

            {savedLoading ? (
              <div className="loading">Loading saved events...</div>
            ) : savedEvents.length === 0 ? (
              <div className="empty-state">
                <h3>No saved events</h3>
                <p>Save events from the Events page to build your collection</p>
                <Link to="/events" className="btn btn-primary mt-4 inline-flex">Browse Events</Link>
              </div>
            ) : (
              <div className="friends-grid">
                {savedEvents.map((ev) => (
                  <div key={ev.id} className="friend-suggested-card" style={{ cursor: "pointer" }} onClick={() => navigate(`/events/${ev.id}`)}>
                    <div className="friend-card-avatar w-16 h-16 text-2xl overflow-hidden rounded-xl">
                      {ev.image ? (
                        <img src={`http://localhost:4000${ev.image}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        ev.title?.charAt(0)
                      )}
                    </div>
                    <div className="friend-card-name text-base">{ev.title}</div>
                    <div className="friend-card-username text-xs">{ev.category} &middot; {ev.date ? new Date(ev.date).toLocaleDateString() : ""}</div>
                    <button className="friend-card-remove mt-1" onClick={(e) => { e.stopPropagation(); handleUnsave(ev.id); }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="friends-search-bar">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="5" stroke="#85736B" strokeWidth="2"/>
                <path d="M12 12l4 4" stroke="#85736B" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="friends-search-btn" onClick={handleSearch} disabled={searching}>
                {searching ? "..." : "Search"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="friends-search-results">
                <h3 className="friends-section-title">Search Results</h3>
                <div className="friends-grid">
                  {searchResults.map((u) => (
                    <div key={u.id} className="friend-status-card">
                      <div className="friend-card-avatar overflow-hidden">
                        {u.avatar ? (
                          <img src={`http://localhost:4000${u.avatar}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          u.fullName?.charAt(0) || u.username?.charAt(0)
                        )}
                      </div>
                      <div className="friend-card-name">{u.fullName || u.username}</div>
                      <div className="friend-card-username">@{u.username}</div>
                      {u.friendStatus === 'accepted' || isFriend(u.id) ? (
                        <button className="friend-card-add-btn" disabled style={{ opacity: 0.6 }}>
                          Friends
                        </button>
                      ) : u.friendStatus === 'sent' || hasSentRequest(u.id) ? (
                        <button className="friend-card-add-btn" disabled style={{ opacity: 0.6 }}>
                          Request Sent
                        </button>
                      ) : u.friendStatus === 'received' || hasPendingRequest(u.id) ? (
                        <button className="friend-card-add-btn" disabled style={{ opacity: 0.6 }}>
                          Respond
                        </button>
                      ) : (
                        <button className="friend-card-add-btn" onClick={() => handleAdd(u.id)}>
                          Add Friend
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="friends-section-header">
              <h3 className="friends-section-title">
                All Friends
                <span className="friends-count"> ({filteredFriends.length})</span>
              </h3>
            </div>

            {filteredFriends.length === 0 ? (
              <div className="empty-state">
                <h3>No friends yet</h3>
                <p>Search for people to connect with</p>
              </div>
            ) : (
              <div className="friends-grid">
                {filteredFriends.map((f) => (
                    <Link key={f.id} to={`/friends/profile/${f.friendId}`} className="friend-status-card">
                      <div className="friend-card-top">
                        <div className="friend-card-avatar overflow-hidden">
                          {f.avatar ? (
                            <img src={`http://localhost:4000${f.avatar}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            f.fullName?.charAt(0) || f.username?.charAt(0)
                          )}
                        </div>
                      </div>
                      <div className="friend-card-name">{f.fullName}</div>
                      <div className="friend-card-username">@{f.username}</div>
                      <button className="friend-card-remove" onClick={(e) => { e.preventDefault(); handleRemove(f.id); }}>
                        Remove
                      </button>
                    </Link>
                  ))}
              </div>
            )}

            {discover.length > 0 && (
              <div className="friends-suggested">
                <h3 className="friends-section-title">People you may know</h3>
                <div className="friends-suggested-grid">
                  {discover.map((u) => (
                    <div key={u.id} className="friend-suggested-card">
                      <div className="friend-card-avatar w-12 h-12 text-lg">
                        {u.avatar ? (
                          <img src={`http://localhost:4000${u.avatar}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          u.fullName?.charAt(0) || u.username?.charAt(0)
                        )}
                      </div>
                      <div className="friend-card-name">{u.fullName || u.username}</div>
                      <div className="friend-card-username">@{u.username}</div>
                      {isFriend(u.id) ? (
                        <button className="friend-card-invite" disabled style={{ opacity: 0.6 }}>
                          Friends
                        </button>
                      ) : hasSentRequest(u.id) ? (
                        <button className="friend-card-invite" disabled style={{ opacity: 0.6 }}>
                          Request Sent
                        </button>
                      ) : hasPendingRequest(u.id) ? (
                        <button className="friend-card-invite" disabled style={{ opacity: 0.6 }}>
                          Respond
                        </button>
                      ) : (
                        <button className="friend-card-invite" onClick={() => handleAdd(u.id)}>
                          Add Friend
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <button className="friends-fab" onClick={() => document.querySelector(".friends-search-bar input")?.focus()}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
