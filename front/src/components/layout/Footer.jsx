import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  const bg = user ? "bg-linen" : "bg-white";

  return (
    <footer className={`${bg} border-t border-[rgba(216,194,184,0.3)] py-8`}>
      <div className="footer-inner">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6 md:gap-0 min-h-16">
          <div className="text-center md:text-left">
            <div className="text-2xl font-extrabold text-orange mb-1">Unipulse</div>
            <div className="text-sm md:text-base text-kabul">&copy; 2024 Unipulse University Community. All rights reserved.</div>
          </div>
          <div className="footer-links">
            <Link to="/" className="text-base font-bold text-kabul">Home</Link>
            <Link to="/events" className="text-base font-bold text-kabul">Events</Link>
            <Link to="/friends" className="text-base font-bold text-kabul">Community</Link>
            <Link to="/about" className="text-base font-bold text-kabul">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
