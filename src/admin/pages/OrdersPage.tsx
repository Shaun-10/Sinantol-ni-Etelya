import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { FiBox, FiSearch } from "react-icons/fi";
import { supabase } from "@lib/supabase";

import ReceiptModal from "./ReceiptModal";
import AddOrderModal from "./AddOrderModal";
import EditOrderModal from "./EditOrderModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  onDelete,
}: {
  orders: AdminOrder[];
  onViewReceipt: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onDelete: (orderId: string) => void;
}): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.ceil(orders.length / 10);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * 10,
    currentPage * 10,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [orders]);

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
                    Receipt
                  </button>

                  <button
                    onClick={() => onDelete(order.id)}
                    className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    Delete
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        createdAt: order.created_at,
        dateRange: "Today",
        status: normalizeStatus(order.status),
        paymentStatus: order.payment_status ?? "unpaid",
        paymentMethod: order.payment_method ?? "cod",
      }));

      setOrders(mapped);
    };

    void fetchOrders();
  }, []);

  const newestOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (
        (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
      );
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return newestOrders;
    }

    return newestOrders.filter((order) => {
      const searchableText = [
        order.id,
        order.customer,
        order.date,
        order.total.toFixed(2),
        order.status,
        order.paymentStatus,
        order.paymentMethod,
        order.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearchTerm);
    });
  }, [newestOrders, searchTerm]);

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
        order.id === updatedOrder.id
          ? {
              ...order,
              ...updatedOrder,
              date: order.date,
              dateRange: order.dateRange,
              createdAt: order.createdAt,
            }
          : order,
      ),
    );
    setIsEditOrderOpen(false);
    setSelectedOrderId(null);
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderToDelete);

      if (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order");
      } else {
        setOrders((previous) =>
          previous.filter((order) => order.id !== orderToDelete),
        );
        setIsDeleteDialogOpen(false);
        setOrderToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="orders-main-content">
      <div className="sticky top-0 z-30 bg-white">
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
      </div>

      <section className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label htmlFor="orders-search" className="flex-1">
            <span className="mb-1 block text-sm font-semibold text-gray-700">
              Search orders
            </span>
            <div className="relative">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="orders-search"
                type="search"
                value={searchTerm}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by customer, order ID, date, payment, or status"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>
          </label>

          <div className="text-sm font-semibold text-gray-600">
            {filteredOrders.length} of {orders.length} orders
            <span className="block text-xs font-medium text-gray-500"></span>
          </div>
        </div>
      </section>

      <OrdersListSection
        orders={filteredOrders}
        onViewReceipt={handleViewReceipt}
        onEdit={handleEditOrder}
        onDelete={handleDeleteClick}
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

      <Dialog open={isDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this order? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <button
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setOrderToDelete(null);
              }}
              disabled={isDeleting}
              className="px-4 py-2 rounded bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
