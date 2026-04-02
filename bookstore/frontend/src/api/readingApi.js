import axiosClient from "./axiosClient";
import { unwrapApi } from "./unwrap";

export const readingApi = {
  readBook(bookId) {
    return unwrapApi(axiosClient.get(`/api/reading/books/${bookId}`));
  },
  getProgress(bookId) {
    return unwrapApi(axiosClient.get(`/api/reading/books/${bookId}/progress`));
  },
  saveProgress(bookId, lastPage) {
    return unwrapApi(axiosClient.put(`/api/reading/books/${bookId}/progress`, { lastPage }));
  },
};
