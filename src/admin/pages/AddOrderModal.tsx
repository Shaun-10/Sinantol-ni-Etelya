import { FormEvent, ReactElement, ChangeEvent, useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import type { AdminOrder } from "./orderTypes";

interface Rider {
  id: string;
  name: string;
}

interface ProductVariant {
  id: string;
  flavor: string;
  size: string;
  price: number;
}

interface AddOrderModalProps {
  onClose: () => void;
  onAdd: (order: AdminOrder) => void;
}

type SizeKey = "small" | "large" | "bottled";
type QuantityState = Record<SizeKey, number>;

const PRICES: Record<SizeKey, number> = {
  small: 110,
  large: 150,
  bottled: 170,
};

interface QuantityRowProps {
  label: string;
  price: number;
  value: number;
  onChange: (value: number) => void;
  [k: string]: any;
}

function QuantityRow({ label, price, value, onChange }: QuantityRowProps): ReactElement {
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
        >
          -
        </button>

        <input
          type="number"
          min={0}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Math.max(0, Number(event.target.value) || 0))}
          className="h-6 w-12 rounded border border-gray-300 text-center text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
          aria-label={`${label} quantity`}
        />

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-sm hover:bg-gray-100"
          aria-label={`Increase ${label}`}
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
  middleInitial: string
): string {
  return [firstName.trim(), middleInitial.trim(), lastName.trim()]
    .filter(Boolean)
    .join(" ");
}

function getVariantKey(flavor: string, size: string): string {
  return `${flavor.trim().toLowerCase()}::${size.trim().toLowerCase()}`;
}

export default function AddOrderModal({
  onClose,
  onAdd,
}: AddOrderModalProps): ReactElement {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [classic, setClassic] = useState<QuantityState>({ small: 0, large: 0, bottled: 0 });
  const [spicy, setSpicy] = useState<QuantityState>({ small: 0, large: 0, bottled: 0 });
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [loadingRiders, setLoadingRiders] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total =
    classic.small * PRICES.small +
    classic.large * PRICES.large +
    classic.bottled * PRICES.bottled +
    spicy.small * PRICES.small +
    spicy.large * PRICES.large +
    spicy.bottled * PRICES.bottled;

  useEffect(() => {
    const fetchRiders = async () => {
      setLoadingRiders(true);

      const { data, error } = await supabase
        .from("riders")
        .select("id, first_name, last_name")
        .order("last_name", { ascending: true });

      if (error) {
        console.error("Error fetching riders:", error);
      } else {
        setRiders(
          (data ?? []).map((rider) => ({
            id: rider.id,
            name: `${rider.first_name} ${rider.last_name}`.trim(),
          }))
        );
      }

      setLoadingRiders(false);
    };

    void fetchRiders();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const customerName = formatCustomerName(firstName, lastName, middleInitial);
    const hasItems = total > 0;

    if (!customerName || !address.trim() || !contact.trim()) {
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

    setIsSubmitting(true);

    try {
      const orderItems = [
        { flavor: "classic", sizes: classic },
        { flavor: "spicy", sizes: spicy },
      ] satisfies Array<{ flavor: string; sizes: QuantityState }>;

      const { data: variants, error: variantsError } = await supabase
        .from("product_variants")
        .select("id, flavor, size, price");

      if (variantsError || !variants) {
        console.error("Error fetching product variants:", variantsError);
        alert("Failed to load product variants.");
        return;
      }

      const variantsByKey = new Map(
        (variants as ProductVariant[]).map((variant) => [
          getVariantKey(variant.flavor, variant.size),
          variant,
        ])
      );

      const orderItemRows: Array<{
        product_variant_id: string;
        quantity: number;
        subtotal: number;
      }> = [];

      for (const item of orderItems) {
        for (const [size, quantity] of Object.entries(item.sizes) as Array<[SizeKey, number]>) {
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

      const createdAt = new Date().toISOString();
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: customerName,
          address: address.trim(),
          contact: contact.trim(),
          rider_id: selectedRiderId,
          total,
          order_date: createdAt,
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error("Order insert failed:", orderError);
        alert("Failed to create order.");
        return;
      }

      const { error: itemError } = await supabase.from("order_items").insert(
        orderItemRows.map((item) => ({
          order_id: order.id,
          ...item,
        }))
      );

      if (itemError) {
        console.error("Order item insert failed:", itemError);
        alert("Failed to save order items.");
        return;
      }

      onAdd({
        id: order.id,
        customer: customerName,
        total,
        date: new Date(order.order_date).toLocaleDateString(),
        dateRange: "Today",
        status: "waiting",
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[90vh] w-11/12 max-w-3xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
        <div className="flex flex-shrink-0 items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">Add New Order</h2>
          <button onClick={onClose} aria-label="Close modal">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">First Name *</label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setFirstName(event.target.value)}
                    className="rider-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setLastName(event.target.value)}
                    className="rider-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Middle Initial</label>
                  <input
                    type="text"
                    placeholder="M.I"
                    value={middleInitial}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setMiddleInitial(event.target.value.slice(0, 1))}
                    className="rider-input w-32"
                    maxLength={1}
                  />
                </div>

                <div className="col-span-1 flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Address *</label>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setAddress(event.target.value)}
                    className="rider-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Contact *</label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={contact}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setContact(event.target.value)}
                    className="rider-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="assignedRider" className="text-sm font-semibold text-gray-700">
                    Assigned Rider *
                  </label>

                  <div className="relative">
                    <select
                      id="assignedRider"
                      name="assignedRider"
                      value={selectedRiderId}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedRiderId(event.target.value)}
                      disabled={loadingRiders}
                      className="rider-input cursor-pointer appearance-none pr-10"
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
                      v
                    </span>
                  </div>
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
                    className="mx-auto h-40"
                  />
                  <p className="mt-2 text-center font-semibold">Classic</p>

                  {(["small", "large", "bottled"] as SizeKey[]).map((size) => (
                    <QuantityRow
                      key={size}
                      label={`Classic (${size})`}
                      price={PRICES[size]}
                      value={classic[size]}
                      onChange={(value) => setClassic({ ...classic, [size]: value })}
                    />
                  ))}
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <img
                    src="/images/SpicyOrder.png"
                    alt="Spicy product"
                    className="mx-auto h-40"
                  />
                  <p className="mt-2 text-center font-semibold">Spicy</p>

                  {(["small", "large", "bottled"] as SizeKey[]).map((size) => (
                    <QuantityRow
                      key={size}
                      label={`Spicy (${size})`}
                      price={PRICES[size]}
                      value={spicy[size]}
                      onChange={(value) => setSpicy({ ...spicy, [size]: value })}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-shrink-0 items-center justify-between border-t px-6 py-4">
            <p className="text-lg font-semibold">Total: PHP {total.toFixed(2)}</p>

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-outline" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
