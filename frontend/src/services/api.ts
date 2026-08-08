import axios from 'axios';
import type { User, Customer, Product, Challan, DashboardStats, ApiResponse, StockMovement } from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: any) => api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', credentials).then(res => res.data.data),
  getMe: () => api.get<ApiResponse<User>>('/auth/me').then(res => res.data.data),
};

const formatPaginated = (raw: any, key: string) => {
  const payload = raw?.data || {};
  const items = payload[key] || [];
  const pagination = payload.pagination || { page: 1, limit: 10, total: items.length, totalPages: 1 };
  return {
    data: items,
    pagination,
    meta: pagination,
    totalPages: pagination.totalPages || 1,
    total: pagination.total || 0,
  };
};

export const customerApi = {
  getAll: (params?: any) => api.get('/customers', { params }).then(res => formatPaginated(res.data, 'customers')),
  getById: (id: string | number) => api.get<ApiResponse<Customer>>(`/customers/${id}`).then(res => res.data.data),
  create: (data: any) => api.post<ApiResponse<Customer>>('/customers', data).then(res => res.data.data),
  update: (id: string | number, data: any) => api.put<ApiResponse<Customer>>(`/customers/${id}`, data).then(res => res.data.data),
  delete: (id: string | number) => api.delete<ApiResponse<null>>(`/customers/${id}`).then(res => res.data),
  getFollowups: (id: string | number) => api.get(`/customers/${id}/followups`).then(res => res.data.data),
  createFollowup: (id: string | number, data: any) => api.post(`/customers/${id}/followups`, data).then(res => res.data.data),
};

export const productApi = {
  getAll: (params?: any) => api.get('/products', { params }).then(res => formatPaginated(res.data, 'products')),
  getById: (id: string | number) => api.get<ApiResponse<Product>>(`/products/${id}`).then(res => res.data.data),
  create: (data: any) => api.post<ApiResponse<Product>>('/products', data).then(res => res.data.data),
  update: (id: string | number, data: any) => api.put<ApiResponse<Product>>(`/products/${id}`, data).then(res => res.data.data),
  delete: (id: string | number) => api.delete<ApiResponse<null>>(`/products/${id}`).then(res => res.data),
  getLowStock: () => api.get<ApiResponse<Product[]>>('/products/low-stock').then(res => res.data.data),
  adjustStock: (id: string | number, data: any) => api.post(`/products/${id}/stock`, data).then(res => res.data.data),
  getStockMovements: (id: string | number, params?: any) => api.get(`/products/${id}/stock-movements`, { params }).then(res => formatPaginated(res.data, 'movements')),
};

export const stockMovementApi = {
  getAll: (params?: any) => api.get('/stock-movements', { params }).then(res => formatPaginated(res.data, 'movements')),
};

export const challanApi = {
  getAll: (params?: any) => api.get('/challans', { params }).then(res => formatPaginated(res.data, 'challans')),
  getById: (id: string | number) => api.get<ApiResponse<Challan>>(`/challans/${id}`).then(res => res.data.data),
  create: (data: any) => api.post<ApiResponse<Challan>>('/challans', data).then(res => res.data.data),
  update: (id: string | number, data: any) => api.put<ApiResponse<Challan>>(`/challans/${id}`, data).then(res => res.data.data),
  confirm: (id: string | number) => api.post<ApiResponse<Challan>>(`/challans/${id}/confirm`).then(res => res.data.data),
  cancel: (id: string | number) => api.post<ApiResponse<Challan>>(`/challans/${id}/cancel`).then(res => res.data.data),
};

export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard').then(res => res.data.data),
};

export const userApi = {
  getAll: (params?: any) => api.get('/users', { params }).then(res => formatPaginated(res.data, 'users')),
  create: (data: any) => api.post<ApiResponse<User>>('/users', data).then(res => res.data.data),
  update: (id: string | number, data: any) => api.put<ApiResponse<User>>(`/users/${id}`, data).then(res => res.data.data),
  delete: (id: string | number) => api.delete<ApiResponse<null>>(`/users/${id}`).then(res => res.data),
};

export default api;
