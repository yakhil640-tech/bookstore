import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const navItems = [
  { to: "/admin", end: true, label: "Dashboard", hint: "Overview" },
  { to: "/admin/books", label: "Books", hint: "Catalog" },
  { to: "/admin/orders", label: "Orders", hint: "Purchases" },
  { to: "/admin/users", label: "Users", hint: "Accounts" },
  { to: "/admin/payments", label: "Payments", hint: "Revenue" },
];

function getNavClass(isActive) {
  return `group flex items-center justify-between rounded-[1.25rem] px-4 py-3 transition ${
    isActive
      ? "bg-white text-[var(--soft-text)] shadow-[0_10px_30px_rgba(80,67,52,0.08)]"
      : "text-[var(--soft-text)] hover:bg-white/70"
  }`;
}

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="border-b border-[var(--soft-border)] bg-[var(--soft-panel)] xl:min-h-screen xl:border-b-0 xl:border-r">
      <div className="flex h-full flex-col px-4 py-6 sm:px-6 xl:px-5 xl:py-6">
        <Link to="/admin" className="flex items-center gap-3 rounded-[1.5rem] px-2 py-2 transition hover:bg-white/50">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-sky-900/40">
            BS
          </span>
          <div>
            <p className="text-base font-semibold text-[var(--soft-text)]">BookStore Admin</p>
            <p className="text-xs text-[var(--soft-muted)]">Soft control dashboard</p>
          </div>
        </Link>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--soft-border)] bg-white/70">
          <div className="px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Workspace</p>
            <p className="mt-2 text-sm leading-6 text-[var(--soft-text)]">
              Admin operations, catalog control, payment visibility, and account oversight for the bookstore platform.
            </p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => getNavClass(isActive)}>
              {({ isActive }) => (
                <>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={`text-xs ${isActive ? "text-[var(--soft-muted)]" : "text-[var(--soft-muted)]"}`}>
                      {item.hint}
                    </p>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-[#8f7f6d]" : "bg-[#cabfad]"}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-[1.5rem] border border-[var(--soft-border)] bg-white px-4 py-4 text-sm text-[var(--soft-text)]">
          <p className="font-semibold text-[var(--soft-text)]">{user?.fullName || user?.email}</p>
          <p className="mt-1 text-xs text-[var(--soft-muted)]">{user?.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(user?.roles || []).map((role) => (
              <span
                key={role}
                className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-3 py-1 text-xs font-semibold text-[var(--soft-text)]"
              >
                {role.replace("ROLE_", "")}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-3 pt-8">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-2xl bg-[#352f2a] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
