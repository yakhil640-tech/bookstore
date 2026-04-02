import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--soft-page)]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
