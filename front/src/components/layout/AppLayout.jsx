import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OrganizerLayout from "./OrganizerLayout";

export default function AppLayout() {
  const { user } = useAuth();

  if (user?.role === "organizer") {
    return <OrganizerLayout />;
  }

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
