import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 是否正在刷新 token（防止并发刷新）
let isRefreshing = false;
// 刷新期间挂起的请求队列
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  pendingQueue = [];
}

function forceLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('admin');
  window.location.href = '/login';
}

// 刷新 token
async function doRefreshToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('无 refresh_token');
  }

  // 用裸 axios 调用，避免走拦截器死循环
  const res = await axios.post(`${BASE_URL}/admin/refresh`, {
    refresh_token: refreshToken,
  });

  const { access_token, refresh_token: newRefreshToken } = res.data.data;
  localStorage.setItem('token', access_token);
  localStorage.setItem('refresh_token', newRefreshToken);
  return access_token;
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      if (res.code === 401) {
        forceLogout();
      }
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

    // 401 且未重试过，尝试无感刷新
    if (error.response?.status === 401 && originalConfig && !originalConfig._retried) {
      // 刷新接口本身 401，直接登出
      if (originalConfig.url?.includes('/admin/refresh')) {
        forceLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 正在刷新，挂起等待
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              originalConfig.headers.Authorization = `Bearer ${token}`;
              resolve(request(originalConfig));
            },
            reject,
          });
        });
      }

      originalConfig._retried = true;
      isRefreshing = true;

      try {
        const newToken = await doRefreshToken();
        processQueue(null, newToken);
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return request(originalConfig);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        forceLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default request;
