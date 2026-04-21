import { getRiderSupabaseClient } from './supabaseClient';

export type DeliveryStatus = 'In Progress' | 'Delivered' | 'Failed';

export interface RiderDelivery {
  id: string;
  customer: string;
  customerPhone: string;
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

function isMissingTableError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) {
    return false;
  }

  const code = String(error.code ?? '');
  const message = String(error.message ?? '').toLowerCase();
  return code === '42P01' || code === 'PGRST205' || message.includes('could not find the table');
}

function formatCurrency(value: number): string {
  return `P${Number.isFinite(value) ? value.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '0'}`;
}

export function toCurrency(value: number): string {
  return formatCurrency(value);
}

function statusFromRow(rawStatus: unknown): DeliveryStatus {
  const status = String(rawStatus ?? '').toLowerCase();
  if (status.includes('deliver')) {
    return 'Delivered';
  }
  if (status.includes('fail') || status.includes('cancel')) {
    return 'Failed';
  }
  return 'In Progress';
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseItems(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
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

function mapDeliveryRow(row: Record<string, unknown>): RiderDelivery {
  const amount = toNumber(row.amount ?? row.total_amount ?? row.cod_amount);
  const distanceValue = row.distance_km ?? row.distance ?? row.next_stop_distance;
  const distance = distanceValue ? `${distanceValue} km` : '-';

  return {
    id: String(row.id ?? ''),
    customer: String(row.customer_name ?? row.customer ?? row.recipient_name ?? '-'),
    customerPhone: String(row.customer_phone ?? row.phone ?? row.contact_number ?? '-'),
    address: String(row.address ?? row.delivery_address ?? '-'),
    amount,
    paymentMethod: String(row.payment_method ?? 'Cash on Delivery'),
    paymentStatus: String(row.payment_status ?? '-'),
    status: statusFromRow(row.status),
    distance,
    eta: String(row.eta_text ?? row.eta ?? '-'),
    navigationText: String(row.navigation_text ?? row.pin_location ?? 'No navigation notes yet'),
    items: parseItems(row.items ?? row.order_items),
    deliveredAt: row.delivered_at ? String(row.delivered_at) : undefined,
    failedAt: row.failed_at ? String(row.failed_at) : undefined,
    failedReason: row.failed_reason ? String(row.failed_reason) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
  };
}

function mapOrderItemsByOrderId(rows: Array<Record<string, unknown>>): Map<string, string[]> {
  const map = new Map<string, string[]>();

  rows.forEach((row) => {
    const orderId = String(row.order_id ?? row.orderId ?? '');
    if (!orderId) {
      return;
    }

    const quantity = toNumber(row.quantity ?? row.qty ?? 1);
    const itemName = String(row.product_name ?? row.item_name ?? row.name ?? row.title ?? 'Item').trim();
    const itemText = quantity > 1 ? `${quantity}x ${itemName}` : itemName;

    const current = map.get(orderId) ?? [];
    current.push(itemText);
    map.set(orderId, current);
  });

  return map;
}

function mapOrderRow(row: Record<string, unknown>, items: string[]): RiderDelivery {
  const createdAtRaw =
    row.created_at ?? row.createdAt ?? row.order_date ?? row.date_created ?? row.updated_at ?? row.updatedAt;

  return {
    id: String(row.id ?? row.order_id ?? ''),
    customer: String(row.customer_name ?? row.customer ?? row.recipient_name ?? '-'),
    customerPhone: String(row.customer_phone ?? row.phone ?? row.contact_number ?? '-'),
    address: String(row.delivery_address ?? row.address ?? '-'),
    amount: toNumber(row.total_amount ?? row.amount ?? row.total ?? row.cod_amount),
    paymentMethod: String(row.payment_method ?? 'Cash on Delivery'),
    paymentStatus: String(row.payment_status ?? '-'),
    status: statusFromRow(row.status),
    distance: String(row.distance_km ?? row.distance ?? '-').trim() || '-',
    eta: String(row.eta_text ?? row.eta ?? '-'),
    navigationText: String(row.navigation_text ?? row.notes ?? 'No navigation notes yet'),
    items,
    deliveredAt: row.delivered_at ? String(row.delivered_at) : undefined,
    failedAt: row.failed_at ? String(row.failed_at) : undefined,
    failedReason: row.failed_reason ? String(row.failed_reason) : undefined,
    createdAt: createdAtRaw ? String(createdAtRaw) : undefined,
  };
}

function getRowDateMs(row: Record<string, unknown>): number {
  const raw =
    row.created_at ?? row.createdAt ?? row.order_date ?? row.date_created ?? row.updated_at ?? row.updatedAt;

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
  const beforeAt = email.split('@')[0] ?? 'Rider';
  return beforeAt.trim() || 'Rider';
}

export async function getRiderProfileData(): Promise<RiderProfileData> {
  const client = getRiderSupabaseClient();
  if (!client) {
    setRiderDataIssue('Supabase client is not configured.');
    return {
      fullName: 'Rider',
      email: '-',
      contact: '-',
      assignedArea: '-',
      motorModel: '-',
      plateNumber: '-',
    };
  }

  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) {
    setRiderDataIssue('No logged-in rider session found.');
    return {
      fullName: 'Rider',
      email: '-',
      contact: '-',
      assignedArea: '-',
      motorModel: '-',
      plateNumber: '-',
    };
  }

  const email = String(user.email ?? '').trim();
  const metadataName = String(user.user_metadata?.username ?? user.user_metadata?.full_name ?? '').trim();
  const fallbackName = normalizeNameFromEmail(email);

  let profileRow: Record<string, unknown> | null = null;
  const { data: riderProfileData, error: riderProfileError } = await client
    .from('rider_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (riderProfileError) {
    if (!isMissingTableError(riderProfileError)) {
      setRiderDataIssue(`Profile query failed: ${riderProfileError.message}`);
    }
  }

  if (riderProfileData && typeof riderProfileData === 'object') {
    profileRow = riderProfileData as Record<string, unknown>;
  }

  if (!profileRow) {
    const { data: riderData, error: riderError } = await client
      .from('riders')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (riderError) {
      if (!isMissingTableError(riderError)) {
        setRiderDataIssue(`Rider profile query failed: ${riderError.message}`);
      }
    } else if (riderData && typeof riderData === 'object') {
      profileRow = riderData as Record<string, unknown>;
    }
  }

  const fullNameFromRiders = [
    String(profileRow?.first_name ?? '').trim(),
    String(profileRow?.last_name ?? '').trim(),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (profileRow) {
    clearRiderDataIssue();
  }

  return {
    fullName: String(profileRow?.full_name ?? fullNameFromRiders ?? metadataName ?? fallbackName ?? 'Rider'),
    email: email || '-',
    contact: String(profileRow?.contact ?? profileRow?.phone ?? '-'),
    assignedArea: String(profileRow?.assigned_area ?? profileRow?.area ?? '-'),
    motorModel: String(profileRow?.motor_model ?? profileRow?.motorcycle_model ?? profileRow?.motor ?? '-'),
    plateNumber: String(profileRow?.plate_number ?? '-'),
  };
}

export async function getRiderDeliveries(): Promise<RiderDelivery[]> {
  const client = getRiderSupabaseClient();
  if (!client) {
    setRiderDataIssue('Supabase client is not configured.');
    return [];
  }

  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) {
    setRiderDataIssue('No logged-in rider session found.');
    return [];
  }

  const { data, error } = await client.from('deliveries').select('*');
  if (!error) {
    if (!Array.isArray(data)) {
      setRiderDataIssue('Deliveries query returned invalid data format.');
      return [];
    }

    clearRiderDataIssue();

    const email = String(user.email ?? '').trim().toLowerCase();

    const filtered = data.filter((row) => {
      const typed = row as Record<string, unknown>;
      const riderAuthId = String(typed.rider_auth_id ?? typed.rider_id ?? '').trim();
      const riderEmail = String(typed.rider_email ?? '').trim().toLowerCase();

      if (!riderAuthId && !riderEmail) {
        return true;
      }

      return riderAuthId === user.id || (riderEmail && riderEmail === email);
    });

    const sorted = sortRowsByDateDesc(filtered as Array<Record<string, unknown>>);
    return sorted.map((row) => mapDeliveryRow(row as Record<string, unknown>));
  }

  if (!isMissingTableError(error)) {
    setRiderDataIssue(`Deliveries query failed: ${error.message}`);
    return [];
  }

  const email = String(user.email ?? '').trim().toLowerCase();

  const { data: riderRowData } = await client
    .from('riders')
    .select('id,user_id,email')
    .eq('user_id', user.id)
    .maybeSingle();

  const riderRow = (riderRowData as Record<string, unknown> | null) ?? null;
  const riderId = String(riderRow?.id ?? '').trim();

  const { data: ordersData, error: ordersError } = await client.from('orders').select('*');
  if (ordersError) {
    if (isMissingTableError(ordersError)) {
      setRiderDataIssue('Missing rider order tables. Expected deliveries or orders table.');
    } else {
      setRiderDataIssue(`Orders query failed: ${ordersError.message}`);
    }
    return [];
  }

  if (!Array.isArray(ordersData)) {
    setRiderDataIssue('Orders query returned invalid data format.');
    return [];
  }

  const filteredOrders = ordersData.filter((row) => {
    const typed = row as Record<string, unknown>;
    const rowRiderId = String(typed.rider_id ?? typed.rider_auth_id ?? typed.rider_user_id ?? '').trim();
    const rowRiderEmail = String(typed.rider_email ?? '').trim().toLowerCase();

    if (!rowRiderId && !rowRiderEmail) {
      return true;
    }

    return rowRiderId === riderId || rowRiderId === user.id || (rowRiderEmail && rowRiderEmail === email);
  });

  const sortedOrders = sortRowsByDateDesc(filteredOrders as Array<Record<string, unknown>>);

  const orderIds = sortedOrders
    .map((row) => String((row as Record<string, unknown>).id ?? ''))
    .filter(Boolean);

  let itemsByOrderId = new Map<string, string[]>();

  if (orderIds.length > 0) {
    const { data: itemRows, error: itemError } = await client.from('order_items').select('*').in('order_id', orderIds);
    if (!itemError && Array.isArray(itemRows)) {
      itemsByOrderId = mapOrderItemsByOrderId(itemRows as Array<Record<string, unknown>>);
    }
  }

  clearRiderDataIssue();

  return sortedOrders.map((row) => {
    const typed = row as Record<string, unknown>;
    const id = String(typed.id ?? '');
    const rowItems = itemsByOrderId.get(id) ?? parseItems(typed.items ?? typed.order_items);
    return mapOrderRow(typed, rowItems);
  });
}

export async function getRiderDeliveryById(deliveryId: string): Promise<RiderDelivery | null> {
  const all = await getRiderDeliveries();
  return all.find((item) => item.id === deliveryId) ?? null;
}

export async function markDeliveryDelivered(deliveryId: string): Promise<boolean> {
  const client = getRiderSupabaseClient();
  if (!client) {
    return false;
  }

  const payload = {
    status: 'delivered',
    delivered_at: new Date().toISOString(),
    payment_status: 'paid',
  };

  const { error } = await client
    .from('deliveries')
    .update(payload)
    .eq('id', deliveryId);

  if (error && isMissingTableError(error)) {
    const { error: orderError } = await client.from('orders').update(payload).eq('id', deliveryId);
    return !orderError;
  }

  return !error;
}

export async function markDeliveryFailed(deliveryId: string, reason: string): Promise<boolean> {
  const client = getRiderSupabaseClient();
  if (!client) {
    return false;
  }

  const payload = {
    status: 'failed',
    failed_at: new Date().toISOString(),
    failed_reason: reason,
  };

  const { error } = await client
    .from('deliveries')
    .update(payload)
    .eq('id', deliveryId);

  if (error && isMissingTableError(error)) {
    const { error: orderError } = await client.from('orders').update(payload).eq('id', deliveryId);
    return !orderError;
  }

  return !error;
}

export async function markDeliveryPaid(deliveryId: string): Promise<boolean> {
  const client = getRiderSupabaseClient();
  if (!client) {
    return false;
  }

  const payload = {
    payment_status: 'paid',
    payment_method: 'e-payment',
    status: 'delivered',
    delivered_at: new Date().toISOString(),
  };

  const { error } = await client
    .from('deliveries')
    .update(payload)
    .eq('id', deliveryId);

  if (error && isMissingTableError(error)) {
    const { error: orderError } = await client.from('orders').update(payload).eq('id', deliveryId);
    return !orderError;
  }

  return !error;
}

export function formatMetaDateTime(value?: string): string {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
