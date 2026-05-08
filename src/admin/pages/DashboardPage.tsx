import { useEffect, useState, type Key } from "react";
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
      icon: FiCheckSquare,
      label: "Commission",
      value: pesoFormatter.format(totalCommission),
    },
    {
      icon: FiBarChart2,
      label: "Total Collection",
      value: pesoFormatter.format(totalCollection),
    },
    {
      icon: FiTruck,
      label: "Rider's Fee",
      value: pesoFormatter.format(totalRidersFee),
    },
    {
      icon: FiMapPin,
      label: "Amount to Remit",
      value: pesoFormatter.format(totalAmountToRemit),
    },
  ];
}

function buildPerformanceData(
  orders: OrderRow[],
  now: Date,
): PerformanceData[] {
  const months: Array<{
    key: string;
    label: string;
    orders: number;
    revenue: number;
  }> = [];

  for (let index = 0; index < 12; index += 1) {
    const current = new Date(now.getFullYear(), index, 1);
    months.push({
      key: `${current.getFullYear()}-${current.getMonth()}`,
      label: current.toLocaleString("en-US", { month: "short" }),
      orders: 0,
      revenue: 0,
    });
  }

  const monthMap = new Map(months.map((month) => [month.key, month]));

  for (const order of orders) {
    if (!order.created_at) continue;

    const orderDate = new Date(order.created_at);
    const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
    const month = monthMap.get(key);

    if (!month) continue;

    month.orders += 1;
    month.revenue += toAmount(order.total);
  }

  return months.map((month) => ({
    month: month.label,
    orders: month.orders,
    revenue: month.revenue,
    growth: 0,
  }));
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
              tickFormatter={(value: number) =>
                pesoFormatter.format(Number(value))
              }
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
                if (name === "revenue") {
                  return [
                    pesoFormatter.format(Number(value ?? 0)),
                    "Sales",
                  ] as const;
                }

                return [Number(value ?? 0), "Orders"] as const;
              }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #dce6cb",
                background: "#fbfdf4",
                boxShadow: "0 8px 20px rgba(34, 48, 20, 0.08)",
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Sales"
              fill="#1f8f38"
              barSize={26}
              radius={[8, 8, 0, 0]}
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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setPerformance(buildPerformanceData(orders, now));
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
        <div className="dashboard-sales-grid">
          {sales.map((item) => (
            <SummaryCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="dashboard-section-block">
        <h3>Monthly Sales</h3>
        <DashboardChartsSection performanceData={performance} />
      </section>
    </section>
  );
}
