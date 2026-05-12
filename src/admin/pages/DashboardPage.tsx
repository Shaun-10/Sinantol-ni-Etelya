import { useEffect, useState, useMemo, type Key, type ChangeEvent } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiCheckSquare,
  FiDollarSign,
  FiMapPin,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import { supabase } from "@lib/supabase";

interface SummaryItem {
  icon: IconType;
  value: string;
  label: string;
}

interface PerformanceData {
  month: string;
  orders: number;
  revenue: number;
  growth: number;
}

interface OrderRow {
  created_at: string | null;
  rider_id: string | null;
  status: string | null;
  total: number | string | null;
  delivery_fee: number | string | null;
  id: string;
}

interface OrderItem {
  order_id: string;
  quantity: number;
}

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toAmount(value: OrderRow["total"]): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeStatus(status: string | null): string {
  return status?.trim().toLowerCase() ?? "";
}

function buildTodaySummary(
  orders: OrderRow[],
  now: Date,
  activeRiders: number,
): SummaryItem[] {
  const startOfToday = getStartOfDay(now);

  const todaysOrders = orders.filter((order) => {
    if (!order.created_at) return false;
    return new Date(order.created_at) >= startOfToday;
  });

  const completedToday = todaysOrders.filter(
    (order) => normalizeStatus(order.status) === "delivered",
  ).length;

  const assignedDeliveries = todaysOrders.filter(
    (order) =>
      normalizeStatus(order.status) === "waiting" && Boolean(order.rider_id),
  ).length;

  return [
    {
      icon: FiCheckSquare,
      label: "Completed / Total Orders",
      value: `${completedToday}/${todaysOrders.length}`,
    },
    {
      icon: FiTruck,
      label: "Active Riders Today",
      value: String(activeRiders),
    },
    {
      icon: FiMapPin,
      label: "Assigned Deliveries Today",
      value: String(assignedDeliveries),
    },
  ];
}

function buildSalesSummary(
  orders: OrderRow[],
  orderItems: OrderItem[],
  now: Date,
): SummaryItem[] {
  const orderQuantityMap = new Map<string, number>();
  for (const item of orderItems) {
    const current = orderQuantityMap.get(item.order_id) || 0;
    orderQuantityMap.set(item.order_id, current + item.quantity);
  }

  let totalSales = 0;
  let totalDeliveryFee = 0;
  let totalCommission = 0;
  let totalCollection = 0;
  let totalRidersFee = 0;
  let totalAmountToRemit = 0;

  for (const order of orders) {
    if (!order.created_at) continue;
    if (normalizeStatus(order.status) !== "delivered") continue;

    const orderDate = new Date(order.created_at);
    const amount = toAmount(order.total);
    const deliveryFee = Number(order.delivery_fee ?? 0);
    const quantity = orderQuantityMap.get(order.id) || 0;

    const orderTotalSales = amount - deliveryFee;
    // Commission = quantity × 20
    const commission = quantity * 20;
    // Total Collection = Total Sales + Delivery Fee
    const collection = orderTotalSales + deliveryFee;
    // Rider's Fee = Delivery Fee + Commission
    const ridersFee = deliveryFee + commission;
    // Amount to Remit = Total Collection - Rider's Fee
    const amountToRemit = collection - ridersFee;

    totalSales += orderTotalSales;
    totalDeliveryFee += deliveryFee;
    totalCommission += commission;
    totalCollection += collection;
    totalRidersFee += ridersFee;
    totalAmountToRemit += amountToRemit;
  }

  return [
    {
      icon: FiPackage,
      label: "Total Sales",
      value: pesoFormatter.format(totalSales),
    },
    {
      icon: FiDollarSign,
      label: "Total Delivery Fee",
      value: pesoFormatter.format(totalDeliveryFee),
    },
    {
      icon: FiBarChart2,
      label: "Total Collection",
      value: pesoFormatter.format(totalCollection),
    },
  ];
}

