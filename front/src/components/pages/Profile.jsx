import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { achievementsAPI, friendsAPI, usersAPI, uploadAPI, historyAPI } from "../../services/api";

const API_BASE = "http://localhost:4000";

const INTEREST_OPTIONS = [
  "Music", "Technology", "Sports", "Art", "Networking",
  "Gaming", "Photography", "Reading", "Travel", "Cooking",
  "Fashion", "Film & TV", "Fitness", "Volunteering", "Entrepreneurship",
];

const achievementIcon = (ach) => ach.icon || '🏆';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  const [achievements, setAchievements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [friendCount, setFriendCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    interests: user?.interests || [],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ avatar: false, cover: false });
  const [coverMenuOpen, setCoverMenuOpen] = useState(false);
  const avatarRef = useRef(null);
  const coverRef = useRef(null);
  const coverMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (coverMenuRef.current && !coverMenuRef.current.contains(e.target)) {
        setCoverMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [achRes, evRes, frRes, userRes] = await Promise.allSettled([
        achievementsAPI.getMy(),
        historyAPI.getUpcoming(),
        friendsAPI.getMy(),
        usersAPI.getProfile(),
      ]);
      if (achRes.status === "fulfilled") setAchievements(achRes.value.data || []);
      if (evRes.status === "fulfilled") setUpcomingEvents((evRes.value.data || []).slice(0, 3));
      if (frRes.status === "fulfilled") setFriendCount(frRes.value.data?.length || 0);
      if (userRes.status === "fulfilled" && userRes.value.data) {
        updateUser(userRes.value.data);
      }
    } catch {}
  };

  const handleChange = (e) => {
    if (e.target.name === "interests") {
      const value = e.target.value;
      setForm({
        ...form,
        interests: form.interests.includes(value)
          ? form.interests.filter((i) => i !== value)
          : [...form.interests, value],
      });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile({
        ...form,
        interests: Array.isArray(form.interests) ? form.interests : [],
      });
      updateUser(res.data);
      showToast("success", "Profile updated successfully");
      setEditing(false);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadAPI.file(fd);
      const field = type === "avatar" ? "avatar" : "cover_image";
      const updated = await usersAPI.updateProfile({ [field]: res.url });
      updateUser(updated.data);
      showToast("success", `${type === "avatar" ? "Avatar" : "Cover photo"} updated`);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const allInterests = user?.interests?.length
    ? user.interests
    : ["Music", "Technology", "Sports", "Art", "Networking"];

  if (!user) return null;

  const avatarSrc = user.avatar ? `${API_BASE}${user.avatar}` : null;
  const coverSrc = user.cover_image ? `${API_BASE}${user.cover_image}` : null;

  return (
    <div className="profile-page">
      <input type="file" ref={coverRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "cover"); e.target.value = ""; }} />
      <input type="file" ref={avatarRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "avatar"); e.target.value = ""; }} />

      {/* Cover Photo */}
      <div className="profile-cover cursor-pointer relative" style={coverSrc ? { background: `url(${coverSrc}) center/cover no-repeat` } : {}} onClick={() => coverRef.current?.click()}>
        <div className="profile-cover-gradient" />

        {/* Three-dot menu top-right */}
        <div className="profile-cover-menu-wrapper" ref={coverMenuRef}>
          <button
            className="profile-cover-dots"
            onClick={(e) => { e.stopPropagation(); setCoverMenuOpen(prev => !prev); }}
            aria-label="Cover options"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="4" r="2" />
              <circle cx="10" cy="10" r="2" />
              <circle cx="10" cy="16" r="2" />
            </svg>
          </button>
          {coverMenuOpen && (
            <div className="profile-cover-dropdown">
              <button className="profile-cover-dropdown-item" onClick={(e) => { e.stopPropagation(); setCoverMenuOpen(false); coverRef.current?.click(); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 12l4-4 3 3 3-3 2 2v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="11" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Edit Photo
              </button>
              {coverSrc && (
                <button className="profile-cover-dropdown-item danger" onClick={async (e) => {
                  e.stopPropagation();
                  setCoverMenuOpen(false);
                  try {
                    setUploading(prev => ({ ...prev, cover: true }));
                    const res = await usersAPI.updateProfile({ cover_image: "" });
                    updateUser(res.data);
                    showToast("success", "Cover photo removed");
                  } catch (err) {
                    showToast("error", err.response?.data?.message || "Failed to remove cover");
                  } finally {
                    setUploading(prev => ({ ...prev, cover: false }));
                  }
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5 4V2.5a1 1 0 011-1h4a1 1 0 011 1V4M13 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 7v5M10 7v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Delete Photo
                </button>
              )}
            </div>
          )}
        </div>

        <div className="profile-cover-actions">
          {uploading.cover && (
            <button className="profile-cover-btn" disabled>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4" />
              </svg>
              Uploading...
            </button>
          )}
        </div>

        {/* Avatar — absolute over cover */}
        <div className="profile-avatar-wrapper absolute" style={{ bottom: "-90px", left: "32px", zIndex: 10 }}>
          <div
            className="profile-avatar-large cursor-pointer overflow-hidden"
            onClick={() => avatarRef.current?.click()}
          >
            {uploading.avatar ? (
              <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4" opacity="0.7"/>
              </svg>
            ) : avatarSrc ? (
              <img src={avatarSrc} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user.fullName?.charAt(0) || user.username?.charAt(0)
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer" onClick={() => avatarRef.current?.click()}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 1.5l2 2L6 10H4V8l6.5-6.5z" stroke="#FF7A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-header-section">
          <div className="profile-info-section">
            <h1 className="profile-name">{user.fullName}</h1>
            <p className="profile-username">@{user.username} &middot; {user.role}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
            <p className="profile-joined">Joined {formatDate(user.createdAt)}</p>
            <button
              className="btn btn-secondary btn-small mt-3"
              onClick={() => {
                setForm({
                  fullName: user?.fullName || "",
                  bio: user?.bio || "",
                  interests: user?.interests || [],
                });
                setEditing(true);
              }}
            >
              Edit Profile
            </button>
          </div>

          {/* Level Card */}
          <div className="profile-level-card">
            <div className="profile-level-value">Lv.{user?.level || 1}</div>
            <div className="profile-xp-bar-wrapper">
              <div className="profile-xp-bar">
                <div className="profile-xp-bar-fill" style={{ width: `${user?.xp ? ((user.xp % ((user.level || 1) * 100)) / ((user.level || 1) * 100)) * 100 : 0}%` }} />
              </div>
              <div className="profile-xp-label">{user?.xp || 0} / {(user?.level || 1) * 100} XP</div>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="profile-section">
          <div className="profile-section-header">
            <h3 className="profile-section-title">Interests</h3>
          </div>
          <div className="profile-interests">
            {allInterests.map((interest, i) => (
              <span key={i} className="profile-interest-tag">{interest}</span>
            ))}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {editing && (
          <div className="modal-overlay" onClick={() => { setEditing(false); setForm({ fullName: user?.fullName || "", bio: user?.bio || "", interests: user?.interests || [] }); }}>
            <div className="modal-content profile-edit-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Edit Profile</h3>
              <div className="flex flex-col gap-4 mt-4">
                <div className="auth-input-group">
                  <label>Full Name</label>
                  <div className="auth-input-wrapper">
                    <input name="fullName" value={form.fullName} onChange={handleChange} />
                  </div>
                </div>
                <div className="auth-input-group">
                  <label>Bio</label>
                  <div className="auth-input-wrapper">
                    <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell us about yourself" />
                  </div>
                </div>
                <div className="auth-input-group">
                  <label>Interests</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {INTEREST_OPTIONS.map((opt) => {
                      const selected = form.interests.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          name="interests"
                          value={opt}
                          onClick={handleChange}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            selected
                              ? "bg-orange text-white border-orange"
                              : "bg-white text-judge-gray border-border-color hover:border-orange"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-actions mt-6">
                <button className="btn btn-outlined" onClick={() => { setEditing(false); setForm({ fullName: user?.fullName || "", bio: user?.bio || "", interests: user?.interests || [] }); }}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="profile-stats-grid">
          <div className="profile-stat">
            <div className="profile-stat-value">{upcomingEvents.length}</div>
            <div className="profile-stat-label">Events Attended</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{friendCount}</div>
            <div className="profile-stat-label">Friends</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{user?.level || 1}</div>
            <div className="profile-stat-label">Level</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{achievements.length}</div>
            <div className="profile-stat-label">Achievements</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="profile-section">
          <div className="profile-section-header">
            <h3 className="profile-section-title">Achievements &amp; Badges</h3>
            <Link to="/achievements" className="profile-section-link">View All</Link>
          </div>
          <div className="profile-achievements">
            {achievements.length === 0 ? (
              <>
                <div className="profile-achievement">
                  <div className="profile-ach-icon bg-orange/10 text-orange">🎯</div>
                  <div className="profile-ach-name">First Event</div>
                </div>
                <div className="profile-achievement">
                  <div className="profile-ach-icon bg-turquoise/10 text-turquoise">🔥</div>
                  <div className="profile-ach-name">Week Warrior</div>
                </div>
                <div className="profile-achievement">
                  <div className="profile-ach-icon bg-wild-watermelon/10 text-wild-watermelon">👥</div>
                  <div className="profile-ach-name">Social Butterfly</div>
                </div>
                <div className="profile-achievement">
                  <div className="profile-ach-icon bg-yellow/15 text-yellow">⭐</div>
                  <div className="profile-ach-name">Event Star</div>
                </div>
              </>
            ) : (
              achievements.slice(0, 4).map((ach) => (
                <div key={ach.id} className="profile-achievement">
                  <div className="profile-ach-icon bg-orange/10 text-orange">
                    {achievementIcon(ach)}
                  </div>
                  <div className="profile-ach-name">{ach.name}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="profile-section">
          <div className="profile-section-header">
            <h3 className="profile-section-title">Upcoming Events</h3>
            <Link to="/my-registrations" className="profile-section-link">View All</Link>
          </div>
          <div className="profile-upcoming-grid">
            {upcomingEvents.length === 0 ? (
              <div className="profile-empty">No upcoming events. <Link to="/events">Explore events</Link></div>
            ) : (
              upcomingEvents.map((ev) => (
                <Link key={ev.id} to={`/events/${ev.id}`} className="profile-upcoming-card">
                  <div className="profile-upcoming-date">
                    <div className="profile-upcoming-month">{formatEventDate(ev.date).split(" ")[0]}</div>
                    <div className="profile-upcoming-day">{formatEventDate(ev.date).split(" ")[1]}</div>
                  </div>
                  <div className="profile-upcoming-info">
                    <div className="profile-upcoming-title">{ev.title}</div>
                    <div className="profile-upcoming-location">{ev.location || "Campus"}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
