import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message?.toLowerCase() || "";
    const isAuthFailure = status === 401 && (
      message.includes("token") ||
      message.includes("unauthorized") ||
      message.includes("please login") ||
      message.includes("access denied") ||
      message.includes("access denined")
    );

    if (isAuthFailure && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.replace("/login?expired=1");
    }

    return Promise.reject(error);
  }
);

export default api;
