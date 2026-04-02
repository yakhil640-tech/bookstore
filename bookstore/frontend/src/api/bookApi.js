import axiosClient from "./axiosClient";
import { unwrapApi } from "./unwrap";

export const bookApi = {
  getBooks() {
    return unwrapApi(axiosClient.get("/api/books"));
  },
  getBook(bookId) {
    return unwrapApi(axiosClient.get(`/api/books/${bookId}`));
  },
  getPreview(bookId) {
    return unwrapApi(axiosClient.get(`/api/books/${bookId}/preview`));
  },
};
