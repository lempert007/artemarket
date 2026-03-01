import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("artemarket_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("artemarket_token");
      window.dispatchEvent(new Event("artemarket:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default client;
