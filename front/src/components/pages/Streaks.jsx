import { useState, useEffect } from "react";
import { streaksAPI } from "../../services/api";

export default function Streaks() {
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreaks();
  }, []);

  const fetchStreaks = async () => {
    try {
      const res = await streaksAPI.getMy();
      setStreaks(res.data || []);
    } catch {
      setStreaks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const current = streaks[0] || { currentStreak: 0, longestStreak: 0 };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Streaks</h1>
        <p>Your engagement streak tracking</p>
      </div>

      {streaks.length === 0 ? (
        <div className="empty-state">
          <h3>No streak data yet</h3>
          <p>Start participating in events to build your streak</p>
        </div>
      ) : (
        <div className="streak-display">
          <div className="streak-box">
            <div className="streak-number">{current.currentStreak}</div>
            <div className="streak-label">Current Streak</div>
          </div>
          <div className="streak-box">
            <div className="streak-number">{current.longestStreak}</div>
            <div className="streak-label">Longest Streak</div>
          </div>
          <div className="streak-box">
            <div className="streak-number">
              {current.lastActivity
                ? new Date(current.lastActivity).toLocaleDateString()
                : "---"}
            </div>
            <div className="streak-label">Last Activity</div>
          </div>
        </div>
      )}
    </div>
  );
}
