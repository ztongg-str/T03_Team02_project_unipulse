import { useState, useEffect } from "react";
import { activityLogsAPI } from "../../services/api";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await activityLogsAPI.getMy();
      setLogs(res.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Activity Log</h1>
        <p>Your recent activity on UniPulse</p>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <h3>No activity yet</h3>
          <p>Your actions will appear here</p>
        </div>
      ) : (
        <div>
          {logs.map((log) => (
            <div key={log.id} className="activity-item">
              <div>
                <div className="activity-action">{log.action.replace(/_/g, " ")}</div>
                {log.details && (
                  <div className="text-[13px] text-judge-gray mt-1">
                    {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                  </div>
                )}
              </div>
              <div className="activity-time">{formatTime(log.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
