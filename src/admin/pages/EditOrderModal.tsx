import { FormEvent, useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "@lib/supabase";
import type { AdminOrder } from "./orderTypes";

interface Rider {
  id: string;
  name: string;
  area: string;
}

interface ProductVariant {
  id: string;
  flavor: string;
  size: string;
  price: number;
}

interface EditOrderModalProps {
  orderId: string;
  onClose: () => void;
  onUpdate: (order: AdminOrder) => void;
}

type SizeKey = "small" | "large" | "bottled";
type QuantityState = Record<SizeKey, number>;

const PRICES: Record<SizeKey, number> = {
  small: 110,
  large: 150,
  bottled: 170,
};

const inputStyle =
  "w-full bg-gray-100 border border-green-400 rounded-md px-4 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-green-500";

const btnPrimary =
  "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50";
const btnOutline =
  "px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50";

interface QuantityRowProps {
  key?: React.Key;
  label: string;
  price: number;
  value: number;
  onChange: (value: number) => void;
}

function QuantityRow({ label, price, value, onChange }: QuantityRowProps) {
  return (
    <div className="mt-2 flex items-center justify-between rounded-md bg-white px-2 py-1 shadow-sm">
      <span className="text-xs text-gray-700">
        {label} - PHP {price}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-sm hover:bg-gray-100"
          aria-label={`Decrease ${label}`}
          title={`Decrease ${label} quantity`}
        >
          -
        </button>

        <input
          type="number"
          min={0}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(Math.max(0, Number(event.target.value) || 0))
          }
          className="h-6 w-12 rounded border border-gray-300 text-center text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="0"
          aria-label={`${label} quantity`}
          title={`${label} quantity`}
        />

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-sm hover:bg-gray-100"
          aria-label={`Increase ${label}`}
          title={`Increase ${label} quantity`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function formatCustomerName(
  firstName: string,
  lastName: string,
  middleInitial: string,
): string {
  return [firstName.trim(), middleInitial.trim(), lastName.trim()]
    .filter(Boolean)
    .join(" ");
}

function parseCustomerName(fullName: string): {
  firstName: string;
  lastName: string;
  middleInitial: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: "", lastName: "", middleInitial: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "", middleInitial: "" };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1], middleInitial: "" };
  }
  return {
    firstName: parts[0],
    middleInitial: parts[1],
    lastName: parts.slice(2).join(" "),
  };
}

