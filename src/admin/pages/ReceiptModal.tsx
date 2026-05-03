import { useEffect, useState } from "react";
import { FiMapPin, FiPhone, FiTruck, FiUser, FiX } from "react-icons/fi";
import { supabase } from "@lib/supabase";

interface ReceiptModalProps {
  orderId: string;
  onClose: () => void;
}

interface ProductVariant {
  id: string;
  flavor: string;
  size: string;
  price: number;
}

interface RiderInfo {
  first_name: string;
  last_name: string;
}

interface OrderItemRow {
  product_variant_id: string;
  quantity: number;
  subtotal: number;
  product_variant: ProductVariant | null;
}

interface OrderItemResponse {
  product_variant_id: string;
  quantity: number;
  subtotal: number;
}

interface OrderDetails {
  customer_name: string;
  address: string;
  contact: string;
  total: number;
  rider: RiderInfo | RiderInfo[] | null;
}

function getRiderName(rider: RiderInfo | RiderInfo[] | null): string {
  if (!rider) return "Unassigned";

  const riderInfo = Array.isArray(rider) ? rider[0] : rider;
  if (!riderInfo) return "Unassigned";

  return `${riderInfo.first_name} ${riderInfo.last_name}`.trim() || "Unassigned";
}

function formatCurrency(value: number): string {
  return `PHP ${value.toFixed(2)}`;
}

export default function ReceiptModal({
  orderId,
  onClose,
}: ReceiptModalProps): JSX.Element {
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select("product_variant_id, quantity, subtotal")
        .eq("order_id", orderId);

      if (itemError) {
        console.error("Error fetching order items:", itemError);
      } else {
        const baseItems = ((itemData as OrderItemResponse[]) ?? []).map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          subtotal: item.subtotal,
          product_variant: null,
        }));

        if (baseItems.length === 0) {
          setItems([]);
        } else {
          const variantIds = [...new Set(baseItems.map((item) => item.product_variant_id))];
          const { data: variantData, error: variantError } = await supabase
            .from("product_variants")
            .select("id, flavor, size, price")
            .in("id", variantIds);

          if (variantError) {
            console.error("Error fetching product variants:", variantError);
            setItems(baseItems);
          } else {
            const variantsById = new Map(
              ((variantData as ProductVariant[]) ?? []).map((variant) => [variant.id, variant])
            );

            setItems(
              baseItems.map((item) => ({
                ...item,
                product_variant: variantsById.get(item.product_variant_id) ?? null,
              }))
            );
          }
        }
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          customer_name,
          address,
          contact,
          total,
          rider:riders!orders_rider_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("id", orderId)
        .single();

      if (orderError) {
        console.error("Error fetching order details:", orderError);
      } else {
        setOrder(orderData as OrderDetails);
      }
    };

    void fetchReceipt();
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[520px] overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-bold">Customer Details</h2>
          <button onClick={onClose} aria-label="Close receipt">
            <FiX />
          </button>
        </div>

        {order && (
          <div className="space-y-2 border-b p-4 text-sm">
            <div className="flex items-center gap-2">
              <FiUser />
              <span>{order.customer_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <FiMapPin />
              <span>{order.address}</span>
            </div>

            <div className="flex items-center gap-2">
              <FiPhone />
              <span>{order.contact}</span>
            </div>

            <div className="flex items-center gap-2">
              <FiTruck />
              <span>{getRiderName(order.rider)}</span>
            </div>
          </div>
        )}

        <div className="p-4">
          <h3 className="mb-2 font-semibold">Order Details</h3>

          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Flavor</th>
                <th className="p-2 text-left">Size</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => {
                  const variant = item.product_variant;

                  return (
                    <tr key={`${variant?.flavor ?? "item"}-${variant?.size ?? index}`}>
                      <td className="p-2 font-semibold">{variant?.flavor ?? "-"}</td>
                      <td className="p-2">{variant?.size ?? "-"}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">
                    No order items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-3 text-right font-bold">
            Total: {formatCurrency(order?.total ?? 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
