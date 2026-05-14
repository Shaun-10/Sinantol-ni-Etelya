import { useEffect, useState } from "react";
import { FiCheck, FiPlus, FiTruck } from "react-icons/fi";
import { supabase } from "@lib/supabase";
import AddRiderModal from "./AddRiderModal";
import RiderDetailModal from "./RiderDetailModal";
import ReassignRiderModal from "./ReassignRiderModal";
import { Rider, RiderFormData, normalizeDbString } from "./riderModalShared";

interface Delivery {
  id: string;
  status: string;
  customer: string;
  createdAt: string;
  source: "orders" | "deliveries";
}

interface RidersListSectionProps {
  riders: Rider[];
  onViewDetails: (rider: Rider) => void;
}

interface DeliveriesDialogProps {
  rider: Rider;
  onClose: () => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return fallback;
}

function normalizeDeliveryStatus(status: unknown): string {
  const normalized = String(status ?? "")
    .replace(/_/g, " ")
    .trim();

  if (!normalized) return "Waiting";

  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function isPastDelivery(status: string): boolean {
  const normalized = status.toLowerCase();

  return (
    normalized.includes("deliver") ||
    normalized.includes("fail") ||
    normalized.includes("cancel")
  );
}

function formatDeliveryDate(value: string): string {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildRiderFilter(rider: Rider): string {
  if (!rider.id) return "";

  return `rider_id.eq.${rider.id}`;
}

function RidersListSection({
  riders,
  onViewDetails,
}: RidersListSectionProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.ceil(riders.length / 10);
  const paginatedRiders = riders.slice(
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
      <div className="riders-list-header">
        <h3>Riders List</h3>
      </div>

      <div className="riders-table-container">
        <table className="riders-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Area</th>
              <th>Plate Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRiders.map((rider) => (
              <tr key={rider.orderId}>
                <td>{rider.name}</td>
                <td>{rider.contact}</td>
                <td>{rider.area}</td>
                <td>{rider.plate_number}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      rider.isOnline
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {rider.isOnline ? "Online" : "Offline"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="riders-details-btn"
                    aria-label={`View details for ${rider.name}`}
                    onClick={() => onViewDetails(rider)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}

            {paginatedRiders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No riders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="riders-footer">
          <span className="text-sm text-gray-600 mr-4">
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

function DeliveriesDialog({
  rider,
  onClose,
}: DeliveriesDialogProps): JSX.Element {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const [deliveriesError, setDeliveriesError] = useState("");

  const orderFilter = buildRiderFilter(rider);
  const deliveriesFilter = buildRiderFilter(rider);

  // Live data subscriptions - simplified, client-side filter
  useEffect(() => {
    if (!orderFilter && !deliveriesFilter) return;

    let orderChannel: ReturnType<typeof supabase.channel> | null = null;
    if (orderFilter) {
      orderChannel = supabase
        .channel("rider_orders")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: orderFilter,
          },
          (payload: any) => {
            const newRow = payload.new;

            const newDelivery: Delivery = {
              id: String(newRow.id ?? ""),
              status: normalizeDeliveryStatus(newRow.status),
              customer:
                normalizeDbString(newRow.customer_name) || "No customer name",
              createdAt: String(newRow.created_at ?? ""),
              source: "orders",
            };

            setDeliveries((prev) => {
              const exists = prev.some((d) => d.id === newDelivery.id);
              if (exists) return prev;

              return [newDelivery, ...prev].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
            });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: orderFilter,
          },
          (payload: any) => {
            const updatedRow = payload.new;

            const updatedDelivery: Delivery = {
              id: String(updatedRow.id ?? ""),
              status: normalizeDeliveryStatus(updatedRow.status),
              customer:
                normalizeDbString(updatedRow.customer_name) ||
                "No customer name",
              createdAt: String(updatedRow.created_at ?? ""),
              source: "orders",
            };

            setDeliveries((prev) => {
              const idx = prev.findIndex((d) => d.id === updatedDelivery.id);
              if (idx === -1) return prev;

              const newList = [...prev];
              newList[idx] = updatedDelivery;

              return newList.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
            });
          },
        )
        .subscribe();
    }

    let deliveriesChannel: ReturnType<typeof supabase.channel> | null = null;
    if (deliveriesFilter) {
      deliveriesChannel = supabase
        .channel("rider_deliveries")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "deliveries",
            filter: deliveriesFilter,
          },
          (payload: any) => {
            const newRow = payload.new;

            const newDelivery: Delivery = {
              id: String(newRow.id ?? ""),
              status: normalizeDeliveryStatus(newRow.status),
              customer:
                normalizeDbString(newRow.customer_name) || "No customer name",
              createdAt: String(newRow.created_at ?? ""),
              source: "deliveries",
            };

            setDeliveries((prev) => {
              const exists = prev.some((d) => d.id === newDelivery.id);
              if (exists) return prev;

              return [newDelivery, ...prev].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
            });
          },
        )

        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "deliveries",
            filter: deliveriesFilter,
          },
          (payload: any) => {
            const updatedRow = payload.new;

            const updatedDelivery: Delivery = {
              id: String(updatedRow.id ?? ""),
              status: normalizeDeliveryStatus(updatedRow.status),
              customer:
                normalizeDbString(updatedRow.customer_name) ||
                "No customer name",
              createdAt: String(updatedRow.created_at ?? ""),
              source: "deliveries",
            };

            setDeliveries((prev) => {
              const idx = prev.findIndex((d) => d.id === updatedDelivery.id);
              if (idx === -1) return prev;

              const newList = [...prev];
              newList[idx] = updatedDelivery;

              return newList.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
            });
          },
        )

        .subscribe();
    }

    return () => {
      if (orderChannel) supabase.removeChannel(orderChannel);
      if (deliveriesChannel) supabase.removeChannel(deliveriesChannel);
    };
  }, [rider.id]);

  // Initial fetch on rider change
  useEffect(() => {
    const fetchDeliveries = async (): Promise<void> => {
      setIsLoadingDeliveries(true);
      setDeliveriesError("");
      setDeliveries([]); // Clear previous

      try {
        console.log(
          "Fetching deliveries for rider:",
          rider.id,
          "orderFilter:",
          orderFilter,
          "deliveriesFilter:",
          deliveriesFilter,
        ); // Debug

        const [ordersResult, deliveriesResult] = await Promise.all([
          orderFilter
            ? supabase
                .from("orders")
                .select("id, customer_name, status, created_at")
                .eq("rider_id", rider.id)
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
          deliveriesFilter
            ? supabase
                .from("deliveries")
                .select("id, customer_name, status, created_at")
                .eq("rider_id", rider.id)
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
        ]);

        console.log("Orders result:", ordersResult);
        console.log("Deliveries result:", deliveriesResult);

        if (ordersResult.error) throw ordersResult.error;
        // Don't throw deliveries error - the table might not exist or be restricted by RLS
        // We can still show orders even if deliveries table is unavailable
        if (deliveriesError) {
          console.warn(
            "Deliveries table error (will show orders only):",
            deliveriesError,
          );
        }

        const orderRows: Delivery[] = (ordersResult.data ?? []).map(
          (row: any) => ({
            id: String(row.id ?? ""),
            status: normalizeDeliveryStatus(row.status),
            customer:
              normalizeDbString(row.customer_name) || "No customer name",
            createdAt: String(row.created_at ?? ""),
            source: "orders",
          }),
        );

        const deliveryRows: Delivery[] = (deliveriesResult.data ?? []).map(
          (row: any) => ({
            id: String(row.id ?? ""),
            status: normalizeDeliveryStatus(row.status),
            customer:
              normalizeDbString(row.customer_name) || "No customer name",
            createdAt: String(row.created_at ?? ""),
            source: "deliveries",
          }),
        );

        const allDeliveries = [...deliveryRows, ...orderRows].sort((a, b) => {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return (
            (Number.isNaN(bDate) ? 0 : bDate) -
            (Number.isNaN(aDate) ? 0 : aDate)
          );
        });

        console.log("Setting deliveries:", allDeliveries);

        setDeliveries(allDeliveries);
      } catch (error) {
        console.error("Error fetching rider deliveries:", error);
        setDeliveriesError(
          getErrorMessage(error, "Failed to load rider deliveries."),
        );
      } finally {
        setIsLoadingDeliveries(false);
      }
    };

    void fetchDeliveries();
  }, [rider.id]);

  const presentDeliveries = deliveries.filter(
    (delivery) => !isPastDelivery(delivery.status),
  );
  const pastDeliveries = deliveries.filter((delivery) =>
    isPastDelivery(delivery.status),
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rider-deliveries-title"
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-11/12 max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <header className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3
            id="rider-deliveries-title"
            className="text-xl font-bold text-gray-900"
          >
            {rider.name || "Rider"} Deliveries
          </h3>
          <button
            type="button"
            className="text-2xl text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center"
            aria-label="Close rider deliveries"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoadingDeliveries && (
            <p className="text-sm text-gray-500">Loading deliveries...</p>
          )}

          {deliveriesError &&
          deliveriesError.includes(
            "Could not find the table",
          ) ? null : deliveriesError ? ( // Silently handle table not found error - it just means no deliveries data
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-semibold">
              {deliveriesError}
            </div>
          ) : null}

          <section className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">
              Present Deliveries
            </h4>
            {!isLoadingDeliveries && presentDeliveries.length === 0 && (
              <p className="text-sm text-gray-500">No present deliveries.</p>
            )}
            {presentDeliveries.map((delivery) => (
              <div
                key={`${delivery.source}-${delivery.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full"
                    aria-hidden="true"
                  >
                    <FiCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-gray-700">
                      Delivery #{delivery.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {delivery.customer}
                      {delivery.createdAt
                        ? ` - ${formatDeliveryDate(delivery.createdAt)}`
                        : ""}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 font-semibold">{delivery.status}</p>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">
              Past Deliveries
            </h4>
            {!isLoadingDeliveries && pastDeliveries.length === 0 && (
              <p className="text-sm text-gray-500">No past deliveries.</p>
            )}
            {pastDeliveries.map((delivery) => (
              <div
                key={`${delivery.source}-${delivery.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full"
                    aria-hidden="true"
                  >
                    <FiCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-gray-700">
                      Delivery #{delivery.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {delivery.customer}
                      {delivery.createdAt
                        ? ` - ${formatDeliveryDate(delivery.createdAt)}`
                        : ""}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 font-semibold">{delivery.status}</p>
              </div>
            ))}
          </section>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
            className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RidersPage(): JSX.Element {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [deliveriesRider, setDeliveriesRider] = useState<Rider | null>(null);
  const [isDeliveriesModalOpen, setIsDeliveriesModalOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const btnBase =
    "px-4 py-2 rounded-lg font-semibold text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 active:scale-95`;

  const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700 active:scale-95`;

  const btnNeutral = `${btnBase} bg-gray-200 text-gray-900 hover:bg-gray-300 active:scale-95`;

  const btnSuccess = `${btnBase} bg-green-600 text-white hover:bg-green-700 active:scale-95`;

  const fetchRiders = async (): Promise<void> => {
    setLoading(true);

    const { data, error } = await supabase
      .from("riders")
      .select(
        `
      id,
      user_id,
      name,
      contact,
      address,
      area,
      plate_number,
      email,
      orders (
        id,
        status
      )
    `,
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching riders:", error);
      setLoading(false);
      return;
    }

    const transformed: Rider[] = (data ?? []).map(
      (rider: any, index: number) => {
        const activeOrders =
          rider.orders?.filter((o: any) => o.status === "waiting") ?? [];

        return {
          orderId: index + 1,
          id: rider.id,
          userid: rider.user_id,

          name: normalizeDbString(rider.name),
          address: normalizeDbString(rider.address),

          contact: normalizeDbString(rider.contact),
          area: normalizeDbString(rider.area),
          plate_number: normalizeDbString(rider.plate_number),
          email: normalizeDbString(rider.email),

          isOnline: activeOrders.length > 0,
        };
      },
    );

    setRiders(transformed);
    setLoading(false);
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleViewDetails = (rider: Rider): void => {
    setSelectedRider(rider);
  };

  const handleOpenDeliveries = (): void => {
    if (!selectedRider) {
      console.error("No selected rider to open deliveries");
      return;
    }

    console.log(
      "Opening deliveries for rider:",
      selectedRider.id,
      selectedRider.name,
    );
    setDeliveriesRider(selectedRider);
    setSelectedRider(null);
    setIsDeliveriesModalOpen(true);
  };

  const handleDeleteRider = async (riderToDelete: Rider): Promise<void> => {
    try {
      const { error } = await supabase
        .from("riders")
        .delete()
        .eq("id", riderToDelete.id);

      if (error) {
        console.error("Error deleting rider from Supabase:", error);
        setStatusDialog({
          title: "Error",
          message: "Failed to delete rider from database.",
        });

        return;
      }

      setRiders((prev) =>
        prev.filter((rider) => rider.id !== riderToDelete.id),
      );

      if (selectedRider?.id === riderToDelete.id) {
        setSelectedRider(null);
        setIsDeliveriesModalOpen(false);
        setDeliveriesRider(null);
      }
    } catch (err) {
      console.error("Supabase error:", err);
      setStatusDialog({
        title: "Error",
        message: "Unexpected error while deleting rider.",
      });
    }
  };

  const handleAddRider = async (formValues: RiderFormData): Promise<void> => {
    setConfirmDialog({
      title: "Add Rider",
      message: "Are you sure you want to add this rider?",
      onConfirm: async () => {
        setConfirmDialog(null);

        try {
          const {
            data: { session: adminSession },
          } = await supabase.auth.getSession();

          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email: formValues.email.trim(),
              password: formValues.password,
            });

          if (authError) {
            setStatusDialog({
              title: "Error",
              message: authError.message,
            });
            return;
          }

          if (!authData?.user?.id) {
            setStatusDialog({
              title: "Error",
              message: "Auth user was not created.",
            });
            return;
          }

          const userId = authData.user.id;

          if (adminSession) {
            await supabase.auth.setSession({
              access_token: adminSession.access_token,
              refresh_token: adminSession.refresh_token,
            });
          }

          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: userId,
              email: formValues.email.trim(),
              role: "rider",
            });

          if (profileError) {
            setStatusDialog({
              title: "Error",
              message: `Failed to create rider profile: ${profileError.message}`,
            });
            return;
          }

          const { data, error: riderError } = await supabase
            .from("riders")
            .insert({
              user_id: userId,
              name: formValues.name.trim(),
              contact: formValues.contact.trim() || null,
              address: formValues.address.trim() || null,
              area: formValues.area.trim() || null,
              plate_number: formValues.plate_number.trim() || null,
              email: formValues.email.trim() || null,
            })
            .select()
            .single();

          if (riderError || !data) {
            setStatusDialog({
              title: "Error",
              message: `Failed to save rider: ${getErrorMessage(
                riderError,
                "Unknown error",
              )}`,
            });
            return;
          }

          setRiders((prev) => [
            ...prev,
            {
              orderId: prev.length + 1,
              id: data.id,
              userid: userId,
              name: normalizeDbString(data.name),
              address:
                normalizeDbString(data.address) ??
                normalizeDbString(formValues.address),
              contact: normalizeDbString(data.contact),
              area:
                normalizeDbString(data.area) ??
                normalizeDbString(formValues.area),
              plate_number:
                normalizeDbString(data.plate_number) ??
                normalizeDbString(formValues.plate_number),
              email:
                normalizeDbString(data.email) ??
                normalizeDbString(formValues.email),
              isOnline: false,
            },
          ]);

          setIsAddModalOpen(false);

          // ✅ SUCCESS DIALOG (replaces window.confirm)
          setStatusDialog({
            title: "Success",
            message: `Rider account created successfully.\n\nEmail: ${formValues.email}`,
          });
        } catch (err) {
          console.error(err);
          setStatusDialog({
            title: "Error",
            message: "Unexpected error while adding rider.",
          });
        }
      },
    });
  };

  const handleReassignRider = (): void => {
    setIsReassignModalOpen(true);
  };

  const handleReassigned = async (): Promise<void> => {
    await fetchRiders();
  };

  const handleSaveRider = async (updatedRider: Rider): Promise<void> => {
    try {
      const { error } = await supabase
        .from("riders")
        .update({
          name: updatedRider.name.trim(),
          address: updatedRider.address.trim() || null,
          area: updatedRider.area.trim() || null,
          contact: updatedRider.contact.trim() || null,
          plate_number: updatedRider.plate_number.trim() || null,
          email: updatedRider.email.trim() || null,
        })
        .eq("id", updatedRider.id);

      if (error) {
        console.error("Error updating rider in Supabase:", error);
        setStatusDialog({
          title: "Error",
          message: "Failed to save rider changes.",
        });
        return;
      }

      setRiders((prev) =>
        prev.map((rider) =>
          rider.id === updatedRider.id ? updatedRider : rider,
        ),
      );
      setSelectedRider(updatedRider);
      setStatusDialog({
        title: "Success",
        message: "Rider details saved successfully.",
      });
    } catch (err) {
      console.error("Supabase error:", err);
      setStatusDialog({
        title: "Error",
        message: "Unexpected error while saving rider.",
      });
    }
  };

  const activeRiders = riders.filter((rider) => rider.isOnline).length;

  return (
    <div className="riders-main-content">
      <section className="riders-header sticky top-0 z-30">
        <div className="riders-header-top">
          <h2>
            <FiTruck aria-hidden="true" />
            RIDERS
          </h2>
        </div>

        <div className="riders-header-bottom">
          <article
            className="riders-summary-card"
            aria-label="Active and total riders summary"
          >
            <div className="riders-summary-icon" aria-hidden="true">
              <FiTruck />
            </div>
            <div>
              <p className="riders-summary-value">
                {activeRiders}/{riders.length}
              </p>
              <p className="riders-summary-label">Active Total Riders</p>
            </div>
          </article>

          <div className="riders-header-actions">
            <button
              type="button"
              className={btnNeutral}
              onClick={handleReassignRider}
            >
              Reassign Area
            </button>

            <button
              type="button"
              className={`${btnSuccess} flex items-center gap-2`}
              onClick={() => setIsAddModalOpen(true)}
            >
              <FiPlus />
              Add Rider
            </button>
          </div>
        </div>
      </section>

      <RidersListSection riders={riders} onViewDetails={handleViewDetails} />

      {isAddModalOpen && (
        <AddRiderModal
          onClose={() => setIsAddModalOpen(false)}
          onAddRider={handleAddRider}
        />
      )}

      {isReassignModalOpen && (
        <ReassignRiderModal
          riders={riders}
          onClose={() => setIsReassignModalOpen(false)}
          onReassigned={handleReassigned}
        />
      )}

      {selectedRider && (
        <RiderDetailModal
          rider={selectedRider}
          onClose={() => setSelectedRider(null)}
          onOpenDeliveries={handleOpenDeliveries}
          onSaveRider={handleSaveRider}
          onDeleteRider={handleDeleteRider}
        />
      )}

      {isDeliveriesModalOpen && deliveriesRider && (
        <DeliveriesDialog
          rider={deliveriesRider}
          onClose={() => {
            setIsDeliveriesModalOpen(false);
            setDeliveriesRider(null);
          }}
        />
      )}

      {isDeliveriesModalOpen && !deliveriesRider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6">
            <p className="text-red-600 font-semibold">
              Error: No rider data available for deliveries
            </p>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-[92%] max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {confirmDialog.message}
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                className={btnNeutral}
                onClick={() => setConfirmDialog(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={btnPrimary}
                onClick={confirmDialog.onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {statusDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-[92%] max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {statusDialog.title}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {statusDialog.message}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className={btnPrimary}
                onClick={() => setStatusDialog(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
