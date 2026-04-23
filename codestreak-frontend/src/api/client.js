import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("cs_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — clear token and redirect to login
// client.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem("cs_token");
//       window.location.href = "/";
//     }
//     return Promise.reject(err?.response?.data || err);
//   }
// );

export default client;
