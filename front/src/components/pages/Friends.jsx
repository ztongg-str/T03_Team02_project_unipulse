import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { friendsAPI, savedEventsAPI } from "../../services/api";

const CATEGORIES = [
  { id: "all", label: "All Friends", icon: "users" },
  { id: "online", label: "Online Now", icon: "circle" },
  { id: "saved", label: "Saved", icon: "bookmark" },
  { id: "pending", label: "Pending Requests", icon: "clock" },
];

export default function Friends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchFriends();
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
      fetchFriends();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to send request" });
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove this friend?")) return;
    try {
      await friendsAPI.remove(id);
      setMsg({ type: "success", text: "Friend removed" });
      fetchFriends();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to remove" });
    }
  };

  const handleAccept = async (userId) => {
    try {
      await friendsAPI.add(userId);
      setMsg({ type: "success", text: "Friend request accepted!" });
      fetchFriends();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to accept" });
    }
  };

  const handleDecline = async (userId) => {
    try {
      await friendsAPI.remove(userId);
      setMsg({ type: "success", text: "Friend request declined" });
      fetchFriends();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to decline" });
    }
  };

  const getStatusDot = (status) => {
    if (status === "online") return { bg: "bg-green-500", label: "Online" };
    if (status === "away") return { bg: "bg-yellow", label: "Away" };
    return { bg: "bg-gray-300", label: "Offline" };
  };

  const filteredFriends = activeCategory === "all" || activeCategory === "online"
    ? friends
    : [];

  const suggestedFriends = [
    { id: "s1", name: "Maria Santos", username: "maria.s", mutual: 3 },
    { id: "s2", name: "Jose Garcia", username: "jose.g", mutual: 5 },
    { id: "s3", name: "Ana Cruz", username: "ana.c", mutual: 2 },
  ];

  const categoryIcon = (icon, active) => {
    const color = active ? "#FF7A00" : "currentColor";
    if (icon === "users") {
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="5" r="3" stroke={color} strokeWidth="2"/><circle cx="11" cy="5" r="3" stroke={color} strokeWidth="2"/><path d="M2 15c0-3 2-5 5-5h4c3 0 5 2 5 5" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
    }
    if (icon === "circle") {
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={color} strokeWidth="2"/><circle cx="9" cy="9" r="3" fill={color}/></svg>;
    }
    if (icon === "bookmark") {
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 2h10v14l-5-4-5 4V2z" stroke={color} strokeWidth="2" strokeLinejoin="round"/></svg>;
    }
    if (icon === "clock") {
      return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={color} strokeWidth="2"/><path d="M9 5v4l3 2" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
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
              {cat.id === "pending" && (
                <span className="friends-pending-count">2</span>
              )}
            </button>
          ))}
        </nav>

        <div className="friends-pending-section">
          <h3 className="friends-pending-title">Pending Requests</h3>
          {[
            { id: "p1", name: "Clara Reyes", username: "clara.r", club: "Music Club" },
            { id: "p2", name: "Mark Lim", username: "mark.l", club: "Sports Club" },
          ].map((req) => (
            <div key={req.id} className="friends-pending-card">
              <div className="friends-pending-avatar">
                {req.name.charAt(0)}
              </div>
              <div className="friends-pending-info">
                <div className="friends-pending-name">{req.name}</div>
                <div className="friends-pending-club">{req.club}</div>
              </div>
              <div className="friends-pending-actions">
                <button className="friends-pending-accept" onClick={() => handleAccept(req.id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <button className="friends-pending-decline" onClick={() => handleDecline(req.id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="friends-content">
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {activeCategory === "saved" ? (
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
                      <button className="friend-card-add-btn" onClick={() => handleAdd(u.id)}>
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="friends-section-header">
              <h3 className="friends-section-title">
                {CATEGORIES.find(c => c.id === activeCategory)?.label || "All Friends"}
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
                {filteredFriends.map((f) => {
                  const status = getStatusDot(["online", "away"][Math.floor(Math.random() * 2)]);
                  return (
                    <Link key={f.id} to={`/friends/profile/${f.friendId}`} className="friend-status-card">
                      <div className="friend-card-top">
                        <div className="friend-card-avatar overflow-hidden">
                          {f.avatar ? (
                            <img src={`http://localhost:4000${f.avatar}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            f.fullName?.charAt(0) || f.username?.charAt(0)
                          )}
                        </div>
                        <div className={`friend-status-dot ${status.bg}`} title={status.label} />
                      </div>
                      <div className="friend-card-name">{f.fullName}</div>
                      <div className="friend-card-username">@{f.username}</div>
                      <div className="friend-card-status">Living my best campus life 🎉</div>
                      <div className="friend-card-mutual">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="5" cy="4" r="2.5" stroke="#85736B" strokeWidth="1.5"/>
                          <circle cx="9" cy="4" r="2.5" stroke="#85736B" strokeWidth="1.5"/>
                          <path d="M1 12c0-2.5 2-4 4-4h4c2 0 4 1.5 4 4" stroke="#85736B" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>{Math.floor(Math.random() * 8) + 1} mutual connections</span>
                      </div>
                      <button className="friend-card-remove" onClick={(e) => { e.preventDefault(); handleRemove(f.id); }}>
                        Remove
                      </button>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="friends-suggested">
              <h3 className="friends-section-title">Suggested for You</h3>
              <div className="friends-suggested-grid">
                {suggestedFriends.map((sf) => (
                  <div key={sf.id} className="friend-suggested-card">
                    <div className="friend-card-avatar w-12 h-12 text-lg">
                      {sf.name.charAt(0)}
                    </div>
                    <div className="friend-card-name">{sf.name}</div>
                    <div className="friend-card-username">@{sf.username}</div>
                    <div className="friend-card-mutual">{sf.mutual} mutual connections</div>
                    <button className="friend-card-invite" onClick={() => handleAdd(sf.id)}>
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
