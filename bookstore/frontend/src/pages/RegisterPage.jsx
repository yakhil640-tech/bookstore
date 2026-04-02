import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiMessage from "../components/common/ApiMessage";
import { authApi } from "../api/authApi";
import { getApiErrorDetails } from "../utils/apiError";
import { useAuth } from "../auth/useAuth";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
};

const initialFieldErrors = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
};

function getInputClass(hasError) {
  return `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-200/70"
  }`;
}

function getPasswordInputClass(hasError) {
  return `${getInputClass(hasError)} pr-20`;
}

function isAdminUser(user) {
  const roles = user?.roles || [];
  return roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");
}

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, isAuthReady, saveSession, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !user) {
      return;
    }

    navigate(isAdminUser(user) ? "/admin" : "/", { replace: true });
  }, [isAuthReady, isAuthenticated, navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors(initialFieldErrors);

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim(),
      };
      const response = await authApi.register(payload);
      saveSession(response.data);
    } catch (err) {
      const details = getApiErrorDetails(err, "Registration failed");
      setError(details.message);
      setFieldErrors({
        fullName: details.fieldErrors.fullName || "",
        email: details.fieldErrors.email || "",
        password: details.fieldErrors.password || "",
        phoneNumber: details.fieldErrors.phoneNumber || "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
      <section className="w-full max-w-lg rounded-[2rem] border border-[var(--soft-border)] bg-white p-8 shadow-[0_20px_40px_rgba(80,67,52,0.08)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Create Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--soft-text)]">Register for BookStore</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">
          Create a clean account once, then use the same session for preview access, purchases, and subscriptions.
        </p>

        <div className="mt-6 rounded-[1.5rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-text)]">Create Your Reader Account</p>
          <p className="mt-2 text-sm leading-6 text-[var(--soft-text)]">
            Register once to save reading progress, unlock purchases, and continue your books across sessions.
          </p>
        </div>

        <div className="mt-6">
          <ApiMessage type="error" text={error} />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              className={getInputClass(Boolean(fieldErrors.fullName))}
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {fieldErrors.fullName && <p className="mt-2 text-sm text-red-600">{fieldErrors.fullName}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className={getInputClass(Boolean(fieldErrors.email))}
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {fieldErrors.email && <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                className={getPasswordInputClass(Boolean(fieldErrors.password))}
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              className={getInputClass(Boolean(fieldErrors.phoneNumber))}
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              autoComplete="tel"
            />
            {fieldErrors.phoneNumber && <p className="mt-2 text-sm text-red-600">{fieldErrors.phoneNumber}</p>}
          </div>

          {!Object.values(fieldErrors).some(Boolean) && !error && (
            <p className="sm:col-span-2 text-xs leading-5 text-slate-500">
              If registration fails with a connection message, make sure the Spring Boot backend is running on port 8085.
            </p>
          )}

          <div className="sm:col-span-2">
            <button
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-slate-900 transition hover:text-blue-700" to="/login">
            Login
          </Link>
        </div>
      </section>
    </div>
  );
}
