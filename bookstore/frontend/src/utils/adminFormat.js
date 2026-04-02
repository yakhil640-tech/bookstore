export function toNumber(value) {
  return Number(value || 0);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function formatCount(value) {
  return toNumber(value).toLocaleString("en-IN");
}

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getStatusBadgeClass(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "COMPLETED" || normalized === "ACTIVE" || normalized === "ENABLED" || normalized === "SUCCESS" || normalized === "PAID") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized === "PENDING") {
    return "bg-amber-100 text-amber-700";
  }

  if (normalized === "DISABLED" || normalized === "INACTIVE" || normalized === "EXPIRED" || normalized === "FAILED" || normalized === "CANCELLED") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}
