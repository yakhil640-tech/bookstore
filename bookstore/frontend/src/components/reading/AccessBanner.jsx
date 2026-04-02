const styles = {
  FULL: {
    shell: "border-emerald-200 bg-emerald-50/80",
    badge: "border-emerald-200 bg-white text-emerald-700",
    note: "text-emerald-700",
  },
  PREVIEW: {
    shell: "border-amber-200 bg-amber-50/80",
    badge: "border-amber-200 bg-white text-amber-700",
    note: "text-amber-700",
  },
};

export default function AccessBanner({ accessType, message }) {
  const tone = styles[accessType] || styles.PREVIEW;

  return (
    <div className={`rounded-[2rem] border p-5 shadow-sm ${tone.shell}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Reader access</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {accessType === "FULL" ? "Full reading unlocked" : "Preview-only reading"}
          </h3>
        </div>
        <span className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${tone.badge}`}>
          {accessType}
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-700">{message}</p>
      <p className={`mt-3 text-sm font-medium ${tone.note}`}>
        This state is returned directly by the backend and drives what the reader is allowed to show.
      </p>
    </div>
  );
}
