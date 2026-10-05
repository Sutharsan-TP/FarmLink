import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach the stored JWT (if any) to every outgoing request. /api/auth/* and
// /api/market* don't need it, but sending a stale/absent header is harmless
// since those routes are public on the server.
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("farmsafe_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // SecureStore can throw on web/unsupported platforms — fail open.
    console.warn("Could not read auth token:", err?.message);
  }
  return config;
});

export default api;
