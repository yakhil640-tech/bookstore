function isValidUtr(value) {
  return /^[A-Za-z0-9-]{6,30}$/.test(value.trim());
}

function StepPill({ label, active, complete }) {
  const classes = complete
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : active
      ? "border-[var(--soft-border)] bg-[var(--soft-page)] text-[var(--soft-text)]"
      : "border-[var(--soft-border)] bg-white text-[var(--soft-muted)]";

  return (
    <div className={`rounded-[1.4rem] border px-4 py-3 ${classes}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">{complete ? "Done" : active ? "Now" : "Next"}</p>
      <p className="mt-2 text-sm font-semibold">{label}</p>
    </div>
  );
}

export default function PaymentDialog({
  payment,
  utr,
  onUtrChange,
  onVerify,
  loading,
  flowTitle = "Payment flow",
  createdLabel = "Created",
  pendingLabel = "Payment Pending",
  successLabel = "Payment Success",
  helperText = "Complete the UPI payment, then enter the UTR below to verify it.",
}) {
  if (!payment) {
    return null;
  }

  const trimmedUtr = utr?.trim() || "";
  const isVerified = String(payment.status || "").toUpperCase() === "VERIFIED";
  const isUtrValid = isValidUtr(trimmedUtr);
  const isVerifyDisabled = loading || isVerified || !isUtrValid;
  const currentStep = isVerified ? 3 : 2;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[var(--soft-border)] bg-white shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
      <div className="border-b border-[var(--soft-border)] bg-[var(--soft-page)] px-6 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Payment</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--soft-text)]">{flowTitle}</h3>
          </div>
          <span className="rounded-full border border-[var(--soft-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
            {payment.status}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <StepPill label={createdLabel} active={currentStep === 1} complete={currentStep > 1} />
          <StepPill label={pendingLabel} active={currentStep === 2} complete={currentStep > 2} />
          <StepPill label={successLabel} active={currentStep === 3} complete={currentStep > 3 || isVerified} />
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 rounded-[1.6rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Amount</p>
            <p className="mt-1 text-xl font-semibold text-[var(--soft-text)]">Rs. {payment.amount}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">UPI Link</p>
            <a
              href={payment.upiLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center rounded-full border border-[var(--soft-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)]"
            >
              Open UPI App
            </a>
            <p className="mt-2 break-all text-sm leading-6 text-[var(--soft-muted)]">{payment.upiLink}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">QR Payload</p>
            <p className="mt-1 break-all text-sm leading-6 text-[var(--soft-muted)]">{payment.qrPayload}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.6rem] border border-[var(--soft-border)] bg-white p-5">
          <p className="text-sm font-semibold text-[var(--soft-text)]">Finalize payment</p>
          <p className="mt-2 text-sm leading-6 text-[var(--soft-muted)]">{helperText}</p>

          <div className="mt-4 space-y-3">
            <label htmlFor="utr" className="block text-sm font-medium text-[var(--soft-text)]">
              Enter UTR after payment
            </label>
            <input
              id="utr"
              className={`w-full rounded-2xl border px-4 py-3 text-sm text-[var(--soft-text)] outline-none transition focus:bg-white focus:ring-4 ${
                trimmedUtr && !isUtrValid
                  ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                  : "border-[var(--soft-border)] bg-[var(--soft-page)] focus:border-slate-400 focus:ring-slate-200/70"
              }`}
              value={utr}
              onChange={(event) => onUtrChange(event.target.value)}
              placeholder="Example: 1234567890AB"
            />
            {trimmedUtr && !isUtrValid ? (
              <p className="text-sm text-red-600">Enter a valid UTR with 6 to 30 letters, numbers, or hyphens.</p>
            ) : (
              <p className="text-sm text-[var(--soft-muted)]">
                {isVerified ? "Payment verified. Access is already updated." : "Verification activates access immediately after backend confirmation."}
              </p>
            )}
            <button
              className="w-full rounded-2xl bg-[#352f2a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              onClick={onVerify}
              disabled={isVerifyDisabled}
            >
              {loading ? "Verifying..." : isVerified ? "Payment verified" : "Verify payment"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
