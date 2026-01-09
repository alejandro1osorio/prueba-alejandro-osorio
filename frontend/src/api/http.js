import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  timeout: 15000
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normaliza mensajes del backend
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.details ||
      err?.message ||
      "Error de red";
    return Promise.reject(new Error(msg));
  }
);