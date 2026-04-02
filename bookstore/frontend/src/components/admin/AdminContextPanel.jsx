import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const panelContent = {
  "/admin": {
    title: "Platform Summary",
    description: "Use this dashboard to monitor catalog, paid orders, subscriptions, and the current admin-visible bookstore health.",
    items: ["Users and roles", "Catalog inventory", "Payment-backed orders", "Subscription coverage"],
  },
  "/admin/books": {
    title: "Catalog Actions",
    description: "Manage the real bookstore inventory here. Books added from this screen immediately support catalog access, preview rules, and purchase flows.",
    items: ["Create metadata", "Update price and pages", "Disable catalog titles", "Keep review-driven ratings visible"],
  },
  "/admin/orders": {
    title: "Order Monitoring",
    description: "This area now pulls the full admin order feed so store operations can review purchaser, totals, item lists, and order status in one place.",
    items: ["Paid order totals", "Global order feed", "Purchaser visibility", "Completion status tracking"],
  },
  "/admin/users": {
    title: "Role Visibility",
    description: "The user directory now surfaces actual bookstore accounts, their roles, and account state so the admin shell reflects real project data.",
    items: ["Account directory", "Role overview", "Enabled status", "Platform totals"],
  },
  "/admin/payments": {
    title: "Revenue Tracking",
    description: "Payments now come from a dedicated admin ledger that combines order and subscription transactions while preserving the bookstore payment model.",
    items: ["Revenue totals", "Payment ledger", "Subscription purchases", "Verification status"],
  },
};

const quickLinks = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/books", label: "Manage Books" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/payments", label: "Payments" },
];

export default function AdminContextPanel() {
  const location = useLocation();
  const { user } = useAuth();
  const content = panelContent[location.pathname] || panelContent["/admin"];

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6 space-y-5">
        <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Session</p>
          <div className="mt-4 rounded-[1.5rem] bg-[var(--soft-page)] p-4">
            <p className="text-base font-semibold text-[var(--soft-text)]">{user?.fullName || "Admin Session"}</p>
            <p className="mt-1 text-sm text-[var(--soft-muted)]">{user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(user?.roles || []).map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-[var(--soft-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--soft-text)]"
                >
                  {role.replace("ROLE_", "")}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">{content.title}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--soft-text)]">{content.description}</p>
          <div className="mt-5 space-y-3">
            {content.items.map((item) => (
              <div
                key={item}
                className="rounded-[1.35rem] border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-3 text-sm font-medium text-[var(--soft-text)]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Quick Access</p>
          <div className="mt-4 space-y-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center justify-between rounded-[1.35rem] border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)]"
              >
                {link.label}
                <span className="text-[var(--soft-muted)]">Open</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
