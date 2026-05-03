import { useEffect, useState } from "react";
import { FiBox } from "react-icons/fi";
import { supabase } from "@lib/supabase";

import ReceiptModal from "./ReceiptModal";
import AddOrderModal from "./AddOrderModal";
import type { AdminOrder, OrderStatus } from "./orderTypes";

function StatusBadge({ status }: { status: OrderStatus }): JSX.Element {
  const styles = {
    waiting: "bg-yellow-100 text-yellow-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
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
    <section className="overflow-hidden rounded-lg border bg-yellow-50">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-100 text-left text-sm">
            <th className="px-4 py-2">Order ID</th>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Receipt</th>
          </tr>
        </thead>

        <tbody>
          {paginatedOrders.map((order) => (
            <tr key={order.id} className="border-b text-sm hover:bg-gray-50">
              <td className="px-4 py-2 font-semibold">{order.id}</td>
              <td className="px-4 py-2">{order.customer}</td>
              <td className="px-4 py-2">PHP {order.total.toFixed(2)}</td>
              <td className="px-4 py-2">{order.date}</td>

              <td className="px-4 py-2">
                <StatusBadge status={order.status} />
              </td>

              <td className="px-4 py-2">
                <button
                  onClick={() => onViewReceipt(order.id)}
                  className="rounded-full border border-orange-400 px-3 py-1 text-xs text-orange-600 hover:bg-orange-50"
                >
                  View Receipt
                </button>
              </td>
            </tr>
          ))}

          {paginatedOrders.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-white">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <button
                type="button"
                onClick={handlePreviousPage}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition"
              >
                Previous
              </button>
            )}
            {currentPage < totalPages && (
              <button
                type="button"
                onClick={handleNextPage}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
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
    <div className="space-y-6 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <FiBox className="text-2xl text-gray-700" />
            <h1 className="text-3xl font-bold">ORDERS</h1>
          </div>
        </div>

        <button
          onClick={() => setIsAddOrderOpen(true)}
          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          + Add Order
        </button>
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
