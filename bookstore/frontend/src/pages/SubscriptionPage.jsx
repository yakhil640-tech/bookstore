import { useEffect, useMemo, useState } from "react";
import ApiMessage from "../components/common/ApiMessage";
import Loader from "../components/common/Loader";
import PaymentDialog from "../components/payment/PaymentDialog";
import { paymentApi } from "../api/paymentApi";
import { subscriptionApi } from "../api/subscriptionApi";
import { getApiErrorMessage } from "../utils/apiError";

function isActiveAndNotExpired(subscription) {
  if (!subscription || subscription.status !== "ACTIVE" || !subscription.endDate) {
    return false;
  }

  const today = new Date().toISOString().slice(0, 10);
  return subscription.endDate >= today;
}

function BenefitCard({ title, description }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--soft-border)] bg-white p-5">
      <p className="text-base font-semibold text-[var(--soft-text)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--soft-muted)]">{description}</p>
    </div>
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [payment, setPayment] = useState(null);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [generatingPayment, setGeneratingPayment] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeSubscription = useMemo(
    () => subscriptions.find((subscription) => isActiveAndNotExpired(subscription)),
    [subscriptions]
  );

  const pendingSubscription = useMemo(
    () => subscriptions.find((subscription) => subscription.status === "PENDING"),
    [subscriptions]
  );

  const currentStatus = activeSubscription ? "ACTIVE" : pendingSubscription ? "PENDING" : "NONE";
  const referencePrice = activeSubscription?.monthlyPrice || pendingSubscription?.monthlyPrice || 299;

  const loadSubscriptions = async () => {
    const response = await subscriptionApi.getMine();
    setSubscriptions(response.data || []);
  };

  useEffect(() => {
    async function loadPage() {
      try {
        await loadSubscriptions();
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load subscription details"));
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  const handleStartSubscription = async () => {
    setStarting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await subscriptionApi.start();
      const paymentResponse = await paymentApi.generateSubscriptionPayment(response.data.subscriptionId);
      setPayment(paymentResponse.data);
      setUtr("");
      await loadSubscriptions();
      setSuccessMessage("Subscription request created. Complete the payment to activate your reading access.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to start subscription"));
    } finally {
      setStarting(false);
    }
  };

  const handleGeneratePendingPayment = async () => {
    if (!pendingSubscription) {
      return;
    }

    setGeneratingPayment(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await paymentApi.generateSubscriptionPayment(pendingSubscription.subscriptionId);
      setPayment(response.data);
      setSuccessMessage("Pending subscription payment is ready. Complete it and verify the UTR to activate access.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to prepare payment for the pending subscription"));
    } finally {
      setGeneratingPayment(false);
    }
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await paymentApi.verifyPayment(payment.paymentId, utr);
      setPayment(response.data);
      await loadSubscriptions();
      setSuccessMessage("Subscription payment verified successfully. Full reading access is now active.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to verify subscription payment"));
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <Loader text="Loading subscription page..." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-8 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Subscription</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--soft-text)]">Unlock broader reading access</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--soft-muted)]">
          Keep the same reading flow across the platform and unlock more titles without purchasing them one by one.
        </p>
        <div className="mt-6 rounded-[1.6rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Plan reference</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--soft-text)]">{formatPrice(referencePrice)} / month</p>
          <p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">
            This monthly plan is for full reading access across the catalog. If you subscribe, you can open any available book in full without buying each one separately.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">
            Most individual books are priced higher than one month of subscription, so this works best for readers who want access to multiple titles.
          </p>
        </div>
      </section>

      <ApiMessage type="error" text={error} />
      <ApiMessage type="success" text={successMessage} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Status</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--soft-text)]">Current reading access</h2>
            </div>
            <span className="rounded-full border border-[var(--soft-border)] bg-[var(--soft-page)] px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
              {currentStatus}
            </span>
          </div>

          {activeSubscription ? (
            <div className="rounded-[1.8rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5">
              <p className="text-lg font-semibold text-[var(--soft-text)]">{activeSubscription.planName}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-[var(--soft-border)] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Status</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">ACTIVE</p>
                </div>
                <div className="rounded-[1.4rem] border border-[var(--soft-border)] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Expiry date</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">{activeSubscription.endDate}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--soft-muted)]">
                Active subscription access is currently available until {activeSubscription.endDate}.
              </p>
            </div>
          ) : pendingSubscription ? (
            <div className="rounded-[1.8rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5">
              <p className="text-lg font-semibold text-[var(--soft-text)]">{pendingSubscription.planName}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-[var(--soft-border)] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Status</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">PENDING</p>
                </div>
                <div className="rounded-[1.4rem] border border-[var(--soft-border)] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">Next step</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--soft-text)]">Complete payment</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--soft-muted)]">
                Your subscription request exists already. Finish the payment flow below to activate access.
              </p>
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-6 text-sm text-[var(--soft-muted)]">
              No subscription is active right now. Start one to unlock broader reading access.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <BenefitCard
              title="Broader access"
              description="Read any available book in full while the monthly subscription stays active."
            />
            <BenefitCard
              title="Same reader flow"
              description="Keep using the same page-based reader and saved progress experience."
            />
            <BenefitCard
              title="Clear value"
              description={`${formatPrice(referencePrice)} per month gives full catalog reading instead of per-book purchase access.`}
            />
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
            <h2 className="text-2xl font-semibold text-[var(--soft-text)]">Manage subscription</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--soft-muted)]">
              Start a new subscription when you have no access, or continue the pending payment flow if one is already waiting. This plan is priced for full catalog reading at {formatPrice(referencePrice)} per month.
            </p>

            <div className="mt-6 grid gap-3">
              <button
                className="rounded-2xl bg-[#352f2a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                type="button"
                onClick={handleStartSubscription}
                disabled={starting || Boolean(activeSubscription) || Boolean(pendingSubscription)}
              >
                {starting ? "Starting..." : activeSubscription ? "Already Active" : pendingSubscription ? "Pending Subscription Exists" : "Start Subscription"}
              </button>

              {pendingSubscription && (
                <button
                  type="button"
                  onClick={handleGeneratePendingPayment}
                  disabled={generatingPayment}
                  className="rounded-2xl border border-[var(--soft-border)] bg-[var(--soft-page)] px-5 py-3 text-sm font-semibold text-[var(--soft-text)] transition hover:bg-[var(--soft-panel)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {generatingPayment ? "Preparing payment..." : "Continue Pending Payment"}
                </button>
              )}
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-[var(--soft-border)] bg-[var(--soft-page)] p-5 text-sm leading-6 text-[var(--soft-muted)]">
              <p className="font-semibold text-[var(--soft-text)]">How it works</p>
              <p className="mt-2">
                The backend creates a pending subscription first, then marks it active only after UPI verification succeeds.
              </p>
            </div>
          </div>

          {(payment || pendingSubscription) && (
            <PaymentDialog
              payment={payment}
              utr={utr}
              onUtrChange={setUtr}
              onVerify={handleVerifyPayment}
              loading={verifying}
              flowTitle="Subscription payment flow"
              createdLabel="Request Created"
              pendingLabel="Payment Pending"
              successLabel="Access Active"
              helperText="Use the UPI link, then verify the payment with your UTR to activate the subscription immediately."
            />
          )}
        </section>
      </div>
    </div>
  );
}
