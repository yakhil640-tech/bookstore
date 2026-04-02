import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import ApiMessage from "../../components/common/ApiMessage";
import Loader from "../../components/common/Loader";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatCount, formatCurrency, formatDateTime, getStatusBadgeClass, toNumber } from "../../utils/adminFormat";

export default function AdminOrdersPage() {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      const [analyticsResult, ordersResult] = await Promise.allSettled([
        adminApi.getAnalytics(),
        adminApi.getOrders(),
      ]);

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value.data || null);
      } else {
        setError(getApiErrorMessage(analyticsResult.reason, "Unable to load order analytics"));
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value.data || []);
      }

      setLoading(false);
    }

    loadOrders();
  }, []);

  const summary = useMemo(() => {
    const totalOrders = analytics?.totalOrders ?? 0;
    const totalRevenue = analytics?.totalRevenue ?? 0;
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
    const averageOrderValue = toNumber(totalOrders) > 0 ? toNumber(totalRevenue) / toNumber(totalOrders) : 0;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
    };
  }, [analytics, orders]);

  if (loading) {
    return <Loader text="Loading orders..." />;
  }

  return (
    <div className="space-y-6">
      <ApiMessage type="error" text={error} />

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Completed orders</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(summary.totalOrders)}</p>
        </article>
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Revenue</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCurrency(summary.totalRevenue)}</p>
        </article>
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Average order value</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCurrency(summary.averageOrderValue)}</p>
          <p className="mt-2 text-sm text-[var(--soft-muted)]">{formatCount(summary.pendingOrders)} pending right now</p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Order Feed</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--soft-text)]">All bookstore orders</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--soft-muted)]">
              This table now reads from the secured admin order endpoint and shows purchaser, items, totals, time, and status across the full store.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[var(--soft-border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--soft-border)] text-sm">
              <thead className="bg-[var(--soft-page)] text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Purchaser</th>
                  <th className="px-4 py-3">Books</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Placed</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--soft-border)] bg-white">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-[var(--soft-muted)]">
                      No orders are available in the admin feed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="px-4 py-4 font-semibold text-[var(--soft-text)]">#{order.orderId}</td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">
                        <p className="font-medium text-[var(--soft-text)]">{order.userName}</p>
                        <p className="mt-1 text-xs">{order.userEmail}</p>
                      </td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">{(order.items || []).map((item) => item.title).join(", ") || "-"}</td>
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
      </section>
    </div>
  );
}
