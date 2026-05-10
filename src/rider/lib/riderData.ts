import { getRiderSupabaseClient } from "./supabaseClient";

export type DeliveryStatus = "In Progress" | "Delivered" | "Failed";

export interface RiderDelivery {
  id: string;
  customer: string;
  contact: string;
  address: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: DeliveryStatus;
  distance: string;
  eta: string;
  navigationText: string;
  items: string[];
  deliveredAt?: string;
  failedAt?: string;
  failedReason?: string;
  createdAt?: string;
}

export interface RiderProfileData {
  fullName: string;
  email: string;
  contact: string;
  assignedArea: string;
  motorModel: string;
  plateNumber: string;
}

let riderDataIssue: string | null = null;

function setRiderDataIssue(message: string): void {
  riderDataIssue = message;
}

function clearRiderDataIssue(): void {
  riderDataIssue = null;
}

export function getRiderDataIssue(): string | null {
  return riderDataIssue;
}

function isMissingTableError(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  if (!error) {
    return false;
  }

  const code = String(error.code ?? "");
  const message = String(error.message ?? "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    message.includes("could not find the table")
  );
}

function isMissingColumnError(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  if (!error) {
    return false;
  }

  const code = String(error.code ?? "");
  const message = String(error.message ?? "").toLowerCase();
  return (
    code === "PGRST204" ||
    (message.includes("could not find") && message.includes("column"))
  );
}

function minimalStatusPayload(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  return "status" in payload ? { status: payload.status } : payload;
}

function formatCurrency(value: number): string {
  return `P${Number.isFinite(value) ? value.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "0"}`;
}

export function toCurrency(value: number): string {
  return formatCurrency(value);
}

function statusFromRow(rawStatus: unknown): DeliveryStatus {
  const status = String(rawStatus ?? "")
    .toLowerCase()
    .trim();
  // Match database values: 'delivered', 'failed', 'in_progress'
  if (status === "delivered" || status.includes("deliver")) {
    return "Delivered";
  }
  if (
    status === "failed" ||
    status.includes("fail") ||
    status.includes("cancel")
  ) {
    return "Failed";
  }
  // Default to 'In Progress' for 'in_progress', 'pending', 'waiting', or unknown
  return "In Progress";
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseItems(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item));
        }
      } catch {
        return [trimmed];
      }
    }

    return [trimmed];
  }

  return [];
}

function noteTextFromRow(...values: unknown[]): string {
  for (const value of values) {
    const note = String(value ?? '').trim();
    if (note && note.toLowerCase() !== 'none') {
      return note;
    }
  }

  return 'Notes';
}

function mapDeliveryRow(row: Record<string, unknown>): RiderDelivery {
  const amount = toNumber(row.amount ?? row.total_amount ?? row.cod_amount);
  const distanceValue =
    row.distance_km ?? row.distance ?? row.next_stop_distance;
  const distance = distanceValue ? `${distanceValue} km` : "-";

  return {
    id: String(row.id ?? ""),
    customer: String(
      row.customer_name ?? row.customer ?? row.recipient_name ?? "-",
    ),
    contact: String(
      row.contact ??
        row.customer_phone ??
        row.phone ??
        row.contact_number ??
        "-",
    ),
    address: String(row.address ?? row.delivery_address ?? "-"),
    amount,
    paymentMethod: String(row.payment_method ?? "Cash on Delivery"),
    paymentStatus: String(row.payment_status ?? "-"),
    status: statusFromRow(row.status),
    distance,
    eta: String(row.eta_text ?? row.eta ?? "-"),
    navigationText: String(
      row.navigation_text ??
        row.pin_location ??
        row.note ??
        row.notes ??
        "No navigation notes yet",
    ),
    items: parseItems(row.items ?? row.order_items),
    deliveredAt: row.delivered_at ? String(row.delivered_at) : undefined,
    failedAt: row.failed_at ? String(row.failed_at) : undefined,
    failedReason: row.failed_reason ? String(row.failed_reason) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
  };
}

function mapOrderItemsByOrderId(
  rows: Array<Record<string, unknown>>,
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  rows.forEach((row) => {
    const orderId = String(row.order_id ?? row.orderId ?? "");
    if (!orderId) {
      return;
    }

    const quantity = toNumber(row.quantity ?? row.qty ?? 1);
    const variant = row.product_variants as
      | Record<string, unknown>
      | null
      | undefined;
    const variantName = [variant?.flavor, variant?.size]
      .filter(Boolean)
      .join(" ");
    const fallbackName = variantName.trim() || "Item";
    const itemName =
      String(
        row.product_name ??
          row.item_name ??
          row.name ??
          row.title ??
          fallbackName,
      ).trim() || fallbackName;
    const itemText = quantity > 1 ? `${quantity}x ${itemName}` : itemName;

    const current = map.get(orderId) ?? [];
    current.push(itemText);
    map.set(orderId, current);
  });

  return map;
}