function getVariantKey(flavor: string, size: string): string {
  return `${flavor.trim().toLowerCase()}::${size.trim().toLowerCase()}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return fallback;
}

export default function EditOrderModal({
  orderId,
  onClose,
  onUpdate,
}: EditOrderModalProps): JSX.Element {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [classic, setClassic] = useState<QuantityState>({
    small: 0,
    large: 0,
    bottled: 0,
  });
  const [spicy, setSpicy] = useState<QuantityState>({
    small: 0,
    large: 0,
    bottled: 0,
  });
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [loadingRiders, setLoadingRiders] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [area, setArea] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid">(
    "unpaid",
  );
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [status, setStatus] = useState<"waiting" | "delivered" | "cancelled">(
    "waiting",
  );
  const [customerName, setCustomerName] = useState("");

  const itemTotal =
    classic.small * PRICES.small +
    classic.large * PRICES.large +
    classic.bottled * PRICES.bottled +
    spicy.small * PRICES.small +
    spicy.large * PRICES.large +
    spicy.bottled * PRICES.bottled;

  const totalQuantity =
    classic.small +
    classic.large +
    classic.bottled +
    spicy.small +
    spicy.large +
    spicy.bottled;

  const total = itemTotal + deliveryFee;

  // Fetch order details and riders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch riders
        const { data: ridersData, error: ridersError } = await supabase
          .from("riders")
          .select("id, name, area")
          .order("name", { ascending: true });

        if (ridersError) {
          console.error("Error fetching riders:", ridersError);
        } else {
          setRiders(
            (ridersData ?? []).map((rider) => ({
              id: rider.id,
              name: rider.name ?? "",
              area: rider.area ?? "",
            })),
          );
        }

        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError || !orderData) {
          console.error("Error fetching order:", orderError);
          alert("Failed to load order details");
          onClose();
          return;
        }

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*, product_variants:product_variant_id(*)")
          .eq("order_id", orderId);

        if (itemsError) {
          console.error("Error fetching order items:", itemsError);
        }

        // Parse customer name
        const {
          firstName: fn,
          lastName: ln,
          middleInitial: mi,
        } = parseCustomerName(orderData.customer_name || "");

        setFirstName(fn);
        setLastName(ln);
        setMiddleInitial(mi);
        setCustomerName(orderData.customer_name || "");
        setAddress(orderData.address || "");
        setContact(orderData.contact || "");
        setNote(orderData.note || "");
        setSelectedRiderId(orderData.rider_id || "");
        setPaymentStatus(orderData.payment_status || "unpaid");
        setPaymentMethod(orderData.payment_method || "cod");
        setDeliveryFee(orderData.delivery_fee || 0);
        setStatus(orderData.status || "waiting");

        // Set area if rider is selected
        if (orderData.rider_id) {
          const selected = (ridersData ?? []).find(
            (r) => r.id === orderData.rider_id,
          );
          setArea(selected?.area ?? "");
        }

        // Process order items to populate quantities
        if (itemsData && itemsData.length > 0) {
          const classicQuantities = { small: 0, large: 0, bottled: 0 };
          const spicyQuantities = { small: 0, large: 0, bottled: 0 };

          for (const item of itemsData) {
            const variant = item.product_variants;
            if (!variant) continue;

            const flavor = variant.flavor?.toLowerCase() || "";
            const size = variant.size?.toLowerCase() || "";

            if (flavor === "classic") {
              if (size === "small") classicQuantities.small = item.quantity;
              else if (size === "large")
                classicQuantities.large = item.quantity;
              else if (size === "bottled")
                classicQuantities.bottled = item.quantity;
            } else if (flavor === "spicy") {
              if (size === "small") spicyQuantities.small = item.quantity;
              else if (size === "large") spicyQuantities.large = item.quantity;
              else if (size === "bottled")
                spicyQuantities.bottled = item.quantity;
            }
          }

          setClassic(classicQuantities);
          setSpicy(spicyQuantities);
        }
      } finally {
        setIsLoading(false);
        setLoadingRiders(false);
      }
    };

    void fetchData();
  }, [orderId, onClose]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formattedCustomerName = formatCustomerName(
      firstName,
      lastName,
      middleInitial,
    );
    const hasItems = itemTotal > 0;

    if (!formattedCustomerName || !address.trim() || !contact.trim()) {
      alert("Please complete the customer details.");
      return;
    }

    if (!selectedRiderId) {
      alert("Please select a rider.");
      return;
    }

    if (!hasItems) {
      alert("Please add at least one item to the order.");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to save these changes to this order?",
    );

    if (!isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Fetch product variants
      const { data: variants, error: variantsError } = await supabase
        .from("product_variants")
        .select("id, flavor, size, price");

      if (variantsError || !variants) {
        alert("Failed to load product variants.");
        setIsSubmitting(false);
        return;
      }

      const variantsByKey = new Map(
        (variants as ProductVariant[]).map((variant) => [
          getVariantKey(variant.flavor, variant.size),
          variant,
        ]),
      );

      // Prepare order items
      const orderItemRows: Array<{
        product_variant_id: string;
        quantity: number;
        subtotal: number;
      }> = [];

      const orderItems = [
        { flavor: "classic", sizes: classic },
        { flavor: "spicy", sizes: spicy },
      ] satisfies Array<{ flavor: string; sizes: QuantityState }>;

      for (const item of orderItems) {
        for (const [size, quantity] of Object.entries(item.sizes) as Array<
          [SizeKey, number]
        >) {
          if (quantity <= 0) continue;

          const variant = variantsByKey.get(getVariantKey(item.flavor, size));

          if (!variant) {
            alert(`Missing product variant for ${item.flavor} ${size}.`);
            return;
          }

          orderItemRows.push({
            product_variant_id: variant.id,
            quantity,
            subtotal: variant.price * quantity,
          });
        }
      }

      // Update order
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          customer_name: formattedCustomerName,
          address: address.trim(),
          contact: contact.trim(),
          rider_id: selectedRiderId,
          total,
          delivery_fee: deliveryFee,
          status,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          note: note || "None",
        })
        .eq("id", orderId);

      if (orderError) {
        console.error("Order update failed:", orderError);
        alert(
          `Failed to update order: ${getErrorMessage(orderError, "Unknown error")}`,
        );
        return;
      }

      // Delete old order items
      const { error: deleteError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (deleteError) {
        console.error("Order item delete failed:", deleteError);
        alert(
          `Failed to delete old items: ${getErrorMessage(deleteError, "Unknown error")}`,
        );
        return;
      }

      // Insert new order items
      const { error: itemError } = await supabase.from("order_items").insert(
        orderItemRows.map((item) => ({
          order_id: orderId,
          ...item,
        })),
      );

      if (itemError) {
        console.error("Order item insert failed:", itemError);
        alert(
          `Failed to save order items: ${getErrorMessage(itemError, "Unknown error")}`,
        );
        return;
      }

      onUpdate({
        id: orderId,
        customer: formattedCustomerName,
        total,
        date: new Date().toLocaleDateString(),
        dateRange: "Today",
        status,
        paymentStatus,
        paymentMethod,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="rounded-lg bg-white p-8">
          <p className="text-gray-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[90vh] w-11/12 max-w-3xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
        <div className="flex flex-shrink-0 items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">Edit Order</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setFirstName(event.target.value)
                    }
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setLastName(event.target.value)
                    }
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="middleInitial"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Middle Initial
                  </label>
                  <input
                    id="middleInitial"
                    type="text"
                    placeholder="M.I"
                    value={middleInitial}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setMiddleInitial(event.target.value.slice(0, 1))
                    }
                    className={`${inputStyle} w-32`}
                    maxLength={1}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="contact"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Contact *
                  </label>
                  <input
                    id="contact"
                    type="text"
                    placeholder="Enter phone number"
                    value={contact}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setContact(event.target.value)
                    }
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="assignedRider"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Assigned Rider *
                  </label>

                  <div className="relative">
                    <select
                      id="assignedRider"
                      name="assignedRider"
                      value={selectedRiderId}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                        const riderId = event.target.value;
                        setSelectedRiderId(riderId);

                        const selected = riders.find((r) => r.id === riderId);
                        setArea(selected?.area ?? "");
                      }}
                      disabled={loadingRiders}
                      className={`${inputStyle} cursor-pointer appearance-none pr-10`}
                      required
                    >
                      <option value="" disabled>
                        {loadingRiders ? "Loading riders..." : "Select rider"}
                      </option>

                      {riders.map((rider) => (
                        <option key={rider.id} value={rider.id}>
                          {rider.name}
                        </option>
                      ))}
                    </select>

                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                      ▼
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="area"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Area
                  </label>
                  <input
                    id="area"
                    type="text"
                    value={area}
                    readOnly
                    className={`${inputStyle} bg-gray-50`}
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <label
                    htmlFor="address"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Address *
                  </label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setAddress(event.target.value)
                    }
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="status"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Order Status *
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setStatus(
                        e.target.value as "waiting" | "delivered" | "cancelled",
                      )
                    }
                    className={inputStyle}
                  >
                    <option value="waiting">Waiting</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="paymentStatus"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Payment Status *
                  </label>

                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    value={paymentStatus}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setPaymentStatus(e.target.value as "paid" | "unpaid")
                    }
                    className={inputStyle}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="paymentMethod"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setPaymentMethod(e.target.value as "cod" | "online")
                    }
                    className={inputStyle}
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="deliveryFee"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Delivery Fee
                  </label>
                  <input
                    id="deliveryFee"
                    type="number"
                    placeholder="0"
                    value={deliveryFee === 0 ? "" : deliveryFee}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      setDeliveryFee(value === "" ? 0 : Number(value));
                    }}
                    className={inputStyle}
                    min={0}
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <label
                    htmlFor="note"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Note (Optional)
                  </label>
                  <textarea
                    id="note"
                    placeholder="Add any special instructions..."
                    value={note}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setNote(e.target.value)
                    }
                    className={`${inputStyle} resize-none h-20`}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-center text-lg font-semibold">Menu</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-lg bg-gray-50 p-4">
                  <img
                    src="/images/ClassicOrder.png"
                    alt="Classic product"
                    className="mx-auto h-36 w-auto object-contain"
                  />

                  <p className="mt-2 text-center font-semibold">Classic</p>

                  {(["small", "large", "bottled"] as const).map((size) => (
                    <QuantityRow
                      key={size}
                      label={`Classic (${size})`}
                      price={PRICES[size]}
                      value={classic[size]}
                      onChange={(value) =>
                        setClassic({ ...classic, [size]: value })
                      }
                    />
                  ))}
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <img
                    src="/images/SpicyOrder.png"
                    alt="Spicy product"
                    className="mx-auto h-36 w-auto object-contain"
                  />
                  <p className="mt-2 text-center font-semibold">Spicy</p>

                  {(["small", "large", "bottled"] as const).map((size) => (
                    <QuantityRow
                      key={size}
                      label={`Spicy (${size})`}
                      price={PRICES[size]}
                      value={spicy[size]}
                      onChange={(value) =>
                        setSpicy({ ...spicy, [size]: value })
                      }
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-shrink-0 items-center justify-between border-t px-6 py-4">
            <p className="text-lg font-semibold">
              Subtotal: PHP {itemTotal.toFixed(2)} <br />
              Total (Incl. Delivery): PHP {total.toFixed(2)}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className={btnOutline}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={btnPrimary}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
