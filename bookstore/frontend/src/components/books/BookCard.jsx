import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function formatRating(value) {
  return Number(value || 0).toFixed(1);
}

const shellPalettes = [
  {
    shell: "from-[#355c67] via-[#4a7884] to-[#86aeb7]",
    glow: "bg-[#d8e9ed]/55",
    badge: "text-[#edf7f9]",
  },
  {
    shell: "from-[#49566f] via-[#657a98] to-[#9baecc]",
    glow: "bg-[#dde4f0]/55",
    badge: "text-[#eef3fb]",
  },
  {
    shell: "from-[#4f555d] via-[#69717b] to-[#a6afb8]",
    glow: "bg-[#e3e7eb]/55",
    badge: "text-[#f3f6f8]",
  },
  {
    shell: "from-[#5a6860] via-[#73857b] to-[#a9bbb1]",
    glow: "bg-[#e2ebe6]/55",
    badge: "text-[#f3f8f5]",
  },
];

function getShellPalette(book) {
  const source = String(book?.id ?? book?.title ?? "book");
  const total = source.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return shellPalettes[total % shellPalettes.length];
}

export default function BookCard({ book, isAuthenticated }) {
  const { hasRole } = useAuth();
  const reviewCount = Number(book.reviewCount || 0);
  const palette = getShellPalette(book);
  const isOwned = Boolean(book.isOwned);
  const isSubscriber = hasRole("ROLE_SUBSCRIBER");
  const hasFullAccess = isOwned || isSubscriber;
  const actionLabel = isAuthenticated ? (hasFullAccess ? "Read now" : "Preview") : "Login";

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-[var(--soft-border)] bg-white shadow-[0_20px_40px_rgba(80,67,52,0.08)] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_26px_48px_rgba(80,67,52,0.12)]">
      <div className={`relative overflow-hidden border-b border-[var(--soft-border)] bg-gradient-to-br ${palette.shell} p-6 text-white`}>
        <div className={`absolute right-0 top-0 h-24 w-24 rounded-full ${palette.glow} blur-2xl transition duration-300 group-hover:scale-125`} />
        <div className={`absolute bottom-0 left-0 h-20 w-20 rounded-full ${palette.glow} blur-2xl transition duration-300 group-hover:scale-125`} />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${palette.badge}`}>Book</p>
            <h3 className="mt-3 line-clamp-2 text-2xl font-semibold tracking-tight text-white">{book.title}</h3>
            <p className={`mt-2 text-sm ${palette.badge}`}>{book.author}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl font-semibold text-white shadow-lg shadow-slate-950/20">
            {book.title?.charAt(0)?.toUpperCase() || "B"}
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2">
          <span className={`rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold ${palette.badge}`}>
            {hasFullAccess ? "Full Access" : "Preview Available"}
          </span>
          {isOwned && (
            <span className={`rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold ${palette.badge}`}>
              Owned
            </span>
          )}
          {isSubscriber && !isOwned && (
            <span className={`rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold ${palette.badge}`}>
              Subscription Access
            </span>
          )}
          <span className={`rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold ${palette.badge}`}>
            {hasFullAccess ? "Full reading ready" : "10-page preview"}
          </span>
          <span className={`rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold ${palette.badge}`}>
            {formatRating(book.averageRating)} rating
          </span>
          <span className={`rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold ${palette.badge}`}>
            {reviewCount} reviews
          </span>
        </div>
      </div>

      <div className="p-6">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[var(--soft-muted)]">
          {book.description || "No description is available for this book yet."}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--soft-border)] pt-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--soft-muted)]">Price</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--soft-text)]">{formatPrice(book.price)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/books/${book.id}`}
              className="rounded-full border border-[var(--soft-border)] px-4 py-2 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-page)]"
            >
              Details
            </Link>
            <Link
              to={isAuthenticated ? `/reader/${book.id}` : "/login"}
              className="rounded-full bg-[#352f2a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
            >
              {actionLabel}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
