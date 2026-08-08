export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFollowup {
  id: number;
  customerId: number;
  followUpDate: string;
  notes: string;
  createdById: number;
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface Customer {
  id: number;
  customerName: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address?: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate?: string;
  notes?: string;
  isDeleted?: boolean;
  followups?: CustomerFollowup[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  productName: string;
  sku: string;
  category?: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdById: number;
  product: {
    id: number;
    productName: string;
    sku: string;
  };
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface ChallanItem {
  id: number;
  challanId: number;
  productId: number;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
}

export interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  totalQuantity: number;
  createdById: number;
  customer: {
    id: number;
    customerName: string;
    businessName?: string;
  };
  createdBy: {
    id: number;
    name: string;
  };
  items: ChallanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalChallans: number;
  challansByStatus: {
    draft: number;
    confirmed: number;
    cancelled: number;
  };
  recentChallans: Challan[];
  lowStockProducts: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totalPages?: number;
  total?: number;
  page?: number;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}
