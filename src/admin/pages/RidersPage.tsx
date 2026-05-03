import { useEffect, useState } from "react";
import { FiCheck, FiPlus, FiTruck } from "react-icons/fi";
import { supabase } from "@lib/supabase";
import AddRiderModal from "./AddRiderModal";
import RiderDetailModal from "./RiderDetailModal";
import { Rider, RiderFormData, toDateInputValue } from "./riderModalShared";

interface Delivery {
  id: string;
  status: string;
}

interface RidersListSectionProps {
  riders: Rider[];
  onViewDetails: (rider: Rider) => void;
}

interface DeliveriesDialogProps {
  onClose: () => void;
  presentDeliveries: Delivery[];
  pastDeliveries: Delivery[];
}

// delivery lists will be populated from the `orders` table when the dialog opens
// presentDeliveries = active (not delivered) deliveries
// pastDeliveries = delivered deliveries

function RidersListSection({
  riders,
  onViewDetails,
}: RidersListSectionProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.ceil(riders.length / 10);
  const paginatedRiders = riders.slice((currentPage - 1) * 10, currentPage * 10);

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
                <td>{rider.location}</td>
                <td>{rider.plateNo}</td>
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
                    i
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

function DeliveriesDialog({ onClose, presentDeliveries, pastDeliveries }: DeliveriesDialogProps): JSX.Element {
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
            Rider Deliveries
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
          <section className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">
              Present Deliveries
            </h4>
            {presentDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full"
                    aria-hidden="true"
                  >
                    <FiCheck className="w-4 h-4" />
                  </span>
                  <p className="text-gray-700">Delivery #{delivery.id}</p>
                </div>
                <p className="text-gray-700 font-semibold">{delivery.status}</p>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">
              Past Deliveries
            </h4>
            {pastDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full"
                    aria-hidden="true"
                  >
                    <FiCheck className="w-4 h-4" />
                  </span>
                  <p className="text-gray-700">Delivery #{delivery.id}</p>
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
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isDeliveriesModalOpen, setIsDeliveriesModalOpen] = useState(false);
  const [presentDeliveries, setPresentDeliveries] = useState<Delivery[]>([]);
  const [pastDeliveries, setPastDeliveries] = useState<Delivery[]>([]);

  
useEffect(() => {
  const fetchRiders = async (): Promise<void> => {
    setLoading(true);

    try {
      // 1️⃣ Fetch riders
      const { data: ridersData, error: ridersError } = await supabase
        .from("riders")
        .select("*")
        .order("id", { ascending: true });
        
console.log("RIDERS DATA:", ridersData);
console.log("RIDERS ERROR:", ridersError);


      if (ridersError) {
        console.error("Error fetching riders:", ridersError);
        return;
      }

      // 2️⃣ Fetch ACTIVE orders
      const { data: activeOrders, error: ordersError } = await supabase
  .from("orders")
  .select("rider_id")
  .eq("status", "waiting")
  .not("rider_id", "is", null)


      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return;
      }

      // 3️⃣ Create lookup
      const activeRiderIds = new Set(
        (activeOrders || []).map(order => order.rider_id)
      );

      // 4️⃣ Transform riders
      const transformedRiders: Rider[] = (ridersData || []).map(
        (rider, index) => ({
          orderId: index + 1,
          id: rider.id,
          userid: rider.user_id,
          name: `${rider.first_name} ${rider.last_name}`.trim(),
          firstName: rider.first_name,
          lastName: rider.last_name,
          middleInitial: rider.middle_initial,
          address: rider.address,
          location: rider.area ?? rider.location ?? "N/A",
          contact: rider.contact,
          birthdate: rider.birthdate,
          plateNo: rider.plate_number,
          email: rider.email,
          emergencyName: rider.emergency_name,
          emergencyContact: rider.emergency_contact,

          // ✅ ONLINE / OFFLINE STATUS
          isOnline: activeRiderIds.has(rider.id),
        })
      );

      setRiders(transformedRiders);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchRiders();
}, []);


  const handleViewDetails = (rider: Rider): void => {
    setSelectedRider(rider);
  };

  const handleOpenDeliveries = (): void => {
    setSelectedRider(null);
    setIsDeliveriesModalOpen(true);
  };

  // fetch deliveries from orders table when the deliveries modal opens
  useEffect(() => {
    if (!isDeliveriesModalOpen) return;

    const fetchDeliveries = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id,status")
          .order("order_date", { ascending: false });

        if (error) {
          console.error("Error fetching deliveries/orders:", error);
          setPresentDeliveries([]);
          setPastDeliveries([]);
          return;
        }

        const rows = Array.isArray(data) ? data : [];

        const present: Delivery[] = [];
        const past: Delivery[] = [];

        rows.forEach((row: any) => {
          const id = String(row.id ?? "");
          const statusRaw = String(row.status ?? "").toLowerCase();
          const displayStatus = statusRaw === "delivered" ? "Delivered" : "In Progress";

          const item: Delivery = { id, status: displayStatus };

          if (statusRaw === "delivered") {
            past.push(item);
          } else {
            present.push(item);
          }
        });

        setPresentDeliveries(present);
        setPastDeliveries(past);
      } catch (err) {
        console.error("Unexpected error fetching deliveries:", err);
        setPresentDeliveries([]);
        setPastDeliveries([]);
      }
    };

    void fetchDeliveries();
  }, [isDeliveriesModalOpen]);

  const handleDeleteRider = async (riderToDelete: Rider): Promise<void> => {
    try {
      const { error } = await supabase
        .from("riders")
        .delete()
        .eq("id", riderToDelete.id);

      if (error) {
        console.error("Error deleting rider from Supabase:", error);
        alert("Failed to delete rider from database.");
        return;
      }

      setRiders((prev) =>
        prev.filter((rider) => rider.id !== riderToDelete.id),
      );

      if (selectedRider?.id === riderToDelete.id) {
        setSelectedRider(null);
        setIsDeliveriesModalOpen(false);
      }
    } catch (err) {
      console.error("Supabase error:", err);
      alert("Unexpected error while deleting rider.");
    }
  };

  const handleAddRider = async (formValues: RiderFormData): Promise<void> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formValues.email.trim(),
        password: formValues.password,
      });

      if (authError) {
        alert(authError.message);
        return;
      }

      if (!authData?.user?.id) {
        alert("Auth user was not created.");
        return;
      }

      const userId = authData.user.id;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        email: formValues.email.trim(),
        role: "rider",
      });

      if (profileError) {
        console.error("Profile error:", profileError);
        alert("Failed to create rider profile.");
        return;
      }

      const { data, error: riderError } = await supabase
        .from("riders")
        .insert({
          user_id: userId,
          first_name: formValues.firstName.trim(),
          last_name: formValues.lastName.trim(),
          middle_initial: formValues.middleInitial.trim(),
          address: formValues.address.trim() || "N/A",
          area: formValues.location.trim() || "N/A",
          contact: formValues.contact.trim() || "N/A",
          birthdate: formValues.birthdate || null,
          plate_number: formValues.plateNo.trim() || "N/A",
          email: formValues.email.trim(),
          emergency_name: formValues.emergencyName.trim() || "N/A",
          emergency_contact: formValues.emergencyContact.trim() || "N/A",
        })
        .select()
        .single();

      if (riderError || !data) {
        console.error("Rider insert failed:", riderError);
        alert("Failed to save rider to database.");
        return;
      }

      setRiders((prev) => [
        ...prev,
        {
          orderId: prev.length + 1,
          id: data.id,
          userid: userId,
          name: `${data.first_name} ${data.last_name}`.trim(),
          firstName: data.first_name,
          lastName: data.last_name,
          middleInitial: data.middle_initial,
          address: data.address,
          location: data.area ?? data.location ?? "N/A",
          contact: data.contact,
          birthdate: data.birthdate,
          plateNo: data.plate_number,
          email: data.email,
          emergencyName: data.emergency_name,
          emergencyContact: data.emergency_contact,
          isOnline: false,
        },
      ]);

      setIsAddModalOpen(false);

      alert(`Rider account created successfully.\n\nEmail: ${data.email}`);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Unexpected error while adding rider.");
    }
  };

  const handleSaveRider = async (updatedRider: Rider): Promise<void> => {
    try {
      const { error } = await supabase
        .from("riders")
        .update({
          first_name: updatedRider.firstName.trim(),
          last_name: updatedRider.lastName.trim(),
          middle_initial: updatedRider.middleInitial.trim(),
          address: updatedRider.address.trim() || "N/A",
          area: updatedRider.location.trim() || "N/A",
          contact: updatedRider.contact.trim() || "N/A",
          birthdate: updatedRider.birthdate
            ? toDateInputValue(updatedRider.birthdate)
            : null,
          plate_number: updatedRider.plateNo.trim() || "N/A",
          email: updatedRider.email.trim(),
          emergency_name: updatedRider.emergencyName.trim() || "N/A",
          emergency_contact: updatedRider.emergencyContact.trim() || "N/A",
        })
        .eq("id", updatedRider.id);

      if (error) {
        console.error("Error updating rider in Supabase:", error);
        alert("Failed to save rider changes.");
        return;
      }

      setRiders((prev) =>
        prev.map((rider) =>
          rider.id === updatedRider.id ? updatedRider : rider,
        ),
      );
      setSelectedRider(updatedRider);

      window.alert("Rider details saved successfully.");
    } catch (err) {
      console.error("Supabase error:", err);
      alert("Unexpected error while saving rider.");
    }
  };

  const activeRiders = riders.length;

  return (
    <div className="riders-main-content">
      <section className="riders-header">
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
              <p className="riders-summary-label">Total Riders</p>
            </div>
          </article>

          <button
            type="button"
            className="add-rider-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            <FiPlus />
            Add Rider
          </button>
        </div>
      </section>

      <RidersListSection riders={riders} onViewDetails={handleViewDetails} />

      {isAddModalOpen && (
        <AddRiderModal
          onClose={() => setIsAddModalOpen(false)}
          onAddRider={handleAddRider}
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

      {isDeliveriesModalOpen && (
        <DeliveriesDialog
          onClose={() => setIsDeliveriesModalOpen(false)}
          presentDeliveries={presentDeliveries}
          pastDeliveries={pastDeliveries}
        />
      )}
    </div>
  );
}
