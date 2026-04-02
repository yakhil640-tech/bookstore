import axiosClient from "./axiosClient";
import { unwrapApi } from "./unwrap";

export const authApi = {
  register(payload) {
    return unwrapApi(axiosClient.post("/api/auth/register", payload));
  },
  login(payload) {
    return unwrapApi(axiosClient.post("/api/auth/login", payload));
  },
  getMe() {
    return unwrapApi(axiosClient.get("/api/auth/me"));
  },
};
