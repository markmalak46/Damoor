export type AdminOrderStatusFilter = '' | 'Pending' | 'Delivered' | 'Cancelled';

export interface AdminOrdersQuery {
  page: number;
  pageSize: number;
  status: AdminOrderStatusFilter;
  search: string;
  asc: boolean | null;
}

export interface AdminOrderSummary {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  userId: number | null;
  customerName: string;
  whatsAppNumber: string;
  accountEmail: string | null;
  sessionToken: string | null;
}

export interface AdminOrderItem {
  id: number;
  productVariantId: number;
  productName: string;
  variantDescription: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminOrderDetails extends AdminOrderSummary {
  shippingAddress: string;
  backupPhoneNumber: string;
  notes: string | null;
  updatedAt: string | null;
  items: AdminOrderItem[];
}

export interface AdminOrdersPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminOrdersResponse {
  success: boolean;
  message: string;
  data: AdminOrderSummary[];
  pagination: AdminOrdersPagination | null;
  errors: unknown;
}

export interface AdminOrderDetailsResponse {
  success: boolean;
  message: string;
  data: AdminOrderDetails;
  pagination: null;
  errors: unknown;
}
