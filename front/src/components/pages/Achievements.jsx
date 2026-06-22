import { useState, useEffect } from "react";
import { achievementsAPI } from "../../services/api";

const ACHIEVEMENT_META = {
  "register_1_event": {
    icon: "\uD83D\uDCDD",
    hint: "Register for your first event",
    color: "#FF7A00",
    bg: "rgba(255,122,0,0.12)",
  },
  "attend_3_events": {
    icon: "\uD83C\uDFAF",
    hint: "Attend 3 events to unlock",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
  },
  "add_3_friends": {
    icon: "\uD83E\uDD1D",
    hint: "Add 3 friends to unlock",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
  },
  "add_10_friends": {
    icon: "\uD83D\uDC65",
    hint: "Add 10 friends to unlock",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.12)",
  },
  "explore_3_categories": {
    icon: "\uD83D\uDDFA\uFE0F",
    hint: "Explore 3 event categories",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
  },
  "streak_3_days": {
    icon: "\uD83D\uDD25",
    hint: "Maintain a 3-day streak",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
  },
  "streak_7_days": {
    icon: "\uD83D\uDCAA",
    hint: "Maintain a 7-day streak",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.12)",
  },
  "complete_profile": {
    icon: "\u2B50",
    hint: "Complete your profile",
    color: "#FF7A00",
    bg: "rgba(255,122,0,0.12)",
  },
  "book_5_events": {
    icon: "\uD83D\uDCDA",
    hint: "Register for 5 events",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.12)",
  },
  "earn_5_achievements": {
    icon: "\uD83C\uDFC6",
    hint: "Earn 5 other achievements first",
    color: "#FF7A00",
    bg: "rgba(255,122,0,0.12)",
  },
};

export default function Achievements() {
  const [allAchievements, setAllAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await achievementsAPI.getAllWithStatus();
      setAllAchievements(res.data || []);
    } catch {
      setAllAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const unlocked = allAchievements.filter((a) => a.unlocked);
  const locked = allAchievements.filter((a) => !a.unlocked);
  const total = allAchievements.length;
  const pct = total > 0 ? Math.round((unlocked.length / total) * 100) : 0;

  const ProgressRing = () => {
    const r = 80;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
      <div className="ach-hero-ring-wrap">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={r} fill="none" stroke="#F2E5E1" strokeWidth="12" />
          <circle
            cx="100" cy="100"
            r={r}
            fill="none"
            stroke="url(#achGrad)"
            strokeWidth="12"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="transition-[stroke-dashoffset] duration-[600ms]"
          />
          <defs>
            <linearGradient id="achGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#FF9433" />
            </linearGradient>
          </defs>
        </svg>
        <div className="ach-hero-ring-center">
          <span className="ach-hero-ring-num">{unlocked.length}</span>
          <span className="ach-hero-ring-label">/{total} earned</span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container ach-page">
      {/* Hero */}
      <section className="ach-hero">
        <div className="ach-hero-text">
          <h1 className="ach-hero-title">Achievements</h1>
          <p className="ach-hero-sub">
            Complete challenges to earn badges and track your campus journey.
          </p>
          <div className="ach-hero-stats">
            <div className="ach-stat unlocked">
              <span className="ach-stat-num">{unlocked.length}</span>
              <span className="ach-stat-label">Unlocked</span>
            </div>
            <div className="ach-stat locked">
              <span className="ach-stat-num">{locked.length}</span>
              <span className="ach-stat-label">Locked</span>
            </div>
            <div className="ach-stat total">
              <span className="ach-stat-num">{total}</span>
              <span className="ach-stat-label">Total</span>
            </div>
          </div>
        </div>
        <ProgressRing />
      </section>

      {/* Earned Section */}
      {unlocked.length > 0 && (
        <section className="ach-section">
          <div className="ach-section-header">
            <h2> Earned</h2>
            <span className="ach-section-badge">{unlocked.length}</span>
          </div>
          <div className="ach-grid">
            {unlocked.map((a) => {
              const meta = ACHIEVEMENT_META[a.criteria] || {};
              return (
                <div
                  key={a.id}
                  className="ach-card ach-card-unlocked"
                  style={{ borderTopColor: meta.color || "#FF7A00" }}
                >
                  <div
                    className="ach-card-icon"
                    style={{ background: meta.bg || "rgba(255,122,0,0.1)" }}
                  >
                    <span>{meta.icon || "\uD83C\uDFC5"}</span>
                  </div>
                  <h3 className="ach-card-name">{a.name}</h3>
                  <p className="ach-card-desc">{a.description}</p>
                  <div className="ach-card-earned">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="#22c55e" />
                      <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Earned {new Date(a.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Locked Section */}
      {locked.length > 0 && (
        <section className="ach-section">
          <div className="ach-section-header">
            <h2> Locked</h2>
            <span className="ach-section-badge ach-section-badge-locked">{locked.length}</span>
          </div>
          <div className="ach-grid">
            {locked.map((a) => {
              const meta = ACHIEVEMENT_META[a.criteria] || {};
              return (
                <div key={a.id} className="ach-card ach-card-locked">
                  <div className="ach-card-icon ach-card-icon-locked">
                    <span>{meta.icon || "\uD83C\uDFC5"}</span>
                    <div className="ach-lock-overlay">
                      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                        <rect x="1.5" y="8.5" width="13" height="11" rx="2" stroke="#85736E" strokeWidth="1.5" />
                        <path d="M4.5 8.5V5.5C4.5 3.29 6.29 1.5 8.5 1.5C10.71 1.5 12.5 3.29 12.5 5.5V8.5" stroke="#85736E" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="8.5" cy="13.5" r="1.5" fill="#85736E" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="ach-card-name">{a.name}</h3>
                  <p className="ach-card-desc">{a.description}</p>
                  <div className="ach-card-hint">
                    <span
                      className="inline-block px-3 py-1 rounded-full font-semibold text-xs leading-4 tracking-[0.3px]"
                      style={{ background: meta.bg || "rgba(255,122,0,0.1)", color: meta.color || "#FF7A00" }}
                    >
                      {meta.hint || a.criteria}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="empty-state">
          <h3>No achievements available</h3>
          <p>Check back later for challenges to complete</p>
        </div>
      )}
    </div>
  );
}
