import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminContextPanel from "../../components/admin/AdminContextPanel";

const pageMeta = {
  "/admin": {
    eyebrow: "Operations",
    title: "Bookstore Dashboard",
    description: "Track the real bookstore modules already implemented in the project, including books, orders, users, payments, and subscriptions.",
  },
  "/admin/books": {
    eyebrow: "Catalog",
    title: "Book Catalog",
    description: "Create and maintain the catalog inventory, pricing, readable page counts, and active state for each title.",
  },
  "/admin/orders": {
    eyebrow: "Commerce",
    title: "Order Review",
    description: "Inspect store-wide purchase activity with purchaser details, purchased titles, order totals, and status history.",
  },
  "/admin/users": {
    eyebrow: "Accounts",
    title: "Users & Roles",
    description: "Review real bookstore accounts, their assigned roles, account status, and enabled state from the admin directory.",
  },
  "/admin/payments": {
    eyebrow: "Revenue",
    title: "Payments",
    description: "Monitor order and subscription payments together with verification status, customer identity, and payment references.",
  },
};

export default function AdminLayout() {
  const location = useLocation();
  const meta = pageMeta[location.pathname] || pageMeta["/admin"];

  return (
    <div className="min-h-screen bg-[var(--soft-page)] xl:grid xl:grid-cols-[260px_minmax(0,1fr)_320px]">
      <AdminSidebar />

      <div className="min-w-0 px-4 py-4 sm:px-6 xl:px-8 xl:py-6">
        <header className="rounded-[2rem] border border-[var(--soft-border)] bg-white px-6 py-7 shadow-[0_20px_40px_rgba(80,67,52,0.08)] sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">{meta.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--soft-text)] sm:text-4xl">{meta.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--soft-muted)]">{meta.description}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-[var(--soft-page)] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Workspace</p>
              <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">Soft Admin Console</p>
              <p className="mt-1 text-sm text-[var(--soft-muted)]">Same bookstore features, cleaner dashboard framing</p>
            </div>
          </div>
        </header>

        <main className="pt-6">
          <Outlet />
        </main>
      </div>

      <div className="px-6 py-6">
        <AdminContextPanel />
      </div>
    </div>
  );
}