function mapOrderRow(
  row: Record<string, unknown>,
  items: string[],
): RiderDelivery {
  const createdAtRaw =
    row.created_at ??
    row.createdAt ??
    row.order_date ??
    row.date_created ??
    row.updated_at ??
    row.updatedAt;

  return {
    id: String(row.id ?? row.order_id ?? ""),
    customer: String(
      row.customer_name ?? row.customer ?? row.recipient_name ?? "-",
    ),
    contact: String(
      row.contact ??
        row.customer_phone ??
        row.phone ??
        row.contact_number ??
        "-",
    ),
    address: String(row.delivery_address ?? row.address ?? "-"),
    amount: toNumber(
      row.total_amount ?? row.amount ?? row.total ?? row.cod_amount,
    ),
    paymentMethod: String(row.payment_method ?? "Cash on Delivery"),
    paymentStatus: String(row.payment_status ?? "-"),
    status: statusFromRow(row.status),
    distance: String(row.distance_km ?? row.distance ?? "-").trim() || "-",
    eta: String(row.eta_text ?? row.eta ?? "-"),
    navigationText: String(
      row.navigation_text ?? row.note ?? row.notes ?? "No navigation notes yet",
    ),
    items,
    deliveredAt: row.delivered_at ? String(row.delivered_at) : undefined,
    failedAt: row.failed_at ? String(row.failed_at) : undefined,
    failedReason: row.failed_reason ? String(row.failed_reason) : undefined,
    createdAt: createdAtRaw ? String(createdAtRaw) : undefined,
  };
}

function getRowDateMs(row: Record<string, unknown>): number {
  const raw =
    row.created_at ??
    row.createdAt ??
    row.order_date ??
    row.date_created ??
    row.updated_at ??
    row.updatedAt;

  if (!raw) {
    return 0;
  }

  const parsed = new Date(String(raw)).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortRowsByDateDesc<T extends Record<string, unknown>>(rows: T[]): T[] {
  return [...rows].sort((a, b) => getRowDateMs(b) - getRowDateMs(a));
}

function normalizeNameFromEmail(email: string): string {
  const beforeAt = email.split("@")[0] ?? "Rider";
  return beforeAt.trim() || "Rider";
}

function firstNonEmpty(...values: Array<unknown>): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "-";
}

export async function getRiderProfileData(): Promise<RiderProfileData> {
  const client = getRiderSupabaseClient();
  if (!client) {
    setRiderDataIssue("Supabase client is not configured.");
    return {
      fullName: "Rider",
      email: "-",
      contact: "-",
      assignedArea: "-",
      motorModel: "-",
      plateNumber: "-",
    };
  }

  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) {
    setRiderDataIssue("No logged-in rider session found.");
    return {
      fullName: "Rider",
      email: "-",
      contact: "-",
      assignedArea: "-",
      motorModel: "-",
      plateNumber: "-",
    };
  }

  const email = String(user.email ?? "").trim();
  const metadataName = String(
    user.user_metadata?.username ?? user.user_metadata?.full_name ?? "",
  ).trim();
  const fallbackName = normalizeNameFromEmail(email);

  let riderProfileRow: Record<string, unknown> | null = null;
  const { data: riderProfileData, error: riderProfileError } = await client
    .from("rider_profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (riderProfileError) {
    if (!isMissingTableError(riderProfileError)) {
      setRiderDataIssue(`Profile query failed: ${riderProfileError.message}`);
    }
  }

  if (riderProfileData && typeof riderProfileData === "object") {
    riderProfileRow = riderProfileData as Record<string, unknown>;
  }

  let riderRow: Record<string, unknown> | null = null;
  const { data: riderData, error: riderError } = await client
    .from("riders")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (riderError) {
    if (!isMissingTableError(riderError)) {
      setRiderDataIssue(`Rider profile query failed: ${riderError.message}`);
    }
  } else if (riderData && typeof riderData === "object") {
    riderRow = riderData as Record<string, unknown>;
  }

  const fullNameFromRiders = [
    String(riderProfileRow?.name ?? riderRow?.name ?? "").trim(),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (riderProfileRow || riderRow) {
    clearRiderDataIssue();
  }

  const profileRow = riderProfileRow ?? riderRow;

  return {
    fullName: String(
      profileRow?.full_name ??
        fullNameFromRiders ??
        metadataName ??
        fallbackName ??
        "Rider",
    ),
    email: email || "-",
    contact: firstNonEmpty(
      profileRow?.contact,
      profileRow?.phone,
      riderRow?.contact,
      riderRow?.phone,
    ),
    assignedArea: firstNonEmpty(
      profileRow?.assigned_area,
      profileRow?.area,
      profileRow?.location,
      riderRow?.assigned_area,
      riderRow?.area,
      riderRow?.location,
    ),
    motorModel: firstNonEmpty(
      profileRow?.motor_model,
      profileRow?.motorcycle_model,
      profileRow?.motor,
      riderRow?.motor_model,
      riderRow?.motorcycle_model,
      riderRow?.motor,
    ),
    plateNumber: firstNonEmpty(
      profileRow?.plate_number,
      riderRow?.plate_number,
    ),
  };
}

