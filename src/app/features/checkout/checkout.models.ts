import { OrderDetails } from '../orders/orders.models';

export interface CheckoutRequest {
  shippingAddress: string;
  customerName: string;
  whatsAppNumber: string;
  backupPhoneNumber: string;
  notes: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: OrderDetails;
  pagination: null;
  errors: unknown;
}
