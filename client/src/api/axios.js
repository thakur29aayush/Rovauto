import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://rovauto.onrender.com/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Check for garage token first, then fall back to customer token
    const garageToken = localStorage.getItem("garage_token");
    const customerToken = localStorage.getItem("token");
    const token = garageToken || customerToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "";

    if (
      error.response?.status === 401 &&
      /authentication token missing|authentication required|invalid or expired token/i.test(
        message
      )
    ) {
      error.response.data.message = "Login session expired. Please login again.";
    }

    return Promise.reject(error);
  }
);

export default api;
