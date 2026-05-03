export type OrderStatus = "waiting" | "delivered" | "cancelled";

export interface AdminOrder {
  id: string;
  customer: string;
  total: number;
  date: string;
  dateRange: string;
  status: OrderStatus;
}
