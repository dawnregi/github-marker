import type { ErrorResponse } from '@/api/user/user.type';
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

// Create axios instance with default config
const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if refresh is in progress to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: void) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

const refreshToken = async (): Promise<void> => {
  const response = await axiosClient.post('/auth/refresh');
  return response.data;
};

// Request interceptor
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Credentials (cookies) are automatically sent with withCredentials: true
    // No need to manually add tokens
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && 
        typeof error.response?.data?.detail === 'string' && 
        error.response.data.detail === 'ACCESS_TOKEN_EXPIRED' && 
        !originalRequest._retry) {
      // Skip refresh for login/register/refresh endpoints
     

      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshToken();
        processQueue(null);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        // Redirect to login page
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    
    return Promise.reject(error);
  }
);

export default axiosClient;
