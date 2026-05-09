export type OrderStatus = "waiting" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "unpaid";
export type PaymentMethod = "online" | "cod";

export interface AdminOrder {
  id: string;
  customer: string;
  total: number;
  date: string;
  dateRange: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  note?: string;
}
