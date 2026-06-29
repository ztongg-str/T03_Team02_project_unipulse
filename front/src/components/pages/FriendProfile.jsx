import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { friendsAPI } from "../../services/api";

export default function FriendProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <p>@{friend.username} &middot; {friend.role}</p>
          {friend.bio && <p className="mt-2">{friend.bio}</p>}
          <p className="mt-2 text-sm text-judge-gray">
            Joined {formatDate(friend.createdAt)}
          </p>
        </div>
      </div>

      <button className="btn btn-secondary btn-small" onClick={() => navigate("/friends")}>
        &larr; Back to Friends
      </button>
    </div>
  );
}
