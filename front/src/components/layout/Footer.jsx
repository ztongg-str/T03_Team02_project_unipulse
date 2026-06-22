import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  const bg = user ? "bg-linen" : "bg-white";

  return (
    <footer className={`${bg} border-t border-[rgba(216,194,184,0.3)] py-8`}>
      <div className="max-w-[1280px] mx-auto px-10 flex justify-between items-center min-h-16">
        <div>
          <div className="text-2xl font-extrabold text-orange mb-1">Unipulse</div>
          <div className="text-base text-kabul">&copy; 2024 Unipulse University Community. All rights reserved.</div>
        </div>
        <div className="flex gap-6">
          <Link to="/" className="text-base font-bold text-kabul">Home</Link>
          <Link to="/events" className="text-base font-bold text-kabul">Events</Link>
          <Link to="/friends" className="text-base font-bold text-kabul">Community</Link>
          <Link to="/about" className="text-base font-bold text-kabul">About</Link>
        </div>
      </div>
    </footer>
  );
}
