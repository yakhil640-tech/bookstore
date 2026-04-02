const styles = {
  error: "border-[#e7c8c2] bg-[#fbefec] text-[#9a4b41]",
  success: "border-[#d6e1cd] bg-[#f1f7ed] text-[#58714a]",
  info: "border-[var(--soft-border)] bg-[var(--soft-page)] text-[var(--soft-text)]",
};

export default function ApiMessage({ type = "info", text }) {
  if (!text) {
    return null;
  }

  return (
    <div
      className={`mb-4 rounded-[1.5rem] border px-4 py-3 text-sm font-medium shadow-[0_12px_30px_rgba(80,67,52,0.05)] ${styles[type] || styles.info}`}
    >
      {text}
    </div>
  );
}