export async function getRiderDeliveries(): Promise<RiderDelivery[]> {
  const client = getRiderSupabaseClient();
  if (!client) {
    console.error("Supabase client is not configured.");
    setRiderDataIssue("Supabase client is not configured.");
    return [];
  }

  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) {
    console.error("No logged-in rider session found.");
    setRiderDataIssue("No logged-in rider session found.");
    return [];
  }

  console.log("Fetching deliveries for user:", user.id, user.email);

  const email = String(user.email ?? "")
    .trim()
    .toLowerCase();
  const deliveries: RiderDelivery[] = [];

  const { data: riderRowData } = await client
    .from("riders")
    .select("id,user_id,email")
    .eq("user_id", user.id)
    .maybeSingle();

  const riderRow = (riderRowData as Record<string, unknown> | null) ?? null;
  const riderId = String(riderRow?.id ?? "").trim();

  const { data: deliveriesData, error: deliveriesError } = await client
    .from("deliveries")
    .select("*");
  if (deliveriesError) {
    console.error("Deliveries query error:", deliveriesError);
    if (!isMissingTableError(deliveriesError)) {
      setRiderDataIssue(`Deliveries query failed: ${deliveriesError.message}`);
    }
  } else if (!Array.isArray(deliveriesData)) {
    console.error(
      "Deliveries query returned invalid data format:",
      deliveriesData,
    );
    setRiderDataIssue("Deliveries query returned invalid data format.");
  } else {
    console.log("Deliveries fetched:", deliveriesData.length, "records");

    const filteredDeliveries = deliveriesData.filter((row) => {
      const typed = row as Record<string, unknown>;
      const riderAuthId = String(
        typed.rider_auth_id ?? typed.rider_id ?? "",
      ).trim();
      const riderEmail = String(typed.rider_email ?? "")
        .trim()
        .toLowerCase();

      if (!riderAuthId && !riderEmail) {
        return true;
      }

      return riderAuthId === user.id || (riderEmail && riderEmail === email);
    });

    console.log(
      "Filtered deliveries:",
      filteredDeliveries.length,
      "records (after rider match)",
    );
    deliveries.push(
      ...filteredDeliveries.map((row) =>
        mapDeliveryRow(row as Record<string, unknown>),
      ),
    );
  }

  const { data: ordersData, error: ordersError } = await client
    .from("orders")
    .select("*");
  if (ordersError) {
    console.error("Orders query error:", ordersError);
    if (isMissingTableError(ordersError) && deliveries.length === 0) {
      setRiderDataIssue(
        "Missing rider order tables. Expected deliveries or orders table.",
      );
    } else if (!isMissingTableError(ordersError)) {
      setRiderDataIssue(`Orders query failed: ${ordersError.message}`);
    }
    return sortRowsByDateDesc(
      deliveries as unknown as Array<Record<string, unknown>>,
    ) as unknown as RiderDelivery[];
  }

  if (!Array.isArray(ordersData)) {
    console.error("Orders query returned invalid data format:", ordersData);
    setRiderDataIssue("Orders query returned invalid data format.");
    return sortRowsByDateDesc(
      deliveries as unknown as Array<Record<string, unknown>>,
    ) as unknown as RiderDelivery[];
  }

  console.log("Orders fetched:", ordersData.length, "records");

  const filteredOrders = ordersData.filter((row) => {
    const typed = row as Record<string, unknown>;
    const rowRiderId = String(
      typed.rider_id ?? typed.rider_auth_id ?? typed.rider_user_id ?? "",
    ).trim();
    const rowRiderEmail = String(typed.rider_email ?? "")
      .trim()
      .toLowerCase();

    if (!rowRiderId && !rowRiderEmail) {
      return true;
    }

    return (
      rowRiderId === riderId ||
      rowRiderId === user.id ||
      (rowRiderEmail && rowRiderEmail === email)
    );
  });

  console.log(
    "Filtered orders:",
    filteredOrders.length,
    "records (after rider match)",
  );

  const sortedOrders = sortRowsByDateDesc(
    filteredOrders as Array<Record<string, unknown>>,
  );

  const orderIds = sortedOrders
    .map((row) => String((row as Record<string, unknown>).id ?? ""))
    .filter(Boolean);

  let itemsByOrderId = new Map<string, string[]>();

  if (orderIds.length > 0) {
    const { data: itemRows, error: itemError } = await client
      .from("order_items")
      .select("*, product_variants(flavor, size)")
      .in("order_id", orderIds);
    if (!itemError && Array.isArray(itemRows)) {
      itemsByOrderId = mapOrderItemsByOrderId(
        itemRows as Array<Record<string, unknown>>,
      );
      console.log(
        "Loaded order items:",
        itemsByOrderId.size,
        "orders with items",
      );
    }
  }

  clearRiderDataIssue();

  const orders = sortedOrders.map((row) => {
    const typed = row as Record<string, unknown>;
    const id = String(typed.id ?? "");
    const rowItems =
      itemsByOrderId.get(id) ?? parseItems(typed.items ?? typed.order_items);
    return mapOrderRow(typed, rowItems);
  });

  const result = [...deliveries, ...orders].sort((a, b) => {
    const aMs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bMs = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return (Number.isNaN(bMs) ? 0 : bMs) - (Number.isNaN(aMs) ? 0 : aMs);
  });

  console.log("Final result:", result.length, "deliveries");
  return result;
}

