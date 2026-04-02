import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bookApi } from "../api/bookApi";
import { readingApi } from "../api/readingApi";
import { orderApi } from "../api/orderApi";
import { paymentApi } from "../api/paymentApi";
import ApiMessage from "../components/common/ApiMessage";
import Loader from "../components/common/Loader";
import AccessBanner from "../components/reading/AccessBanner";
import PaymentDialog from "../components/payment/PaymentDialog";
import { getApiErrorMessage } from "../utils/apiError";
import { buildSimulatedBookPages } from "../utils/readerContent";

const PREVIEW_PAGE_LIMIT = 10;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildLocalProgress(currentPage, maxPage) {
  return {
    lastPage: currentPage,
    maxPage,
    progressPercent: maxPage > 0 ? Math.round((currentPage / maxPage) * 100) : 0,
  };
}

export default function ReaderPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [readerData, setReaderData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [payment, setPayment] = useState(null);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const lastPersistedPageRef = useRef(null);

  const pages = useMemo(() => buildSimulatedBookPages(book || readerData), [book, readerData]);
  const isFullAccess = readerData?.accessType === "FULL";
  const readablePageCount = useMemo(
    () => (isFullAccess ? pages.length : Math.min(PREVIEW_PAGE_LIMIT, pages.length)),
    [isFullAccess, pages.length]
  );

  const visiblePages = useMemo(() => pages.slice(0, readablePageCount), [pages, readablePageCount]);
  const activePageText = visiblePages[currentPage - 1] || "";
  const activeParagraphs = activePageText.split("\n\n").filter(Boolean);
  const hasReachedPreviewLimit = !isFullAccess && currentPage >= readablePageCount;

  useEffect(() => {
    async function loadInitialReader() {
      setLoading(true);

      try {
        const [readerResponse, progressResponse, bookResponse] = await Promise.all([
          readingApi.readBook(bookId),
          readingApi.getProgress(bookId),
          bookApi.getBook(bookId),
        ]);

        const nextReaderData = readerResponse.data;
        const nextBook = bookResponse.data;
        const nextPages = buildSimulatedBookPages(nextBook || nextReaderData);
        const nextReadablePageCount =
          nextReaderData?.accessType === "FULL"
            ? nextPages.length
            : Math.min(PREVIEW_PAGE_LIMIT, nextPages.length);
        const savedPage = Number(progressResponse.data?.lastPage || 1);
        const nextPage = clamp(savedPage || 1, 1, nextReadablePageCount);

        setBook(nextBook);
        setReaderData(nextReaderData);
        setProgress({
          ...(progressResponse.data || {}),
          lastPage: nextPage,
          maxPage: nextReadablePageCount,
          progressPercent: nextReadablePageCount > 0 ? Math.round((nextPage / nextReadablePageCount) * 100) : 0,
        });
        setCurrentPage(nextPage);
        lastPersistedPageRef.current = nextPage;
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load reader"));
      } finally {
        setLoading(false);
      }
    }

    loadInitialReader();
  }, [bookId]);

  useEffect(() => {
    if (!readerData || !readablePageCount || !currentPage) {
      return;
    }

    const nextProgress = buildLocalProgress(currentPage, readablePageCount);
    setProgress((current) => ({
      ...(current || {}),
      ...nextProgress,
    }));

    if (lastPersistedPageRef.current === currentPage) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await readingApi.saveProgress(bookId, currentPage);
        lastPersistedPageRef.current = currentPage;
        setProgress((current) => ({
          ...(current || {}),
          ...(response.data || {}),
          lastPage: currentPage,
          maxPage: readablePageCount,
          progressPercent: readablePageCount > 0 ? Math.round((currentPage / readablePageCount) * 100) : 0,
        }));
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to save reading progress"));
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bookId, currentPage, readablePageCount, readerData]);

  useEffect(() => {
    if (!readablePageCount) {
      return;
    }

    setCurrentPage((current) => clamp(current || 1, 1, readablePageCount));
  }, [readablePageCount]);

  const handleBuyBook = async () => {
    setBuying(true);
    setError("");
    setSuccessMessage("");

    try {
      const orderResponse = await orderApi.createOrder([Number(bookId)]);
      const paymentResponse = await paymentApi.generateOrderPayment(orderResponse.data.orderId);
      setPayment(paymentResponse.data);
      setUtr("");
      setSuccessMessage("Order created. Complete the payment to unlock full access.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to start purchase flow"));
    } finally {
      setBuying(false);
    }
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await paymentApi.verifyPayment(payment.paymentId, utr);
      setPayment(response.data);

      const [readerResponse, progressResponse] = await Promise.all([
        readingApi.readBook(bookId),
        readingApi.getProgress(bookId),
      ]);

      const nextReaderData = readerResponse.data;
      const nextReadablePageCount =
        nextReaderData?.accessType === "FULL"
          ? pages.length
          : Math.min(PREVIEW_PAGE_LIMIT, pages.length);
      const resumedPage = clamp(Number(progressResponse.data?.lastPage || currentPage), 1, nextReadablePageCount);

      setReaderData(nextReaderData);
      setCurrentPage(resumedPage);
      setProgress({
        ...(progressResponse.data || {}),
        lastPage: resumedPage,
        maxPage: nextReadablePageCount,
        progressPercent: nextReadablePageCount > 0 ? Math.round((resumedPage / nextReadablePageCount) * 100) : 0,
      });
      lastPersistedPageRef.current = resumedPage;
      setSuccessMessage("Payment verified successfully. Full reading access is now available.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Payment verification failed"));
    } finally {
      setVerifying(false);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((current) => clamp(current - 1, 1, readablePageCount));
  };

  const handleNextPage = () => {
    setCurrentPage((current) => clamp(current + 1, 1, readablePageCount));
  };

  if (loading) {
    return <Loader text="Loading reader..." />;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2.5rem] border border-[var(--soft-border)] bg-white shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Reader</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--soft-text)]">{readerData?.title || book?.title}</h1>
            <p className="mt-2 text-base text-[var(--soft-muted)]">by {readerData?.author || book?.author}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-2 text-sm font-semibold text-[var(--soft-text)]">
                {isFullAccess ? "FULL ACCESS" : "PREVIEW"}
              </span>
              <span className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-2 text-sm font-semibold text-[var(--soft-text)]">
                Page {currentPage} / {readablePageCount}
              </span>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--soft-muted)]">
              Move page by page through a readable book experience, with progress saved in the background as you continue.
            </p>
          </div>

          <div className="border-t border-[var(--soft-border)] bg-[var(--soft-panel)] px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Session Snapshot</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Current page</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--soft-text)]">{currentPage}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Progress</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--soft-text)]">{progress?.progressPercent ?? 0}%</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Readable pages</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--soft-text)]">{readablePageCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ApiMessage type="error" text={error} />
      <ApiMessage type="success" text={successMessage} />

      {readerData && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.92fr)]">
          <section className="space-y-5 rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
            <AccessBanner accessType={readerData.accessType} message={readerData.message} />

            <div className="rounded-[2rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-[var(--soft-text)]">{readerData.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--soft-muted)]">
                    {isFullAccess
                      ? "Full reading access is active. Your progress is saved automatically when you move through pages."
                      : "Preview mode is limited to the first 10 pages. The next pages stay locked until you buy this book or unlock broader access."}
                  </p>
                </div>
                <span className="rounded-full border border-[var(--soft-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--soft-text)]">
                  Page {currentPage} / {readablePageCount}
                </span>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#352f2a] transition-all"
                  style={{ width: `${Math.min(Number(progress?.progressPercent ?? 0), 100)}%` }}
                />
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-[var(--soft-border)] bg-white p-6">
                <div className="flex items-center justify-between gap-4 border-b border-[var(--soft-border)] pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Current reading page</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">
                      Page {currentPage} of {readablePageCount}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[var(--soft-muted)]">{progress?.progressPercent ?? 0}% completed</p>
                </div>

                <div className="mt-6 space-y-5">
                  {activeParagraphs.map((paragraph, index) => (
                    <p key={`${currentPage}-${index}`} className="text-sm leading-8 text-[var(--soft-text)]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                  className="rounded-2xl border border-[var(--soft-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-page)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous Page
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= readablePageCount}
                  className="rounded-2xl bg-[#352f2a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next Page
                </button>
              </div>

              {hasReachedPreviewLimit && (
                <div className="mt-6 rounded-[1.6rem] border border-[var(--soft-border)] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Preview complete</p>
                  <h4 className="mt-2 text-xl font-semibold text-[var(--soft-text)]">The next page is locked</h4>
                  <p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">
                    Buy this book to unlock only this title in full, or use subscription access if you want broader reading across the catalog.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      className="rounded-2xl bg-[#352f2a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                      type="button"
                      onClick={handleBuyBook}
                      disabled={buying}
                    >
                      {buying ? "Creating order..." : "Buy this book"}
                    </button>
                    <Link
                      className="rounded-2xl border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-3 text-center text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)]"
                      to="/subscription"
                    >
                      Subscribe for more access
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            {readerData.accessType === "PREVIEW" && (
              <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Unlock access</p>
                <h3 className="mt-3 text-2xl font-semibold text-[var(--soft-text)]">Continue beyond the preview</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">
                  Buy this book for direct full access, or use subscription access to unlock more titles in one flow.
                </p>
                <div className="mt-6 grid gap-3">
                  <button
                    className="rounded-2xl bg-[#352f2a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                    type="button"
                    onClick={handleBuyBook}
                    disabled={buying}
                  >
                    {buying ? "Creating order..." : "Buy this book"}
                  </button>
                  <Link
                    className="rounded-2xl border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-3 text-center text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)]"
                    to="/subscription"
                  >
                    Get subscription access
                  </Link>
                </div>
              </section>
            )}

            <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Reading summary</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Resume point</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">Page {progress?.lastPage ?? currentPage}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Mode</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">{isFullAccess ? "Full reading" : "Preview sample"}</p>
                </div>
              </div>
            </section>

            <PaymentDialog
              payment={payment}
              utr={utr}
              onUtrChange={setUtr}
              onVerify={handleVerifyPayment}
              loading={verifying}
              flowTitle="Book purchase flow"
              createdLabel="Order Created"
              pendingLabel="Payment Pending"
              successLabel="Payment Success"
              helperText="Pay using the generated UPI link, then verify with your UTR to unlock full reading instantly."
            />
          </aside>
        </div>
      )}
    </div>
  );
}
