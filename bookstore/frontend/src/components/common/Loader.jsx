export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-[var(--soft-border)] bg-white px-6 py-12 text-center shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--soft-panel)] border-t-[#352f2a]" />
      <p className="mt-4 text-sm font-medium text-[var(--soft-muted)]">{text}</p>
    </div>
  );
}
