import { useEffect, useState } from "react";
import { FiBox } from "react-icons/fi";
import { supabase } from "@lib/supabase";

import ReceiptModal from "./ReceiptModal";
import AddOrderModal from "./AddOrderModal";
import EditOrderModal from "./EditOrderModal";
import type { AdminOrder, OrderStatus } from "./orderTypes";

function StatusBadge({ status }: { status: OrderStatus }): JSX.Element {
  const styles = {
    waiting: "status-badge status-waiting",
    delivered: "status-badge status-delivered",
    cancelled: "status-badge status-cancelled",
  };

  return <span className={styles[status]}>{status.toUpperCase()}</span>;
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
  onEdit,
}: {
  orders: AdminOrder[];
  onViewReceipt: (orderId: string) => void;
  onEdit: (orderId: string) => void;
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
            <th className="px-4 py-2">Actions</th>
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

              <td className="px-4 py-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(order.id)}
                    className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onViewReceipt(order.id)}
                    className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                  >
                    View
                  </button>
                </div>
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
          <div className="flex gap-2">
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
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
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

  const handleEditOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsEditOrderOpen(true);
  };

  const handleAddOrder = (newOrder: AdminOrder) => {
    setOrders((previous) => [newOrder, ...previous]);
    setIsAddOrderOpen(false);
  };

  const handleUpdateOrder = (updatedOrder: AdminOrder) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      ),
    );
    setIsEditOrderOpen(false);
    setSelectedOrderId(null);
  };

  return (
    <div className="orders-main-content">
      <div className="flex items-center justify-between mb-6">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          <div className="text-gray-600 text-2xl">
            <FiBox />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        </div>

        {/* RIGHT SIDE */}
        <button
          onClick={() => setIsAddOrderOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          + Add Order
        </button>
      </div>

      <OrdersListSection
        orders={orders}
        onViewReceipt={handleViewReceipt}
        onEdit={handleEditOrder}
      />
      {isAddOrderOpen && (
        <AddOrderModal
          onClose={() => setIsAddOrderOpen(false)}
          onAdd={handleAddOrder}
        />
      )}
      {isEditOrderOpen && selectedOrderId && (
        <EditOrderModal
          orderId={selectedOrderId}
          onClose={() => {
            setIsEditOrderOpen(false);
            setSelectedOrderId(null);
          }}
          onUpdate={handleUpdateOrder}
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
