import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bookApi } from "../api/bookApi";
import { orderApi } from "../api/orderApi";
import { paymentApi } from "../api/paymentApi";
import { reviewApi } from "../api/reviewApi";
import { getApiErrorMessage } from "../utils/apiError";
import Loader from "../components/common/Loader";
import ApiMessage from "../components/common/ApiMessage";
import BookPreviewPanel from "../components/books/BookPreviewPanel";
import PaymentDialog from "../components/payment/PaymentDialog";
import { useAuth } from "../auth/useAuth";

const initialReviewForm = {
  rating: 5,
  comment: "",
};

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export default function BookDetailsPage() {
  const { bookId } = useParams();
  const { isAuthenticated, hasRole } = useAuth();
  const [book, setBook] = useState(null);
  const [preview, setPreview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ownedBookIds, setOwnedBookIds] = useState(new Set());
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [payment, setPayment] = useState(null);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingReview, setSavingReview] = useState(false);
  const [buying, setBuying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isSubscriber = hasRole("ROLE_SUBSCRIBER");
  const isOwned = useMemo(() => ownedBookIds.has(Number(bookId)), [bookId, ownedBookIds]);
  const hasFullAccess = isOwned || isSubscriber;

  const loadPage = async () => {
    const requests = [
      bookApi.getBook(bookId),
      bookApi.getPreview(bookId),
      reviewApi.getReviews(bookId),
      isAuthenticated ? orderApi.getMyOrders() : Promise.resolve({ data: [] }),
    ];

    const [bookResponse, previewResponse, reviewResponse, ordersResponse] = await Promise.all(requests);
    const nextOrders = ordersResponse.data || [];
    const nextOwnedBookIds = new Set();

    for (const order of nextOrders) {
      for (const item of order.items || []) {
        nextOwnedBookIds.add(item.bookId);
      }
    }

    setBook(bookResponse.data);
    setPreview(previewResponse.data);
    setReviews(reviewResponse.data || []);
    setOwnedBookIds(nextOwnedBookIds);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        await loadPage();
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load book details"));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [bookId, isAuthenticated]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setReviewForm((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    setSavingReview(true);
    setError("");
    setSuccessMessage("");

    try {
      await reviewApi.saveReview(bookId, reviewForm);
      await loadPage();
      setSuccessMessage("Review saved successfully.");
      setReviewForm(initialReviewForm);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save review"));
    } finally {
      setSavingReview(false);
    }
  };

  const handleBuyBook = async () => {
    setBuying(true);
    setError("");
    setSuccessMessage("");

    try {
      const orderResponse = await orderApi.createOrder([Number(bookId)]);
      const paymentResponse = await paymentApi.generateOrderPayment(orderResponse.data.orderId);
      setPayment(paymentResponse.data);
      setUtr("");
      setSuccessMessage("Order created. Complete the payment to unlock this book.");
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
      await loadPage();
      setSuccessMessage("Payment verified successfully. This book is now available in your library.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Payment verification failed"));
    } finally {
      setVerifying(false);
    }
  };

  const scrollToPreview = () => {
    document.getElementById("preview-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return <Loader text="Loading book details..." />;
  }

  return (
    <div className="space-y-6">
      <ApiMessage type="error" text={error} />
      <ApiMessage type="success" text={successMessage} />

      {book && (
        <section className="overflow-hidden rounded-[2rem] border border-[var(--soft-border)] bg-white p-8 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_340px]">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Book Details</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--soft-text)]">{book.title}</h1>
              <p className="mt-3 text-base text-[var(--soft-muted)]">by {book.author}</p>
              <p className="mt-5 text-sm leading-7 text-[var(--soft-muted)]">{book.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
                  {hasFullAccess ? "Full access available" : "Preview 10 pages"}
                </span>
                <span className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
                  Full {book.fullPageCount} pages
                </span>
                {isSubscriber && (
                  <span className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
                    Included in subscription
                  </span>
                )}
                <span className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
                  {Number(book.averageRating || 0).toFixed(1)} rating
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-[#352f2a] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
                  to={isAuthenticated ? `/reader/${book.id}` : "/login"}
                >
                  Read Now
                </Link>
                {!hasFullAccess && (
                  <button
                    type="button"
                    onClick={scrollToPreview}
                    className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-5 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)]"
                  >
                    Preview
                  </button>
                )}
                {isAuthenticated && !hasFullAccess && (
                  <button
                    type="button"
                    onClick={handleBuyBook}
                    disabled={buying || verifying || isOwned}
                    className="rounded-full border border-[var(--soft-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-page)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isOwned ? "Already Owned" : buying ? "Creating order..." : "Buy Now"}
                  </button>
                )}
                {!isAuthenticated && !hasFullAccess && (
                  <Link
                    to="/login"
                    className="rounded-full border border-[var(--soft-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-page)]"
                  >
                    Buy Now
                  </Link>
                )}
              </div>

              {hasFullAccess && (
                <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {isOwned ? "You already own this book." : "Your subscription already unlocks this book in full."}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Reading Status</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--soft-text)]">{formatPrice(book.price)}</p>

              <div className="mt-5 space-y-3">
                <div className="rounded-[1.4rem] border border-[var(--soft-border)] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Purchase Status</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">
                    {isOwned ? "Owned" : isSubscriber ? "Included in subscription" : "Preview Available"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-[var(--soft-border)] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Reviews</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">{book.reviewCount} review(s)</p>
                </div>
                <div className="rounded-[1.4rem] border border-[var(--soft-border)] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Access</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">
                    {hasFullAccess ? "Full reading unlocked" : "Read the first 10 pages, then buy or subscribe to unlock full reading"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div id="preview-panel">
        <BookPreviewPanel book={book} preview={preview} />
      </div>

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
        helperText="Use the UPI link, complete the payment, then verify with your UTR to unlock the book immediately."
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Reviews</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--soft-text)]">Reader feedback</h2>
            </div>
            <span className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
              {reviews.length} review(s)
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5 text-sm text-[var(--soft-muted)]">
                No reviews yet.
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="rounded-[1.5rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--soft-text)]">{review.userName}</p>
                      <p className="mt-1 text-xs text-[var(--soft-muted)]">{new Date(review.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full border border-[var(--soft-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--soft-muted)]">{review.comment || "No comment added."}</p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Rate this book</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--soft-text)]">Share your review</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">
            Reviews are still validated by the backend, so only readers with valid access can submit them.
          </p>

          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
              <div>
                <label htmlFor="rating" className="mb-2 block text-sm font-medium text-[var(--soft-text)]">Rating</label>
                <select
                  id="rating"
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-3 text-sm text-[var(--soft-text)] outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} / 5</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="comment" className="mb-2 block text-sm font-medium text-[var(--soft-text)]">Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="5"
                  value={reviewForm.comment}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[var(--soft-border)] bg-[var(--soft-page)] px-4 py-3 text-sm text-[var(--soft-text)] outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
                  placeholder="Share what you liked about this book"
                />
              </div>
              <button
                type="submit"
                disabled={savingReview}
                className="w-full rounded-2xl bg-[#352f2a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingReview ? "Saving Review..." : "Save Review"}
              </button>
            </form>
          ) : (
            <Link
              to="/login"
              className="mt-6 inline-flex rounded-2xl bg-[#352f2a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Login To Review
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
