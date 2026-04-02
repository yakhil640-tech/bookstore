import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { bookApi } from "../api/bookApi";
import { readingApi } from "../api/readingApi";
import ApiMessage from "../components/common/ApiMessage";
import Loader from "../components/common/Loader";
import { getApiErrorMessage } from "../utils/apiError";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export default function MyLibrary() {
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLibrary() {
      setLoading(true);
      setError("");

      try {
        const [ordersResponse, booksResponse] = await Promise.all([
          orderApi.getMyOrders(),
          bookApi.getBooks(),
        ]);

        const orders = ordersResponse.data || [];
        const catalogBooks = booksResponse.data || [];
        const purchasedMap = new Map();

        for (const order of orders) {
          for (const item of order.items || []) {
            if (!purchasedMap.has(item.bookId)) {
              purchasedMap.set(item.bookId, {
                bookId: item.bookId,
                title: item.title,
                price: item.price,
                orderId: order.orderId,
                purchasedAt: order.orderedAt,
              });
            }
          }
        }

        const purchasedBooks = Array.from(purchasedMap.values());
        const progressResults = await Promise.all(
          purchasedBooks.map(async (book) => {
            try {
              const response = await readingApi.getProgress(book.bookId);
              return [book.bookId, response.data || null];
            } catch {
              return [book.bookId, null];
            }
          })
        );

        const progressMap = new Map(progressResults);
        const nextLibraryBooks = purchasedBooks.map((book) => {
          const progress = progressMap.get(book.bookId);
          const progressPercent = Number(progress?.progressPercent || 0);
          return {
            ...book,
            progressPercent,
            lastPage: Number(progress?.lastPage || 0),
            maxPage: Number(progress?.maxPage || 0),
            canContinue: Number(progress?.lastPage || 0) > 0,
          };
        });

        const ownedIds = new Set(nextLibraryBooks.map((book) => book.bookId));
        const nextRecommendedBooks = catalogBooks
          .filter((book) => !ownedIds.has(book.id))
          .sort((left, right) => {
            const ratingDiff = Number(right.averageRating || 0) - Number(left.averageRating || 0);
            if (ratingDiff !== 0) {
              return ratingDiff;
            }

            return Number(right.reviewCount || 0) - Number(left.reviewCount || 0);
          })
          .slice(0, 3);

        setLibraryBooks(nextLibraryBooks);
        setRecommendedBooks(nextRecommendedBooks);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load your library"));
      } finally {
        setLoading(false);
      }
    }

    loadLibrary();
  }, []);

  const summary = useMemo(() => {
    const unlocked = libraryBooks.length;
    const inProgress = libraryBooks.filter((book) => book.progressPercent > 0 && book.progressPercent < 100).length;
    const averageProgress =
      unlocked > 0
        ? Math.round(libraryBooks.reduce((total, book) => total + Number(book.progressPercent || 0), 0) / unlocked)
        : 0;

    return { unlocked, inProgress, averageProgress };
  }, [libraryBooks]);

  if (loading) {
    return <Loader text="Loading your library..." />;
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.5rem] border border-[var(--soft-border)] bg-white shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.92fr]">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">My Library</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--soft-text)]">Your purchased reading space</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--soft-muted)]">
              Every title here is already unlocked through your completed purchases, and each card keeps the current reading progress visible.
            </p>
          </div>

          <div className="border-t border-[var(--soft-border)] bg-[var(--soft-panel)] px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Library snapshot</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Unlocked books</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--soft-text)]">{summary.unlocked}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">In progress</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--soft-text)]">{summary.inProgress}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Average progress</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--soft-text)]">{summary.averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ApiMessage type="error" text={error} />

      {libraryBooks.length === 0 ? (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.2fr]">
          <div className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-10 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
            <h2 className="text-2xl font-semibold text-[var(--soft-text)]">No purchased books yet</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">
              Once a payment is completed, the book will appear here with direct reading access and saved progress.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-2xl bg-[#352f2a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Browse books
            </Link>
          </div>

          <div className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Recommended</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--soft-text)]">Try one of these next</h2>
            </div>
            <div className="mt-6 grid gap-4">
              {recommendedBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="rounded-[1.5rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5 transition hover:bg-[var(--soft-panel)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--soft-text)]">{book.title}</p>
                      <p className="mt-1 text-sm text-[var(--soft-muted)]">{book.author}</p>
                    </div>
                    <span className="rounded-full border border-[var(--soft-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
                      {Number(book.averageRating || 0).toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[var(--soft-text)]">{formatPrice(book.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {libraryBooks.map((book) => (
              <article
                key={book.bookId}
                className="overflow-hidden rounded-[2rem] border border-[var(--soft-border)] bg-white shadow-[0_20px_40px_rgba(80,67,52,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(80,67,52,0.12)]"
              >
                <div className="border-b border-[var(--soft-border)] bg-[var(--soft-page)] px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Unlocked</p>
                      <h2 className="mt-3 text-2xl font-semibold text-[var(--soft-text)]">{book.title}</h2>
                    </div>
                    <span className="rounded-full border border-[var(--soft-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
                      FULL ACCESS
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-2 text-sm text-[var(--soft-muted)]">
                    <p>Price: {formatPrice(book.price)}</p>
                    <p>Order ID: #{book.orderId}</p>
                    <p>Purchased: {new Date(book.purchasedAt).toLocaleString()}</p>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--soft-text)]">
                        {book.canContinue ? "Continue Reading" : "Ready to start"}
                      </p>
                      <p className="text-sm text-[var(--soft-muted)]">{book.progressPercent}%</p>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--soft-page)]">
                      <div className="h-full rounded-full bg-[#352f2a]" style={{ width: `${book.progressPercent}%` }} />
                    </div>
                    <p className="mt-3 text-sm text-[var(--soft-muted)]">
                      {book.canContinue
                        ? `Resume from page ${book.lastPage}${book.maxPage ? ` of ${book.maxPage}` : ""}.`
                        : "Open the reader to begin from page 1."}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link
                      to={`/reader/${book.bookId}`}
                      className="inline-flex rounded-2xl bg-[#352f2a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
                    >
                      {book.canContinue ? "Continue Reading" : "Read Now"}
                    </Link>
                    <Link
                      to={`/books/${book.bookId}`}
                      className="inline-flex rounded-2xl border border-[var(--soft-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-page)]"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {recommendedBooks.length > 0 && (
            <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Recommended next</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--soft-text)]">Keep your reading streak going</h2>
                </div>
                <Link to="/" className="text-sm font-semibold text-[var(--soft-text)] transition hover:opacity-70">
                  Browse all books
                </Link>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {recommendedBooks.map((book) => (
                  <Link
                    key={book.id}
                    to={`/books/${book.id}`}
                    className="rounded-[1.5rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5 transition hover:bg-[var(--soft-panel)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--soft-text)]">{book.title}</p>
                        <p className="mt-1 text-sm text-[var(--soft-muted)]">{book.author}</p>
                      </div>
                      <span className="rounded-full border border-[var(--soft-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
                        {Number(book.averageRating || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[var(--soft-text)]">{formatPrice(book.price)}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
