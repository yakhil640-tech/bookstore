import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import ApiMessage from "../../components/common/ApiMessage";
import Loader from "../../components/common/Loader";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatCount, getStatusBadgeClass } from "../../utils/adminFormat";

export default function AdminUsersPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      const [analyticsResult, usersResult] = await Promise.allSettled([
        adminApi.getAnalytics(),
        adminApi.getUsers(),
      ]);

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value.data || null);
      } else {
        setError(getApiErrorMessage(analyticsResult.reason, "Unable to load user analytics"));
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value.data || []);
      } else {
        setError((current) => current || getApiErrorMessage(usersResult.reason, "Unable to load users"));
      }

      setLoading(false);
    }

    loadAnalytics();
  }, []);

  const summary = useMemo(() => {
    const adminUsers = users.filter((account) => (account.roles || []).includes("ROLE_ADMIN")).length;
    const subscriberUsers = users.filter((account) => (account.roles || []).includes("ROLE_SUBSCRIBER")).length;
    const customerUsers = users.filter((account) => !(account.roles || []).includes("ROLE_ADMIN")).length;

    return {
      totalUsers: analytics?.totalUsers ?? users.length,
      adminUsers,
      subscriberUsers,
      customerUsers,
    };
  }, [analytics, users]);

  const customerAccounts = useMemo(
    () => users.filter((account) => !(account.roles || []).includes("ROLE_ADMIN")),
    [users]
  );

  if (loading) {
    return <Loader text="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      <ApiMessage type="error" text={error} />

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Registered users</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(summary.customerUsers)}</p>
        </article>
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Admin accounts</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(summary.adminUsers)}</p>
        </article>
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Subscribers</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(summary.subscriberUsers)}</p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Account Directory</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--soft-text)]">Registered users</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--soft-muted)]">
              This table focuses on registered reader accounts. Admin accounts are counted in the summary above, while the main table shows customer-facing users and their roles.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[var(--soft-border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--soft-border)] text-sm">
              <thead className="bg-[var(--soft-page)] text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Enabled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--soft-border)] bg-white">
                {customerAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-[var(--soft-muted)]">
                      No registered user accounts are available yet.
                    </td>
                  </tr>
                ) : (
                  customerAccounts.map((visibleUser) => (
                    <tr key={visibleUser.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[var(--soft-text)]">{visibleUser.fullName}</p>
                        <p className="mt-1 text-sm text-[var(--soft-muted)]">{visibleUser.email}</p>
                      </td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">{visibleUser.phoneNumber || "-"}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {(visibleUser.roles || []).map((role) => (
                            <span
                              key={`${visibleUser.id}-${role}`}
                              className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-3 py-1 text-xs font-semibold text-[var(--soft-text)]"
                            >
                              {role.replace("ROLE_", "")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(visibleUser.status)}`}>
                          {visibleUser.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">{visibleUser.enabled ? "Yes" : "No"}</td>
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
