import { useEffect, useState } from "react";
import { FiBox } from "react-icons/fi";
import { supabase } from "@lib/supabase";

import ReceiptModal from "./ReceiptModal";
import AddOrderModal from "./AddOrderModal";
import type { AdminOrder, OrderStatus } from "./orderTypes";

function StatusBadge({ status }: { status: OrderStatus }): JSX.Element {
  const badgeClassMap = {
    waiting: "orders-status-badge waiting",
    delivered: "orders-status-badge delivered",
    cancelled: "orders-status-badge cancelled",
  };

  return (
    <span className={badgeClassMap[status]}>
      {status.toUpperCase()}
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
  const paginatedOrders = orders.slice((currentPage - 1) * 10, currentPage * 10);

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
    <section className="orders-list-section">
      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>

          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>PHP {order.total.toFixed(2)}</td>
                <td>{order.date}</td>

                <td>
                  <StatusBadge status={order.status} />
                </td>

                <td>
                  <button
                    onClick={() => onViewReceipt(order.id)}
                    className="orders-receipt-btn"
                  >
                    View Receipt
                  </button>
                </td>
              </tr>
            ))}

            {paginatedOrders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#5f6b5f" }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="orders-footer">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {currentPage > 1 && (
              <button
                type="button"
                onClick={handlePreviousPage}
                className="orders-prev-btn"
              >
                Previous
              </button>
            )}
            {currentPage < totalPages && (
              <button
                type="button"
                onClick={handleNextPage}
                className="orders-next-btn"
              >
                Next Page
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
        .order("order_date", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      const mapped: AdminOrder[] = (data ?? []).map((order) => ({
        id: order.id,
        customer: order.customer_name ?? "N/A",
        total: order.total ?? 0,
        date: new Date(order.order_date).toLocaleDateString(),
        dateRange: "Today",
        status: normalizeStatus(order.status),
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiBox style={{ fontSize: "1.5rem", color: "#273221" }} />
            <h2>ORDERS</h2>
          </div>

          <button
            onClick={() => setIsAddOrderOpen(true)}
            className="orders-add-btn"
          >
            + Add Order
          </button>
        </div>
      </div>

      <OrdersListSection orders={orders} onViewReceipt={handleViewReceipt} />

      {isAddOrderOpen && (
        <AddOrderModal onClose={() => setIsAddOrderOpen(false)} onAdd={handleAddOrder} />
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
