import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function Navbar() {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasRole("ROLE_ADMIN");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--soft-border)] bg-[rgba(245,241,234,0.92)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            to={isAdmin ? "/admin" : "/"}
            className="flex items-center gap-3 rounded-full px-2 py-1 transition hover:bg-white/60"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#352f2a] text-sm font-semibold text-white shadow-sm">
              BS
            </span>
            <div>
              <p className="text-base font-semibold text-[var(--soft-text)]">{isAdmin ? "BookStore Admin" : "BookStore"}</p>
              <p className="text-xs text-[var(--soft-muted)]">{isAdmin ? "Dashboard workspace" : "Reader workspace"}</p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {isAdmin ? (
            <span className="rounded-full border border-[var(--soft-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--soft-muted)]">
              Admin Session
            </span>
          ) : (
            <>
              <Link
                to="/"
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--soft-text)] transition hover:bg-white hover:text-[var(--soft-text)]"
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link
                  to="/library"
                  className="rounded-full px-4 py-2 text-sm font-medium text-[var(--soft-text)] transition hover:bg-white hover:text-[var(--soft-text)]"
                >
                  My Library
                </Link>
              )}
              <Link
                to="/subscription"
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--soft-text)] transition hover:bg-white hover:text-[var(--soft-text)]"
              >
                Subscription
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-[var(--soft-border)] bg-white px-4 py-2 text-sm text-[var(--soft-muted)] sm:block">
                {user?.fullName || user?.email}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-[#352f2a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--soft-text)] transition hover:bg-white hover:text-[var(--soft-text)]"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#352f2a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
