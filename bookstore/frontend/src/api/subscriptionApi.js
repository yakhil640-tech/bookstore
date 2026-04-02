import axiosClient from "./axiosClient";
import { unwrapApi } from "./unwrap";

export const subscriptionApi = {
  start() {
    return unwrapApi(axiosClient.post("/api/subscriptions/start"));
  },
  getMine() {
    return unwrapApi(axiosClient.get("/api/subscriptions/me"));
  },
};
