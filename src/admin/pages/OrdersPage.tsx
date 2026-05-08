import { useEffect, useState } from "react";
import { FiBox } from "react-icons/fi";
import { supabase } from "@lib/supabase";

import ReceiptModal from "./ReceiptModal";
import AddOrderModal from "./AddOrderModal";
import type { AdminOrder, OrderStatus } from "./orderTypes";

function StatusBadge({ status }: { status: OrderStatus }): JSX.Element {
  const styles = {
    waiting: "status-badge status-waiting",
    delivered: "status-badge status-delivered",
    cancelled: "status-badge status-cancelled",
  };

  return (
    <span className={styles[status]}>
      {status.toUpperCase()}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: "paid" | "unpaid" }) {
  const styles = {
    paid: "bg-green-100 text-green-700",
    unpaid: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: "online" | "cod" }) {
  const styles = {
    online: "bg-blue-100 text-blue-700",
    cod: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[method]}`}
    >
      {method === "cod" ? "COD" : "ONLINE"}
    </span>
  );
}

function OrdersListSection({
  orders,
  onViewReceipt,
}: {
  orders: AdminOrder[];
  onViewReceipt: (orderId: string) => void;
}): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.ceil(orders.length / 10);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * 10,
    currentPage * 10,
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <section className="riders-list-section">
      <table className="riders-table">
        <thead>
          <tr className="border-b bg-gray-100 text-left text-sm">
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Payment Status</th>
            <th className="px-4 py-2">Payment Method</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Receipt</th>
          </tr>
        </thead>

        <tbody>
          {paginatedOrders.map((order) => (
            <tr key={order.id} className="border-b text-sm hover:bg-gray-50">
              <td className="px-4 py-2">{order.customer}</td>
              <td className="px-4 py-2">PHP {order.total.toFixed(2)}</td>
              <td className="px-4 py-2">{order.date}</td>

              <td className="px-4 py-2">
                <PaymentStatusBadge status={order.paymentStatus} />
              </td>

              <td className="px-4 py-2">
                <PaymentMethodBadge method={order.paymentMethod} />
              </td>

              <td className="px-4 py-2">
                <StatusBadge status={order.status} />
              </td>

              <td>
                <button
                  onClick={() => onViewReceipt(order.id)}
                  className="riders-details-btn"
                  title="View Receipt"
                >
                  👁
                </button>
              </td>
            </tr>
          ))}

          {paginatedOrders.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="riders-footer">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {currentPage > 1 && (
              <button
                type="button"
                onClick={handlePreviousPage}
                className="riders-prev-btn"
              >
                &lt; Previous
              </button>
            )}
            {currentPage < totalPages && (
              <button
                type="button"
                onClick={handleNextPage}
                className="riders-next-btn"
              >
                Next &gt;
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default function OrdersPage(): JSX.Element {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const normalizeStatus = (status: string | null | undefined): OrderStatus => {
    if (status === "delivered" || status === "cancelled") {
      return status;
    }

    return "waiting";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      const mapped: AdminOrder[] = (data ?? []).map((order) => ({
        id: order.id,
        customer: order.customer_name ?? "N/A",
        total: order.total ?? 0,
        date: new Date(order.created_at).toLocaleDateString(),
        dateRange: "Today",
        status: normalizeStatus(order.status),
        paymentStatus: order.payment_status ?? "unpaid",
        paymentMethod: order.payment_method ?? "cod",
      }));

      setOrders(mapped);
    };

    void fetchOrders();
  }, []);

  const handleViewReceipt = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsReceiptOpen(true);
  };

  const handleAddOrder = (newOrder: AdminOrder) => {
    setOrders((previous) => [newOrder, ...previous]);
    setIsAddOrderOpen(false);
  };

  return (
    <div className="orders-main-content">
      <div className="orders-header">
        <div className="orders-header-top">
          <div className="orders-header-icon">
            <FiBox />
          </div>
          <h2>ORDERS</h2>
        </div>

        <button
          onClick={() => setIsAddOrderOpen(true)}
          className="orders-add-btn"
        >
          + Add Order
        </button>
      </div>

      <OrdersListSection orders={orders} onViewReceipt={handleViewReceipt} />

      {isAddOrderOpen && (
        <AddOrderModal
          onClose={() => setIsAddOrderOpen(false)}
          onAdd={handleAddOrder}
        />
      )}

      {isReceiptOpen && selectedOrderId && (
        <ReceiptModal
          orderId={selectedOrderId}
          onClose={() => {
            setIsReceiptOpen(false);
            setSelectedOrderId(null);
          }}
        />
      )}
    </div>
  );
}
