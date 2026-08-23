export interface OrderSummary {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  customerName: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: OrderSummary[];
  pagination: null;
  errors: unknown;
}

export interface OrderItem {
  id: number;
  productVariantId: number;
  productName: string;
  variantDescription: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetails {
  id: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  customerName: string;
  whatsAppNumber: string;
  backupPhoneNumber: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderDetailsResponse {
  success: boolean;
  message: string;
  data: OrderDetails;
  pagination: null;
  errors: unknown;
}
