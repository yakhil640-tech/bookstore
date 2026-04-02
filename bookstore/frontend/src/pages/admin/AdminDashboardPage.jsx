import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import ApiMessage from "../../components/common/ApiMessage";
import Loader from "../../components/common/Loader";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatCount, formatCurrency, formatDateTime, getStatusBadgeClass, toNumber } from "../../utils/adminFormat";

const statCards = [
  { key: "totalUsers", label: "Users", to: "/admin/users", note: "Registered accounts" },
  { key: "totalBooks", label: "Books", to: "/admin/books", note: "All books in admin catalog" },
  { key: "totalOrders", label: "Orders", to: "/admin/orders", note: "Completed paid orders" },
  { key: "totalRevenue", label: "Revenue", to: "/admin/payments", note: "Verified payment total" },
];

function StatCard({ label, value, note, to }) {
  return (
    <Link
      to={to}
      className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)] transition hover:-translate-y-0.5"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--soft-text)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--soft-muted)]">{note}</p>
    </Link>
  );
}

function SoftSection({ eyebrow, title, action, children }) {
  return (
    <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--soft-text)]">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      const [analyticsResult, booksResult, ordersResult] = await Promise.allSettled([
        adminApi.getAnalytics(),
        adminApi.getBooks(),
        adminApi.getOrders(),
      ]);

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value.data || null);
      } else {
        setError(getApiErrorMessage(analyticsResult.reason, "Unable to load admin analytics"));
      }

      if (booksResult.status === "fulfilled") {
        setBooks(booksResult.value.data || []);
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value.data || []);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  const dashboardData = useMemo(() => {
    if (!analytics) {
      return null;
    }

    const totalUsers = toNumber(analytics.totalUsers);
    const totalBooks = toNumber(analytics.totalBooks);
    const totalOrders = toNumber(analytics.totalOrders);
    const totalRevenue = toNumber(analytics.totalRevenue);
    const totalSubscriptions = toNumber(analytics.totalSubscriptions);

    const activeBooks = books.filter((book) => book.active).length;
    const inactiveBooks = books.filter((book) => !book.active).length;
    const averageBookPrice = books.length > 0 ? books.reduce((sum, book) => sum + toNumber(book.price), 0) / books.length : 0;

    return {
      totalUsers,
      totalBooks,
      totalOrders,
      totalRevenue,
      totalSubscriptions,
      activeBooks,
      inactiveBooks,
      averageBookPrice,
      revenuePerOrder: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      subscriberCoverage: totalUsers > 0 ? (totalSubscriptions / totalUsers) * 100 : 0,
      featuredBooks: [...books]
        .sort((left, right) => {
          const reviewDiff = toNumber(right.reviewCount) - toNumber(left.reviewCount);
          if (reviewDiff !== 0) {
            return reviewDiff;
          }
          return toNumber(right.averageRating) - toNumber(left.averageRating);
        })
        .slice(0, 4),
      recentOrders: [...orders]
        .sort((left, right) => new Date(right.orderedAt) - new Date(left.orderedAt))
        .slice(0, 5),
    };
  }, [analytics, books, orders]);

  if (loading) {
    return <Loader text="Loading admin dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <ApiMessage type="error" text={error} />

      {dashboardData && (
        <>
          <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard
                key={card.key}
                label={card.label}
                value={card.key === "totalRevenue" ? formatCurrency(dashboardData[card.key]) : formatCount(dashboardData[card.key])}
                note={card.note}
                to={card.to}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <SoftSection
              eyebrow="Catalog Health"
              title="Store inventory snapshot"
              action={
                <Link to="/admin/books" className="text-sm font-semibold text-[var(--soft-text)] transition hover:opacity-70">
                  Manage books
                </Link>
              }
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.6rem] bg-[var(--soft-page)] p-5">
                  <p className="text-sm text-[var(--soft-muted)]">Total books</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(dashboardData.totalBooks)}</p>
                </div>
                <div className="rounded-[1.6rem] bg-[var(--soft-page)] p-5">
                  <p className="text-sm text-[var(--soft-muted)]">Active books</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(dashboardData.activeBooks)}</p>
                </div>
                <div className="rounded-[1.6rem] bg-[var(--soft-page)] p-5">
                  <p className="text-sm text-[var(--soft-muted)]">Inactive books</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(dashboardData.inactiveBooks)}</p>
                </div>
              </div>
              <div className="mt-5 rounded-[1.6rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5">
                <p className="text-sm leading-7 text-[var(--soft-muted)]">
                  This dashboard now counts all books in the admin catalog, including active and inactive titles, alongside completed paid orders, user accounts, and subscription totals.
                </p>
              </div>
            </SoftSection>

            <SoftSection eyebrow="Revenue" title="Payment summary">
              <div className="grid gap-4">
                <div className="rounded-[1.6rem] bg-[#352f2a] p-5 text-white">
                  <p className="text-sm text-[#ddd4c7]">Revenue per completed order</p>
                  <p className="mt-3 text-3xl font-semibold">{formatCurrency(dashboardData.revenuePerOrder)}</p>
                </div>
                <div className="rounded-[1.6rem] bg-[var(--soft-page)] p-5">
                  <p className="text-sm text-[var(--soft-muted)]">Subscribers tracked</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(dashboardData.totalSubscriptions)}</p>
                  <p className="mt-2 text-sm text-[var(--soft-muted)]">
                    Coverage across users: {dashboardData.subscriberCoverage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </SoftSection>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <SoftSection
              eyebrow="Recent Orders"
              title="Completed order activity"
              action={
                <Link to="/admin/orders" className="text-sm font-semibold text-[var(--soft-text)] transition hover:opacity-70">
                  Open orders
                </Link>
              }
            >
              <div className="overflow-hidden rounded-[1.6rem] border border-[var(--soft-border)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[var(--soft-page)] text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">
                      <tr>
                        <th className="px-4 py-3">Order</th>
                        <th className="px-4 py-3">Books</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Placed</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--soft-border)] bg-white">
                      {dashboardData.recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-[var(--soft-muted)]">
                            No orders are available in the admin feed yet.
                          </td>
                        </tr>
                      ) : (
                        dashboardData.recentOrders.map((order) => (
                          <tr key={order.orderId}>
                            <td className="px-4 py-4 font-semibold text-[var(--soft-text)]">#{order.orderId}</td>
                            <td className="px-4 py-4 text-[var(--soft-muted)]">
                              <p>{(order.items || []).map((item) => item.title).join(", ") || "-"}</p>
                              <p className="mt-1 text-xs">{order.userName} | {order.userEmail}</p>
                            </td>
                            <td className="px-4 py-4 text-[var(--soft-muted)]">{formatCurrency(order.totalAmount)}</td>
                            <td className="px-4 py-4 text-[var(--soft-muted)]">{formatDateTime(order.orderedAt)}</td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </SoftSection>

            <SoftSection
              eyebrow="Featured Books"
              title="Catalog leaders"
              action={
                <Link to="/admin/books" className="text-sm font-semibold text-[var(--soft-text)] transition hover:opacity-70">
                  Open catalog
                </Link>
              }
            >
              <div className="space-y-3">
                {dashboardData.featuredBooks.length === 0 ? (
                  <div className="rounded-[1.6rem] bg-[var(--soft-page)] px-4 py-8 text-center text-sm text-[var(--soft-muted)]">
                    No catalog items are available yet.
                  </div>
                ) : (
                  dashboardData.featuredBooks.map((book, index) => (
                    <div
                      key={book.id}
                      className="flex items-start justify-between gap-4 rounded-[1.6rem] border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-[var(--soft-text)]">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[var(--soft-text)]">{book.title}</p>
                            <p className="truncate text-sm text-[var(--soft-muted)]">{book.author}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--soft-muted)]">
                          <span className="rounded-full bg-white px-3 py-1">Rating {toNumber(book.averageRating).toFixed(1)}</span>
                          <span className="rounded-full bg-white px-3 py-1">{formatCount(book.reviewCount)} reviews</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-[var(--soft-text)]">{formatCurrency(book.price)}</p>
                    </div>
                  ))
                )}
              </div>
            </SoftSection>
          </section>
        </>
      )}
    </div>
  );
}
