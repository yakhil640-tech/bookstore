import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BookCard from "../components/books/BookCard";
import ApiMessage from "../components/common/ApiMessage";
import { bookApi } from "../api/bookApi";
import { orderApi } from "../api/orderApi";
import { getApiErrorMessage } from "../utils/apiError";
import { useAuth } from "../auth/useAuth";

function SummaryCard({ label, value, hint }) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--soft-muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--soft-text)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--soft-muted)]">{hint}</p>
    </div>
  );
}

function ExperienceCard({ title, description, actionLabel, actionTo }) {
  return (
    <article className="rounded-[1.8rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
      <h3 className="text-xl font-semibold text-[var(--soft-text)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--soft-muted)]">{description}</p>
      <Link
        to={actionTo}
        className="mt-5 inline-flex rounded-full bg-[#352f2a] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
      >
        {actionLabel}
      </Link>
    </article>
  );
}

function RoleReferenceCard({ role, access, description, actionLabel, actionTo }) {
  return (
    <article className="rounded-[1.8rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--soft-muted)]">{role}</p>
      <h3 className="mt-3 text-xl font-semibold text-[var(--soft-text)]">{access}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--soft-muted)]">{description}</p>
      <Link
        to={actionTo}
        className="mt-5 inline-flex rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-2 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)]"
      >
        {actionLabel}
      </Link>
    </article>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[2rem] border border-[var(--soft-border)] bg-white shadow-[0_20px_40px_rgba(80,67,52,0.08)]"
        >
          <div className="h-48 animate-pulse bg-[var(--soft-panel)]" />
          <div className="space-y-4 p-6">
            <div className="h-6 w-2/3 animate-pulse rounded-full bg-[var(--soft-page)]" />
            <div className="h-4 w-1/3 animate-pulse rounded-full bg-[var(--soft-page)]" />
            <div className="h-4 w-full animate-pulse rounded-full bg-[var(--soft-page)]" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-[var(--soft-page)]" />
            <div className="flex gap-3 pt-2">
              <div className="h-10 flex-1 animate-pulse rounded-full bg-[var(--soft-page)]" />
              <div className="h-10 flex-1 animate-pulse rounded-full bg-[var(--soft-page)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CatalogSection({ eyebrow, title, description, books, isAuthenticated }) {
  if (books.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--soft-text)]">{title}</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[var(--soft-muted)]">{description}</p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {books.map((book) => (
          <BookCard key={`${eyebrow}-${book.id}`} book={book} isAuthenticated={isAuthenticated} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [ownedBookIds, setOwnedBookIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      setError("");

      try {
        const [booksResponse, ordersResponse] = await Promise.all([
          bookApi.getBooks(),
          isAuthenticated ? orderApi.getMyOrders() : Promise.resolve({ data: [] }),
        ]);

        const nextBooks = booksResponse.data || [];
        const nextOrders = ordersResponse.data || [];
        const nextOwnedIds = new Set();

        for (const order of nextOrders) {
          for (const item of order.items || []) {
            nextOwnedIds.add(item.bookId);
          }
        }

        setOwnedBookIds(nextOwnedIds);
        setBooks(
          nextBooks.map((book) => ({
            ...book,
            isOwned: nextOwnedIds.has(book.id),
          }))
        );
      } catch (err) {
        setBooks([]);
        setOwnedBookIds(new Set());
        setError(getApiErrorMessage(err, "Unable to load books"));
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, [isAuthenticated]);

  const featuredCollections = useMemo(() => {
    const sortedByReviews = [...books].sort((left, right) => {
      const reviewDiff = Number(right.reviewCount || 0) - Number(left.reviewCount || 0);
      if (reviewDiff !== 0) {
        return reviewDiff;
      }

      return Number(right.averageRating || 0) - Number(left.averageRating || 0);
    });

    const trending = sortedByReviews.slice(0, 6);
    const trendingIds = new Set(trending.map((book) => book.id));
    const recommended = [...books]
      .filter((book) => !trendingIds.has(book.id))
      .sort((left, right) => {
        const ownedPriority = Number(right.isOwned) - Number(left.isOwned);
        if (ownedPriority !== 0) {
          return ownedPriority;
        }

        const ratingDiff = Number(right.averageRating || 0) - Number(left.averageRating || 0);
        if (ratingDiff !== 0) {
          return ratingDiff;
        }

        return Number(left.price || 0) - Number(right.price || 0);
      })
      .slice(0, 6);

    return { trending, recommended };
  }, [books]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-[var(--soft-border)] bg-white shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="px-6 py-10 sm:px-10 sm:py-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Reading Platform</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--soft-text)] sm:text-5xl">
              Discover your next book, preview it instantly, and keep reading right where you left off.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--soft-muted)]">
              Browse the catalog, open previews, unlock books through purchase or subscription, and move back into your reading flow without losing progress.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? "/library" : "/login"}
                className="rounded-full bg-[#352f2a] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
              >
                {isAuthenticated ? "Open My Library" : "Login"}
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-5 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)]"
                >
                  Register
                </Link>
              )}
              <Link
                to="/subscription"
                className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-5 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)]"
              >
                Subscription
              </Link>
            </div>
          </div>

          <div className="border-t border-[var(--soft-border)] bg-[var(--soft-panel)] px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Quick Summary</p>
            <div className="mt-6 grid gap-4">
              <SummaryCard
                label="Catalog"
                value={books.length}
                hint="Books available to browse right now with preview-first reading access."
              />
              <SummaryCard
                label="Owned"
                value={ownedBookIds.size}
                hint="Books already unlocked in your library for full reading access."
              />
            </div>
          </div>
        </div>
      </section>

      <ApiMessage type="error" text={error} />

      <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Access Reference</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--soft-text)]">Roles and how to reach them</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-[var(--soft-muted)]">
            Use this as a quick guide for which experience opens from each route. This section only explains access paths and platform roles.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <RoleReferenceCard
            role="Guest"
            access="Browse the public catalog"
            description="Visitors can open the landing page, explore books, view details, and preview the reading experience before signing in."
            actionLabel="Stay on Home"
            actionTo="/"
          />
          <RoleReferenceCard
            role="User"
            access="Register, login, and use the reader"
            description="A registered account can log in, purchase books, save reading progress, and open the personal library from the user routes."
            actionLabel={isAuthenticated ? "Open Library" : "Register"}
            actionTo={isAuthenticated ? "/library" : "/register"}
          />
          <RoleReferenceCard
            role="Subscriber"
            access="Activate broader reading access"
            description="Subscription access is reached from the subscription flow and is intended for readers who want ongoing access across the catalog."
            actionLabel="View Subscription"
            actionTo="/subscription"
          />
          <RoleReferenceCard
            role="Admin"
            access="Open the management workspace"
            description="The admin workspace is a separate protected area for catalog, users, orders, and payment management through the admin route."
            actionLabel="Admin Route Reference"
            actionTo="/admin"
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <ExperienceCard
          title="Preview Before You Buy"
          description="Open a book instantly, sample the first part of the reading experience, and decide whether to purchase or continue with subscription access."
          actionLabel="Explore Catalog"
          actionTo="/"
        />
        <ExperienceCard
          title="Continue Reading"
          description="Your progress is remembered, so each return to the reader can resume from the last saved page without refreshing the whole experience."
          actionLabel="Open Library"
          actionTo={isAuthenticated ? "/library" : "/login"}
        />
        <ExperienceCard
          title="Unlock More Access"
          description="Use subscription access when you want broader reading without purchasing every title one by one."
          actionLabel="View Subscription"
          actionTo="/subscription"
        />
      </section>

      {loading ? (
        <CatalogSkeleton />
      ) : books.length === 0 ? (
        <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white px-6 py-10 text-center shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <h2 className="text-2xl font-semibold text-[var(--soft-text)]">No books available right now</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">
            The catalog will appear here as soon as books are available through the current API.
          </p>
        </section>
      ) : (
        <>
          <CatalogSection
            eyebrow="Trending"
            title="Books readers are opening most"
            description="These titles are surfaced from the same catalog data, prioritized by review volume and rating."
            books={featuredCollections.trending}
            isAuthenticated={isAuthenticated}
          />
          <CatalogSection
            eyebrow="Recommended"
            title="Next picks for your shelf"
            description="A quieter mix of well-rated titles, with books you already own still marked clearly for quick return reading."
            books={featuredCollections.recommended}
            isAuthenticated={isAuthenticated}
          />
        </>
      )}
    </div>
  );
}
