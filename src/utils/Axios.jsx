import axios from "axios";

// Get the token from localStorage (assuming it's stored under "authToken").
const getAuthToken = () => localStorage.getItem("authToken");

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the Authorization header.
instance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
