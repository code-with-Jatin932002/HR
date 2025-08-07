// utils/callApi.ts
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  Method,
} from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseUrl,
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('token');

  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/login')) {
        return Promise.reject(error); // Directly reject for login 401 errors
      }

      // For other 401 errors (e.g., token expiration on a protected route), attempt refresh
      originalRequest._retry = true;

      const refreshToken = sessionStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${baseUrl}/refresh-token`, {
            refresh_token: refreshToken,
          });

          const newAccessToken = res.data.access_token;
          sessionStorage.setItem('token', newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }

          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token fails, clear session and redirect to login
          sessionStorage.clear();
          window.location.href = '/'; // Redirect to home/login page
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, clear session and redirect to login
        sessionStorage.clear();
        window.location.href = '/'; // Redirect to home/login page
        return Promise.reject(error);
      }
    }

    // For any other errors (including 404, or 401 after retry) or if it's not a 401
    return Promise.reject(error);
  }
);

// ✅ API Caller
const callApi = async (
  method: Method,
  url: string,
  data: any = null,
  headers: AxiosRequestConfig['headers'] = {}
): Promise<any> => {
  const config: AxiosRequestConfig = {
    method,
    url,
    headers,
  };

  if (method !== 'GET' && method !== 'HEAD') {
    config.data = data;

    if (data instanceof FormData) {
      delete config.headers?.['Content-Type'];
    }
  }

  const response = await api(config);
  return response.data;
};

export default callApi;