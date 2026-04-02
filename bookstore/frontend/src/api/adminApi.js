import axiosClient from "./axiosClient";
import { unwrapApi } from "./unwrap";

export const adminApi = {
  getAnalytics() {
    return unwrapApi(axiosClient.get("/api/admin/analytics"));
  },
  getUsers() {
    return unwrapApi(axiosClient.get("/api/admin/users"));
  },
  getOrders() {
    return unwrapApi(axiosClient.get("/api/admin/orders"));
  },
  getPayments() {
    return unwrapApi(axiosClient.get("/api/admin/payments"));
  },
  getBooks() {
    return unwrapApi(axiosClient.get("/api/admin/books"));
  },
  createBook(payload) {
    return unwrapApi(axiosClient.post("/api/admin/books", payload));
  },
  updateBook(bookId, payload) {
    return unwrapApi(axiosClient.put(`/api/admin/books/${bookId}`, payload));
  },
  deleteBook(bookId) {
    return unwrapApi(axiosClient.delete(`/api/admin/books/${bookId}`));
  },
};
