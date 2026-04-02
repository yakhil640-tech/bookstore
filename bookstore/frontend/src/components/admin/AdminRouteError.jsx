import { Link, useRouteError } from "react-router-dom";

function getErrorMessage(error) {
  if (!error) {
    return "The admin page could not be loaded right now.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error.statusText) {
    return error.statusText;
  }

  if (error.message) {
    return error.message;
  }

  return "The admin page could not be loaded right now.";
}

export default function AdminRouteError() {
  const error = useRouteError();

  return (
    <div className="min-h-screen bg-[var(--soft-page)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-[var(--soft-border)] bg-white p-8 text-center shadow-[0_20px_40px_rgba(80,67,52,0.08)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Admin workspace</p>
          <h1 className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">This page ran into a problem</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--soft-muted)]">{getErrorMessage(error)}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/admin"
              className="rounded-2xl bg-[#352f2a] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Back to dashboard
            </Link>
            <Link
              to="/admin/books"
              className="rounded-2xl border border-[var(--soft-border)] px-5 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)]"
            >
              Open books
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
