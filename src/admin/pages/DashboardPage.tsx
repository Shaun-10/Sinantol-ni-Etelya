import { useEffect, useState } from "react";
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
  activeRiders: number
): SummaryItem[] {
  const startOfToday = getStartOfDay(now);

  const todaysOrders = orders.filter((order) => {
    if (!order.created_at) return false;
    return new Date(order.created_at) >= startOfToday;
  });

  const completedToday = todaysOrders.filter(
    (order) => normalizeStatus(order.status) === "delivered"
  ).length;

  const assignedDeliveries = todaysOrders.filter(
    (order) => normalizeStatus(order.status) === "waiting" && Boolean(order.rider_id)
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

function buildSalesSummary(orders: OrderRow[], now: Date): SummaryItem[] {
  const startOfToday = getStartOfDay(now);
  const startOfThisMonth = getStartOfMonth(now);

  let totalCollection = 0;
  let todaySales = 0;
  let monthSales = 0;

  for (const order of orders) {
    if (!order.created_at) continue;

    const orderDate = new Date(order.created_at);
    const amount = toAmount(order.total);

    totalCollection += amount;

    if (orderDate >= startOfToday) {
      todaySales += amount;
    }

    if (orderDate >= startOfThisMonth) {
      monthSales += amount;
    }
  }

  const averageOrderValue = orders.length > 0 ? totalCollection / orders.length : 0;

  return [
    {
      icon: FiPackage,
      label: "Total Collection",
      value: pesoFormatter.format(totalCollection),
    },
    {
      icon: FiDollarSign,
      label: "Sales Today",
      value: pesoFormatter.format(todaySales),
    },
    {
      icon: FiBarChart2,
      label: "Sales This Month",
      value: pesoFormatter.format(monthSales),
    },
    {
      icon: FiCheckSquare,
      label: "Average Order Value",
      value: pesoFormatter.format(averageOrderValue),
    },
    {
      icon: FiTruck,
      label: "Total Orders",
      value: String(orders.length),
    },
  ];
}

function buildPerformanceData(orders: OrderRow[], now: Date): PerformanceData[] {
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

function SummaryCard({ icon: Icon, value, label }: SummaryItem): JSX.Element {
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
              tickFormatter={(value: number) => pesoFormatter.format(Number(value))}
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
                  return [pesoFormatter.format(Number(value ?? 0)), "Sales"] as const;
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

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching dashboard data:", error);
        setErrorMessage(
          `Failed to load dashboard data. ${error.message ?? "Please check the database connection."}`
        );
        setIsLoading(false);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Dashboard data fetch returned unexpected response:", data);
        setErrorMessage("Failed to load dashboard data. Unexpected response format.");
        setIsLoading(false);
        return;
      }

      const orders = data as OrderRow[];
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
      setSales(buildSalesSummary(orders, now));
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