function buildPerformanceData(orders: OrderRow[], now: Date, range: "weekly" | "monthly" | "yearly" = "monthly", startDate?: Date): PerformanceData[] {
  const map = new Map<string, { keyOrder: number; month: string; revenue: number; orders: number }>();

  const pushToMap = (key: string, keyOrder: number, label: string, amount: number) => {
    if (!map.has(key)) {
      map.set(key, { keyOrder, month: label, revenue: 0, orders: 0 });
    }
    const entry = map.get(key)!;
    entry.revenue += amount;
    entry.orders += 1;
  };

  if (!startDate) startDate = new Date(now);

  if (range === "weekly") {
    // last 7 days starting at startDate
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      days.push(key);
      const keyOrder = +new Date(key);
      const label = `Day ${i + 1}`;
      map.set(key, { keyOrder, month: label, revenue: 0, orders: 0 });
    }

    orders.forEach((order) => {
      if (!order.created_at) return;
      const d = new Date(order.created_at);
      const key = d.toISOString().slice(0, 10);
      if (!days.includes(key)) return;
      const amount = toAmount(order.total) - Number(order.delivery_fee ?? 0);
      pushToMap(key, +new Date(key), `Day ${days.indexOf(key) + 1}`, amount);
    });
  } else if (range === "monthly") {
    const monthsRange = 6;
    const months: string[] = [];
    for (let i = 0; i < monthsRange; i++) {
      const d = new Date(startDate);
      d.setMonth(startDate.getMonth() + i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const key = `${year}-${monthIndex}`;
      months.push(key);
      const keyOrder = year * 12 + monthIndex;
      const label = d.toLocaleString("en-US", { month: "short" });
      map.set(key, { keyOrder, month: label, revenue: 0, orders: 0 });
    }

    orders.forEach((order) => {
      if (!order.created_at) return;
      const d = new Date(order.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!months.includes(key)) return;
      const amount = toAmount(order.total) - Number(order.delivery_fee ?? 0);
      pushToMap(key, months.indexOf(key) + (new Date(startDate).getFullYear() * 12), map.get(key)!.month, amount);
    });
  } else {
    const yearsRange = 3;
    const years: string[] = [];
    for (let i = 0; i < yearsRange; i++) {
      const d = new Date(startDate);
      d.setFullYear(startDate.getFullYear() + i);
      const y = d.getFullYear();
      const key = `${y}`;
      years.push(key);
      map.set(key, { keyOrder: y, month: key, revenue: 0, orders: 0 });
    }

    orders.forEach((order) => {
      if (!order.created_at) return;
      const d = new Date(order.created_at);
      const key = `${d.getFullYear()}`;
      if (!years.includes(key)) return;
      const amount = toAmount(order.total) - Number(order.delivery_fee ?? 0);
      pushToMap(key, Number(key), key, amount);
    });
  }

  return Array.from(map.values())
    .sort((a, b) => a.keyOrder - b.keyOrder)
    .map(({ month, revenue, orders }) => ({ month, revenue, orders, growth: 0 }));
}

interface SummaryCardProps extends SummaryItem {
  key?: Key;
}

function SummaryCard({
  icon: Icon,
  value,
  label,
}: SummaryCardProps): JSX.Element {
  return (
    <article className="summary-card">
      <div className="summary-icon-wrap">
        <Icon />
      </div>
      <div>
        <p className="summary-value">{value}</p>
        <p className="summary-label">{label}</p>
      </div>
    </article>
  );
}

