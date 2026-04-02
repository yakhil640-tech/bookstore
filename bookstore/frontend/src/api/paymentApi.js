import axiosClient from "./axiosClient";
import { unwrapApi } from "./unwrap";

export const paymentApi = {
  generateOrderPayment(orderId) {
    return unwrapApi(axiosClient.post(`/api/payments/orders/${orderId}/generate`));
  },
  generateSubscriptionPayment(subscriptionId) {
    return unwrapApi(axiosClient.post(`/api/payments/subscriptions/${subscriptionId}/generate`));
  },
  verifyPayment(paymentId, utr) {
    return unwrapApi(axiosClient.post(`/api/payments/${paymentId}/verify`, { utr }));
  },
};
