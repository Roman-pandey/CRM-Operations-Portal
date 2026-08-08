import axios from 'axios';
import type { LoginResponse, User, Customer, Product, Challan, DashboardStats, ApiResponse, PaginatedResponse, StockMovement } from '../types';

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
  login: (credentials: any) => api.post<LoginResponse>('/auth/login', credentials).then(res => res.data),
  getMe: () => api.get<ApiResponse<User>>('/auth/me').then(res => res.data.data),
};

export const customerApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<Customer>>('/customers', { params }).then(res => res.data),
  getById: (id: string | number) => api.get<ApiResponse<Customer>>(`/customers/${id}`).then(res => res.data.data),
  create: (data: any) => api.post<ApiResponse<Customer>>('/customers', data).then(res => res.data.data),
  update: (id: string | number, data: any) => api.put<ApiResponse<Customer>>(`/customers/${id}`, data).then(res => res.data.data),
  delete: (id: string | number) => api.delete<ApiResponse<null>>(`/customers/${id}`).then(res => res.data),
  getFollowups: (id: string | number) => api.get(`/customers/${id}/followups`).then(res => res.data.data),
  createFollowup: (id: string | number, data: any) => api.post(`/customers/${id}/followups`, data).then(res => res.data.data),
};

export const productApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<Product>>('/products', { params }).then(res => res.data),
  getById: (id: string | number) => api.get<ApiResponse<Product>>(`/products/${id}`).then(res => res.data.data),
  create: (data: any) => api.post<ApiResponse<Product>>('/products', data).then(res => res.data.data),
  update: (id: string | number, data: any) => api.put<ApiResponse<Product>>(`/products/${id}`, data).then(res => res.data.data),
  delete: (id: string | number) => api.delete<ApiResponse<null>>(`/products/${id}`).then(res => res.data),
  getLowStock: () => api.get<ApiResponse<Product[]>>('/products/low-stock').then(res => res.data.data),
  adjustStock: (id: string | number, data: any) => api.post(`/products/${id}/stock`, data).then(res => res.data.data),
  getStockMovements: (id: string | number, params?: any) => api.get(`/products/${id}/stock-movements`, { params }).then(res => res.data),
};

export const stockMovementApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<StockMovement>>('/stock-movements', { params }).then(res => res.data),
};

export const challanApi = {
  getAll: (params?: any) => api.get<PaginatedResponse<Challan>>('/challans', { params }).then(res => res.data),
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
  getAll: (params?: any) => api.get<PaginatedResponse<User>>('/users', { params }).then(res => res.data),
  create: (data: any) => api.post<ApiResponse<User>>('/users', data).then(res => res.data.data),
  update: (id: string | number, data: any) => api.put<ApiResponse<User>>(`/users/${id}`, data).then(res => res.data.data),
  delete: (id: string | number) => api.delete<ApiResponse<null>>(`/users/${id}`).then(res => res.data),
};

export default api;