export async function getRiderDeliveryById(
  deliveryId: string,
): Promise<RiderDelivery | null> {
  const all = await getRiderDeliveries();
  return all.find((item) => item.id === deliveryId) ?? null;
}

export async function markDeliveryDelivered(
  deliveryId: string,
): Promise<boolean> {
  const client = getRiderSupabaseClient();
  if (!client) {
    console.error("Supabase client not available");
    return false;
  }

  const payload = {
    status: "delivered",
    delivered_at: new Date().toISOString(),
    payment_status: "paid",
  };

  console.log("Marking delivery as delivered:", { deliveryId, payload });

  return updateDeliveryRecord(deliveryId, payload);
}

export async function markDeliveryFailed(
  deliveryId: string,
  reason: string,
): Promise<boolean> {
  const client = getRiderSupabaseClient();
  if (!client) {
    console.error("Supabase client not available");
    return false;
  }

  const payload = {
    status: "failed",
    failed_at: new Date().toISOString(),
    failed_reason: reason,
  };

  console.log("Marking delivery as failed:", { deliveryId, payload });

  return updateDeliveryRecord(deliveryId, payload);
}

export async function markDeliveryPaid(deliveryId: string): Promise<boolean> {
  const client = getRiderSupabaseClient();
  if (!client) {
    console.error("Supabase client not available");
    return false;
  }

  const payload = {
    payment_status: "paid",
    payment_method: "e-payment",
    status: "delivered",
    delivered_at: new Date().toISOString(),
  };

  console.log("Marking delivery as paid:", { deliveryId, payload });

  return updateDeliveryRecord(deliveryId, payload);
}

async function updateDeliveryRecord(
  deliveryId: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const client = getRiderSupabaseClient();
  if (!client) {
    console.error("Supabase client not available");
    return false;
  }

  const { error, data } = await client
    .from("deliveries")
    .update(payload)
    .eq("id", deliveryId)
    .select();

  if (!error && Array.isArray(data) && data.length > 0) {
    console.log("Deliveries update successful:", data);
    return true;
  }

  if (error && !isMissingTableError(error)) {
    console.error("Deliveries table error:", error);
  }

  console.log("Trying orders table instead...");

  let { error: orderError, data: orderData } = await client
    .from("orders")
    .update(payload)
    .eq("id", deliveryId)
    .select();

  if (orderError && isMissingColumnError(orderError)) {
    const fallbackPayload = minimalStatusPayload(payload);
    console.warn(
      "Orders table is missing optional delivery columns. Retrying with status only:",
      {
        originalError: orderError,
        fallbackPayload,
      },
    );

    const fallbackResult = await client
      .from("orders")
      .update(fallbackPayload)
      .eq("id", deliveryId)
      .select();

    orderError = fallbackResult.error;
    orderData = fallbackResult.data;
  }

  if (orderError) {
    console.error("Orders table error:", orderError);
    return false;
  }

  if (!Array.isArray(orderData) || orderData.length === 0) {
    console.error("No delivery or order matched the selected id:", deliveryId);
    return false;
  }

  console.log("Orders update successful:", orderData);
  return true;
}

export function formatMetaDateTime(value?: string): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
