import axiosClient from "./axiosClient";
import { unwrapApi } from "./unwrap";

export const reviewApi = {
  getReviews(bookId) {
    return unwrapApi(axiosClient.get(`/api/books/${bookId}/reviews`));
  },
  saveReview(bookId, payload) {
    return unwrapApi(axiosClient.post(`/api/books/${bookId}/reviews`, payload));
  },
};
