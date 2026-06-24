import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventsAPI } from "../../services/api";

export default function Landing() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventsAPI.getAll();
      const data = res.data?.events || res.data || [];
      setEvents(data.filter((e) => e.status === "approved").slice(0, 6));
    } catch {
      setEvents([]);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="landing-hero max-w-[1280px] mx-auto px-10 pt-24 flex gap-[100px] items-start">
        <div className="landing-hero-text flex-1 pt-[218px]">
          <h1 className="text-5xl font-extrabold leading-[56px] tracking-[-0.96px] text-shark max-w-[493px] mb-4">
            Discover, Participate, Engage
          </h1>
          <p className="text-lg leading-7 text-judge-gray max-w-[504px] mb-10">
            Fuel your campus journey with real-time events, community challenges,
            and rewards that turn participation into a vibrant social lifestyle.
          </p>
          <div className="flex gap-4 items-center">
            {user ? (
              <Link to="/events" className="btn btn-primary btn-lg">
                Explore Events
                <span className="text-xl">{'\u2192'}</span>
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
                <span className="text-xl">{'\u2192'}</span>
              </Link>
            )}
            <Link to="/events" className="btn btn-secondary btn-lg">
              Browse Events
            </Link>
          </div>
        </div>

        <div className="landing-hero-image w-[576px] h-[500px] relative shrink-0">
          <div className="absolute w-[576px] h-[500px] -left-[12.69px] -top-[14.73px] bg-yellow opacity-20 rounded-3xl rotate-[3deg]" />
          <div className="w-[576px] h-[500px] rounded-3xl bg-gradient-to-br from-orange to-[#ff6b6b] border-4 border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex items-center justify-center text-white text-2xl font-bold relative">
            Vibrant Campus Life
          </div>
        </div>
      </section>

      {/* Events Section */}
      {events.length > 0 && (
        <section className="page-container pt-24">
          <h2 className="section-title">Upcoming Campus Events</h2>
          <div className="section-underline" />
          <div className="landing-events-grid grid grid-cols-3 gap-6 mt-8">
            {events.map((ev) => (
              <div key={ev.id} className="event-card">
                <div className="event-card-image">
                  <span className="text-americano">{ev.category}</span>
                </div>
                <div className="event-card-content">
                  <span className="event-card-category">{ev.category}</span>
                  <h3 className="event-card-title">{ev.title}</h3>
                  <p className="event-card-meta mb-3">
                    {new Date(ev.date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </p>
                  {user ? (
                    <Link to={`/events/${ev.id}`} className="btn btn-primary btn-small">
                      View Details
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-primary btn-small">
                      Log in to Join
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/events" className="btn btn-secondary">
              View All Events
            </Link>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-section-bg mt-24 py-24">
        <div className="page-container">
          <h2 className="section-title">Experience University Redefined</h2>
          <div className="section-underline" />

          <div className="grid-3 mt-11">
            <div className="card px-8 pb-14 pt-8">
              <div className="w-12 h-12 bg-orange-bg rounded-lg flex items-center justify-center mb-4">
                <svg width="30" height="36" viewBox="0 0 30 36" fill="none" className="scale-y-[-1]">
                  <rect x="2.5" y="5.5" width="25" height="25" rx="3" stroke="#994700" strokeWidth="2"/>
                  <path d="M10 16L14 20L20 12" stroke="#994700" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Personalized Feed
              </h3>
              <p className="text-base leading-6 text-judge-gray">
                Stay ahead with a curated feed of campus events tailored to your
                unique interests and academic goals.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-[var(--yellow-bg)] rounded-lg flex items-center justify-center mb-4">
                <svg width="30" height="36" viewBox="0 0 30 36" fill="none" className="scale-y-[-1]">
                  <circle cx="15" cy="18" r="12" stroke="#735C00" strokeWidth="2"/>
                  <path d="M15 12V18L19 21" stroke="#735C00" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Seamless Participation
              </h3>
              <p className="text-base leading-6 text-judge-gray">
                Effortlessly join clubs, RSVP to workshops, and build meaningful
                connections with peers across departments.
              </p>
            </div>

            <div className="card px-8 pb-14 pt-8">
              <div className="w-12 h-12 bg-[var(--pink-bg)] rounded-lg flex items-center justify-center mb-4">
                <svg width="24" height="32" viewBox="0 0 24 32" fill="none" className="scale-y-[-1]">
                  <path d="M12 2L14.5 10H22L16 15L18 23L12 18L6 23L8 15L2 10H9.5L12 2Z" stroke="#B32444" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Gamified Rewards
              </h3>
              <p className="text-base leading-6 text-judge-gray">
                Keep the momentum alive with streaks and gamified rewards that
                celebrate your daily involvement in campus life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="page-container py-24">
        <div className="bg-brown rounded-3xl p-12 relative overflow-hidden text-center">
          <div className="absolute w-64 h-64 -right-12 -top-12 bg-orange opacity-20 blur-[32px] rounded-full" />
          <div className="absolute w-64 h-64 -left-12 -bottom-12 bg-yellow opacity-20 blur-[32px] rounded-full" />

          <h2 className="text-5xl font-extrabold tracking-[-0.96px] text-white mb-8 relative z-10">
            Ready to pulse with your campus?
          </h2>

          {user ? (
            <Link to="/events" className="btn btn-primary btn-lg relative z-10">
              Explore Events
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary btn-lg relative z-10">
              Get Started
            </Link>
          )}

          <div className="mt-4 relative z-10">
            <Link to="/events" className="text-white underline font-medium text-base opacity-80 hover:opacity-100 transition-opacity">
              Learn more about UniPulse
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
