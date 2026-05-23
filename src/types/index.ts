// ─── Shared Domain Types ─────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
}

export interface ProductType {
  id: string;
  p_name: string;
  p_cost: number | string;
  p_cat: string;
  p_details: string;
  p_imgs: ProductImage[];
  p_qu?: number; // quantity in cart
  isFeatured?: boolean;
}

export interface ShippingInfo {
  address: string;
  city: string;
  zip: string;
  phone: string;
}

export interface UserProfile {
  displayName?: string;
  points?: number;
  shippingInfo?: ShippingInfo;
  updatedAt?: string;
}

export interface OrderType {
  id: string;
  customer_email: string;
  customer_name: string;
  shippingInfo: ShippingInfo;
  productsList: ProductType[];
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled" | string;
  createdAt: number;
  totalAmount: number;
  paymentMethod: "bankak" | "mycashi" | "stripe";
  transactionReference: string;
  driverId?: string;
}

export interface DriverType {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
}

export type PaymentMethod = "bankak" | "mycashi" | "stripe";