function DashboardChartsSection({
  performanceData,
}: {
  performanceData: PerformanceData[];
}): JSX.Element {
  return (
    <section className="charts-wrap">
      <div className="chart-block chart-block-main">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={performanceData}
            margin={{ top: 12, right: 18, left: 0, bottom: 6 }}
          >
            <CartesianGrid stroke="#dce6cb" strokeDasharray="4 4" />
            <XAxis
              dataKey="month"
              stroke="#57674f"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#57674f"
              tickLine={false}
              axisLine={false}
              domain={[0, (dataMax: number) => dataMax * 1.2]}
              tickFormatter={(value: number) => String(value)}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#7a8b6f"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "revenue" || name === "Sales") {
                  return [pesoFormatter.format(Number(value ?? 0)), "Sales"];
                }

                return [value, "Orders"];
              }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #dce6cb",
                background: "#fbfdf4",
                boxShadow: "0 8px 20px rgba(34, 48, 20, 0.08)",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Sales"
              stroke="#1f8f38"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#1f8f38" }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#d08aa7"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#d08aa7" }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function DashboardPage(): JSX.Element {
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [sales, setSales] = useState<SummaryItem[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [ordersState, setOrdersState] = useState<OrderRow[]>([]);
  const [performanceRange, setPerformanceRange] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startDate = useMemo(() => {
    const now = new Date();
    const d = new Date(now);
    if (performanceRange === "weekly") {
      d.setDate(now.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    if (performanceRange === "monthly") {
      const monthsRange = 6;
      d.setMonth(now.getMonth() - (monthsRange - 1));
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    const yearsRange = 3;
    d.setFullYear(now.getFullYear() - (yearsRange - 1));
    d.setMonth(0);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [performanceRange]);

  const performanceAggregated = useMemo(() => {
    return buildPerformanceData(ordersState, new Date(), performanceRange, startDate);
  }, [ordersState, performanceRange, startDate]);

  useEffect(() => {
    const fetchDashboardData = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: true });

      if (ordersError) {
        console.error("Error fetching dashboard data:", ordersError);
        setErrorMessage(
          `Failed to load dashboard data. ${ordersError.message ?? "Please check the database connection."}`,
        );
        setIsLoading(false);
        return;
      }

      if (!Array.isArray(ordersData)) {
        console.error(
          "Dashboard data fetch returned unexpected response:",
          ordersData,
        );
        setErrorMessage(
          "Failed to load dashboard data. Unexpected response format.",
        );
        setIsLoading(false);
        return;
      }

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("order_id, quantity");

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        setErrorMessage(
          `Failed to load order items. ${itemsError.message ?? "Please check the database connection."}`,
        );
        setIsLoading(false);
        return;
      }

      const orders = ordersData as OrderRow[];
      const orderItems = (
        Array.isArray(itemsData) ? itemsData : []
      ) as OrderItem[];
      const now = new Date();
      const startOfToday = getStartOfDay(now);

      const activeRiders = new Set(
        orders
          .filter(
            (order) =>
              order.created_at &&
              new Date(order.created_at) >= startOfToday &&
              normalizeStatus(order.status) === "waiting" &&
              order.rider_id,
          )
          .map((order) => order.rider_id),
      ).size;

      // ✅ use activeRiders AFTER it is calculated
      setSummary(buildTodaySummary(orders, now, activeRiders));
      setSales(buildSalesSummary(orders, orderItems, now));
      setOrdersState(orders);
      setIsLoading(false);
    };

    void fetchDashboardData();
  }, []);

  return (
    <section className="dashboard-overview-content">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading && !errorMessage && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading dashboard data...
        </div>
      )}

      <section className="dashboard-section-block">
        <h3>Today's Summary</h3>
        <div className="summary-grid">
          {summary.map((item) => (
            <SummaryCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="dashboard-section-block">
        <h3>Sales Summary</h3>
        <div className="summary-grid">
          {sales.map((item) => (
            <SummaryCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="dashboard-section-block">
        <h3>Sales</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontWeight: 700 }}>Range:</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setPerformanceRange("weekly")}
              className={"sales-period-btn " + (performanceRange === "weekly" ? "active" : "")}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setPerformanceRange("monthly")}
              className={"sales-period-btn " + (performanceRange === "monthly" ? "active" : "")}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPerformanceRange("yearly")}
              className={"sales-period-btn " + (performanceRange === "yearly" ? "active" : "")}
            >
              Yearly
            </button>
          </div>
        </div>
        <DashboardChartsSection performanceData={performanceAggregated} />
      </section>
    </section>
  );
}
