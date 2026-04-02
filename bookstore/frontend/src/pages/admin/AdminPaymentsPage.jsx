import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import ApiMessage from "../../components/common/ApiMessage";
import Loader from "../../components/common/Loader";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatCount, formatCurrency, formatDateTime, getStatusBadgeClass } from "../../utils/adminFormat";

export default function AdminPaymentsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPaymentsView() {
      const [analyticsResult, paymentsResult] = await Promise.allSettled([
        adminApi.getAnalytics(),
        adminApi.getPayments(),
      ]);

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value.data || null);
      } else {
        setError(getApiErrorMessage(analyticsResult.reason, "Unable to load payment analytics"));
      }

      if (paymentsResult.status === "fulfilled") {
        setPayments(paymentsResult.value.data || []);
      } else {
        setError((current) => current || getApiErrorMessage(paymentsResult.reason, "Unable to load payments"));
      }

      setLoading(false);
    }

    loadPaymentsView();
  }, []);

  const summary = useMemo(() => {
    const totalRevenue = analytics?.totalRevenue ?? 0;
    const totalOrders = analytics?.totalOrders ?? 0;
    const totalSubscriptions = analytics?.totalSubscriptions ?? 0;
    const successfulPayments = payments.filter((payment) => payment.status === "SUCCESS").length;

    return {
      totalRevenue,
      totalOrders,
      totalSubscriptions,
      successfulPayments,
    };
  }, [analytics, payments]);

  if (loading) {
    return <Loader text="Loading payments..." />;
  }

  return (
    <div className="space-y-6">
      <ApiMessage type="error" text={error} />

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Revenue tracked</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCurrency(summary.totalRevenue)}</p>
        </article>
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Paid orders</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(summary.totalOrders)}</p>
        </article>
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Successful payments</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(summary.successfulPayments)}</p>
          <p className="mt-2 text-sm text-[var(--soft-muted)]">{formatCount(summary.totalSubscriptions)} subscription purchases</p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Payment Ledger</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--soft-text)]">Verified payment records</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--soft-muted)]">
              This table now uses a dedicated admin payment endpoint and covers both order purchases and subscription payments with status and UTR visibility.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[var(--soft-border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--soft-border)] text-sm">
              <thead className="bg-[var(--soft-page)] text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">
                <tr>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--soft-border)] bg-white">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-[var(--soft-muted)]">
                      No payments are available in the admin ledger yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.paymentId}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[var(--soft-text)]">#{payment.paymentId}</p>
                        <p className="mt-1 text-xs text-[var(--soft-muted)]">{payment.paymentType}</p>
                      </td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">
                        <p className="font-medium text-[var(--soft-text)]">{payment.userName}</p>
                        <p className="mt-1 text-xs">{payment.userEmail}</p>
                      </td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">
                        <p>{payment.referenceType} #{payment.referenceId ?? "-"}</p>
                        <p className="mt-1 text-xs">UTR: {payment.utr || "Pending verification"}</p>
                      </td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">{formatDateTime(payment.verifiedAt || payment.createdAt)}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(payment.status)}`}>
                          {payment.status}
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
