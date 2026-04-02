import axiosClient from "./axiosClient";
import { unwrapApi } from "./unwrap";

export const orderApi = {
  createOrder(bookIds) {
    return unwrapApi(axiosClient.post("/api/orders", { bookIds }));
  },
  getMyOrders() {
    return unwrapApi(axiosClient.get("/api/orders/me"));
  },
};
