import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventsAPI, savedEventsAPI, registrationsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { SkeletonCard } from "../common/Skeleton";

const categories = [
  { label: "All", icon: "shape", bg: "var(--orange-bg)", color: "#994700", filter: "" },
  { label: "Workshops", icon: "star", bg: "var(--yellow-bg)", color: "#735C00", filter: "workshop" },
  { label: "Festivals", icon: "heart", bg: "var(--pink-bg)", color: "#B32444", filter: "festival" },
  { label: "Sports", icon: "check", bg: "#DCFCE7", color: "#15803D", filter: "sports" },
  { label: "Academic", icon: "book", bg: "#DBEAFE", color: "#1D4ED8", filter: "academic" },
  { label: "Social", icon: "users", bg: "var(--orange-bg)", color: "#994700", filter: "social" },
  { label: "Cultural", icon: "globe", bg: "var(--yellow-bg)", color: "#735C00", filter: "cultural" },
  { label: "Networking", icon: "briefcase", bg: "var(--pink-bg)", color: "#B32444", filter: "networking" },
  { label: "Other", icon: "more", bg: "#DBEAFE", color: "#1D4ED8", filter: "other" },
];

const categoryIcon = (icon, color) => {
  const props = { width: 28, height: 34, className: "", fill: "none" };
  switch (icon) {
    case "shape":
      return <svg {...props} viewBox="0 0 28 34"><rect x="2.5" y="5.5" width="23" height="23" rx="3" stroke={color} strokeWidth="2"/><path d="M9 15l4 4 6-6" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
    case "star":
      return <svg {...props} viewBox="0 0 28 34"><path d="M14 3l3.5 8.5H26l-6.5 5.5L22 26l-8-5.5L6 26l2.5-9L2 11.5h8.5L14 3z" stroke={color} strokeWidth="2" strokeLinejoin="round"/></svg>;
    case "heart":
      return <svg {...props} viewBox="0 0 28 34"><path d="M14 28l-1.5-1.3C6.5 21.5 3 18.3 3 14.5 3 11.5 5.5 9 8.5 9c2 0 3.9 1 5.5 2.8C15.6 10 17.5 9 19.5 9 23 9 25.5 11.5 25.5 14.5c0 3.8-3.5 7-9.5 12.2L14 28z" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
    case "check":
      return <svg {...props} viewBox="0 0 28 34"><circle cx="14" cy="17" r="11" stroke={color} strokeWidth="2"/><path d="M10 16l3 3 5-5" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
    case "book":
      return <svg {...props} viewBox="0 0 28 34"><path d="M5 6h18v22H5z" stroke={color} strokeWidth="2" rx="2"/><path d="M5 14h18" stroke={color} strokeWidth="2"/><circle cx="10" cy="10" r="1.5" fill={color}/></svg>;
    case "users":
      return <svg {...props} viewBox="0 0 28 34"><circle cx="10" cy="9" r="4" stroke={color} strokeWidth="2"/><circle cx="18" cy="9" r="4" stroke={color} strokeWidth="2"/><path d="M3 27c0-4 3-8 7-8h8c4 0 7 4 7 8" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
    case "globe":
      return <svg {...props} viewBox="0 0 28 34"><circle cx="14" cy="17" r="11" stroke={color} strokeWidth="2"/><path d="M3 17h22M14 6c3 3 5 7 5 11s-2 8-5 11" stroke={color} strokeWidth="2"/><path d="M14 6c-3 3-5 7-5 11s2 8 5 11" stroke={color} strokeWidth="2"/></svg>;
    case "briefcase":
      return <svg {...props} viewBox="0 0 28 34"><rect x="3" y="10" width="22" height="16" rx="2" stroke={color} strokeWidth="2"/><path d="M10 10V7a2 2 0 012-2h4a2 2 0 012 2v3" stroke={color} strokeWidth="2"/><circle cx="14" cy="18" r="2" fill={color}/></svg>;
    default:
      return <svg {...props} viewBox="0 0 28 34"><circle cx="14" cy="17" r="10" stroke={color} strokeWidth="2"/><circle cx="14" cy="17" r="3" fill={color}/></svg>;
  }
};

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [savedIds, setSavedIds] = useState(new Set());
  const [registeredIds, setRegisteredIds] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, [search, activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeCategory) params.category = activeCategory;
      const eventsRes = await eventsAPI.getAll(params);
      const allEvents = eventsRes.data?.events || eventsRes.data || [];
      setEvents(allEvents.filter((e) => new Date(e.date) >= new Date()));
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedIds = async () => {
    try {
      const res = await savedEventsAPI.getAll();
      const events = res.data || [];
      setSavedIds(new Set(events.map((e) => e.id)));
    } catch {}
  };

  useEffect(() => {
    if (user) {
      fetchSavedIds();
      fetchRegisteredIds();
    }
  }, [user]);

  const fetchRegisteredIds = async () => {
    try {
      const res = await registrationsAPI.getMy();
      const regs = res.data || [];
      setRegisteredIds(new Set(regs.map((r) => r.eventId)));
    } catch {}
  };


  const toggleSave = async (eventId) => {
    try {
      if (savedIds.has(eventId)) {
        await savedEventsAPI.unsave(eventId);
        setSavedIds((prev) => { const n = new Set(prev); n.delete(eventId); return n; });
      } else {
        await savedEventsAPI.save(eventId);
        setSavedIds((prev) => new Set(prev).add(eventId));
      }
    } catch {}
  };

  const formatEventDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[d.getMonth()]} ${d.getDate()} &middot; ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  };

  const getCategoryStyle = (cat) => {
    const map = {
      workshop: { bg: "var(--turquoise)", label: "Workshops" },
      festival: { bg: "var(--wild-watermelon)", label: "Festivals" },
      sports: { bg: "var(--wild-watermelon)", label: "Sports" },
      academic: { bg: "var(--zeus)", label: "Symposium" },
      social: { bg: "var(--turquoise)", label: "Networking" },
      hackathon: { bg: "var(--orange)", label: "Hackathon" },
      cultural: { bg: "var(--turquoise)", label: "Cultural" },
      networking: { bg: "var(--turquoise)", label: "Networking" },
    };
    return map[cat?.toLowerCase()] || { bg: "var(--turquoise)", label: cat || "Event" };
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[radial-gradient(102.62%_445.27%_at_100%_0%,#FFDCC0_0%,#FFF8F0_100%)] py-12">
        <div className="page-container events-hero flex gap-12 items-center">
          <div className="flex-1 max-w-[616px]">
            <span className="inline-flex items-center px-4 py-[2.5px] bg-[var(--wild-watermelon-15)] rounded-full text-wild-watermelon font-bold text-base mb-4">
              &#9679; LIVE ON CAMPUS
            </span>
            <h1 className="text-[60px] font-normal leading-[60px] text-zeus mb-4 max-w-[589px]">
              Pulse into your next university adventure.
            </h1>
            <p className="text-base leading-6 text-kabul max-w-[497px]">
              Discover curated workshops, high-energy festivals, and academic
              symposiums designed to fuel your student journey and grow your network.
            </p>
          </div>
          <div className="w-[616px] h-[346.5px] rounded-2xl bg-[linear-gradient(135deg,var(--orange),#ff6b6b)] border-4 border-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center text-white font-bold text-xl relative shrink-0">
            Campus Life
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="page-container mt-0 pt-0">
        <div className="search-bar-inner mt-6 mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-americano">
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Bar */}
      <div className="page-container mb-8">
        <div className="events-categories-scroll">
          {categories.map((cat) => (
            <button
              key={cat.filter}
              onClick={() => setActiveCategory(activeCategory === cat.filter ? "" : cat.filter)}
              className={`events-category-pill ${activeCategory === cat.filter ? 'active' : ''}`}
            >
              {categoryIcon(cat.icon, activeCategory === cat.filter ? '#FFFFFF' : cat.color)}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="page-container pb-20">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-[30px] font-extrabold text-zeus mb-1">
              Upcoming Events
            </h2>
            <p className="text-base text-kabul">
              Recommended based on your interests and major
            </p>
          </div>
          {events.length > 12 && (
            <Link to="/events" className="flex items-center gap-1 text-wild-watermelon font-bold text-base">
              View All
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="">
                <path d="M6 3l5 5-5 5" stroke="var(--wild-watermelon)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="events-grid grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <h3>No events found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="events-grid grid grid-cols-3 gap-6">
            {events.map((event, idx) => {
              const catStyle = getCategoryStyle(event.category);
              const isPopular = idx === 3;
              const isPending = event.status === "pending";
              return (
                <div
                  key={event.id}
                  className={`event-card cursor-pointer ${isPopular ? 'border-2 border-orange' : ''}`}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <div className="event-card-image relative h-48">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <span className="text-2xl font-bold opacity-30">{event.category}</span>
                    )}
                    <span className="badge badge-orange absolute top-3 left-3 z-[1]">
                      {catStyle.label}
                    </span>
                    {isPopular && (
                      <span className="absolute top-3 right-3 z-[1] badge bg-pink text-white">
                        POPULAR
                      </span>
                    )}
                  </div>

                  <div className="event-card-content">
                    <h3 className="event-card-title">{event.title}</h3>
                    <div className="event-card-meta">
                      <svg width="16" height="16" viewBox="0 0 18 22" fill="none" className="shrink-0">
                        <circle cx="9" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 7v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span dangerouslySetInnerHTML={{ __html: formatEventDate(event.date) }} />
                    </div>
                    <div className="event-card-meta">
                      <svg width="16" height="16" viewBox="0 0 18 22" fill="none" className="shrink-0">
                        <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 18c-3-3-5-6-5-9s2-5 5-5 5 2 5 5-2 6-5 9z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      <span>{event.location}</span>
                    </div>

                    <div className="event-card-footer">
                      {isPending ? (
                        <span className="badge badge-yellow">Pending Approval</span>
                      ) : registeredIds.has(event.id) ? (
                        <span className="badge badge-green" style={{ fontSize: 13, padding: "8px 18px" }}>
                          Registered
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
                          className="btn btn-primary btn-small"
                        >
                          Register
                        </button>
                      )}
                      {user && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(event.id); }}
                          className={`flex items-center gap-1 text-sm font-bold transition-colors ${savedIds.has(event.id) ? "text-orange" : "text-pink"}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 20 24" fill={savedIds.has(event.id) ? "#FF7A00" : "none"}>
                            <path d="M10 20l-1.5-1.3C4.5 15 2 12.3 2 9c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 .6-1.2 2-2 3.5-2C16 4.5 18 6.5 18 9c0 3.3-2.5 6-6.5 9.7L10 20z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          {savedIds.has(event.id) ? "Saved" : "Save"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
