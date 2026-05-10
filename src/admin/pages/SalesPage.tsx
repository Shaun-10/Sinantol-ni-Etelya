import { useMemo, useState, ChangeEvent, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FiBarChart2,
  FiCheckSquare,
  FiDollarSign,
  FiMapPin,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IconType } from "react-icons";

interface OrderByArea {
  id: number;
  clientName: string;
  contactNo: string;
  area: string;
  classic: number;
  spicy: number;
  amount: number;
}

interface MonthlySalesData {
  month: string;
  sales: number;
  orders: number;
}

interface FlavorData {
  name: string;
  value: number;
  color: string;
}

const flavorColorClass: Record<string, string> = {
  Classic: "bg-[#1f8f38]",
  Spicy: "bg-[#d08aa7]",
};

interface PriceItem {
  size: string;
  amount: number;
}

interface PriceGroup {
  flavor: string;
  prices: PriceItem[];
}

const initialPriceList: PriceGroup[] = [
  {
    flavor: "Classic",
    prices: [
      { size: "Small", amount: 120 },
      { size: "Medium", amount: 180 },
      { size: "Large", amount: 240 },
    ],
  },
  {
    flavor: "Spicy",
    prices: [
      { size: "Small", amount: 130 },
      { size: "Medium", amount: 190 },
      { size: "Large", amount: 250 },
    ],
  },
];

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function extractArea(address?: string | null): string {
  if (!address) {
    return "Unknown";
  }

  const segments = address
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length > 1) {
    return segments[segments.length - 1];
  }

  return address.trim();
}

const RADIAN = Math.PI / 180;

const renderPercentageLabel = (props: any): JSX.Element => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.56;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={34}
      fontWeight={800}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

interface SummaryItem {
  key?: React.Key;
  icon: IconType;
  value: string;
  label: string;
}

interface SummaryCardProps {
  key?: React.Key;
  icon: IconType;
  value: string;
  label: string;
}

function SummaryCard({
  icon: Icon,
  value,
  label,
}: SummaryCardProps): JSX.Element {
  return (
    <article className="sales-summary-card">
      <div className="sales-summary-card-top">
        <span className="sales-summary-icon" aria-hidden="true">
          <Icon />
        </span>
        <div>
          <p className="sales-summary-title">{label}</p>
        </div>
      </div>
      <p className="sales-summary-amount">{value}</p>
    </article>
  );
}

interface OrdersByAreaSectionProps {
  orders: OrderByArea[];
}

function OrdersByAreaSection({
  orders,
}: OrdersByAreaSectionProps): JSX.Element {
  const [selectedArea, setSelectedArea] = useState<string>("All Areas");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const uniqueAreas = useMemo(() => {
    const areas = new Set(
      orders.map((order) => order.area?.trim()).filter(Boolean),
    );
    return [
      "All Areas",
      ...Array.from(areas).sort((a, b) => a.localeCompare(b)),
    ];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (selectedArea === "All Areas") {
      return orders;
    }

    const normalizedSelectedArea = selectedArea.trim().toLowerCase();
    return orders.filter(
      (order) => order.area?.trim().toLowerCase() === normalizedSelectedArea,
    );
  }, [orders, selectedArea]);

  const totalPages = Math.ceil(filteredOrders.length / 5);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * 5,
    currentPage * 5,
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

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedArea]);

  return (
    <section
      className="sales-panel"
      aria-label="Orders by area"
    >
      <div className="sales-panel-header">
        <h3>Orders by Area</h3>

        <label className="sales-area-filter" htmlFor="sales-area-select">
          <span>Filter by:</span>
          <select
            id="sales-area-select"
            value={selectedArea}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setSelectedArea(event.target.value)
            }
          >
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sales-table-wrap">
        <Table className="sales-table">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Contact No.</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Classic</TableHead>
              <TableHead>Spicy</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.clientName}</TableCell>
                <TableCell>{order.contactNo}</TableCell>
                <TableCell>{order.area}</TableCell>
                <TableCell>{order.classic}</TableCell>
                <TableCell>{order.spicy}</TableCell>
                <TableCell>{pesoFormatter.format(order.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="sales-list-footer">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <button
                type="button"
                onClick={handlePreviousPage}
                className="sales-page-btn secondary"
              >
                &lt; Previous
              </button>
            )}
            {currentPage < totalPages && (
              <button
                type="button"
                onClick={handleNextPage}
                className="sales-page-btn"
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

interface MonthlySalesSectionProps {
  data: MonthlySalesData[];
}

function MonthlySalesSection({ data }: MonthlySalesSectionProps): JSX.Element {
  return (
    <section
      className="sales-panel"
      aria-label="Monthly sales chart"
    >
      <div className="sales-panel-header">
        <h3>Monthly Sales</h3>
      </div>

      <div className="sales-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
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
              tickFormatter={(value: number) => `PHP ${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#7a8b6f"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: unknown) => {
                return [String(value), "Orders"] as const;
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
              dataKey="sales"
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

function FlavorBreakdownCard({
  flavorData,
}: {
  flavorData: FlavorData[];
}): JSX.Element {
  return (
    <article
      className="sales-pie-card"
      aria-label="Sales flavor breakdown"
    >
      <div className="sales-panel-header">
        <h3>Sales by Flavor</h3>
      </div>

      <div className="sales-pie-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={flavorData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={120}
              stroke="#ffffff"
              strokeWidth={3}
              label={renderPercentageLabel}
              labelLine={false}
            >
              {flavorData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="sales-pie-legend" role="list" aria-label="Flavor legend">
        {flavorData.map((item) => (
          <div
            className="sales-pie-legend-item"
            key={item.name}
            role="listitem"
          >
            <span
              className={`sales-pie-dot ${flavorColorClass[item.name] ?? "bg-gray-300"}`}
              aria-hidden="true"
            />
            <span>{item.name}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function PriceListCard(): JSX.Element {
  return (
    <article
      className="sales-price-card"
      aria-label="Product price list"
    >
      <header className="sales-price-header">
        <h3>Price List</h3>
      </header>

      <div className="sales-price-table-wrap">
        <Table className="sales-price-table">
          <TableHeader>
            <TableRow>
              <TableHead>Flavor</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialPriceList.map((group) =>
              group.prices.map((item, priceIndex) => (
                <TableRow key={`${group.flavor}-${item.size}`}>
                  {priceIndex === 0 ? (
                    <TableCell
                      rowSpan={group.prices.length}
                      className="font-semibold align-top"
                    >
                      {group.flavor}
                    </TableCell>
                  ) : null}

                  <TableCell>{item.size}</TableCell>

                  <TableCell>
                    {pesoFormatter.format(item.amount)}
                  </TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>
      </div>
    </article>
  );
}

interface ProductVariant {
  flavor: string;
}

interface OrderItem {
  order_id: string;
  quantity: number;
  product_variants: ProductVariant | null;
}

interface Order {
  id: number;
  created_at: string;
  address: string;
  status: string;
  total: number;
  delivery_fee: number;
  customer_name: string;
  contact: string;
  rider?: {
    area: string;
  };
}

function buildSalesSummary(
  orders: Order[],
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
    const amount = Number(order.total || 0);
    const deliveryFee = Number(order.delivery_fee ?? 0);
    const quantity = orderQuantityMap.get(order.id.toString()) || 0;

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

export default function SalesPage(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [flavorTotals, setFlavorTotals] = useState({ classic: 0, spicy: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch orders + items
  useEffect(() => {
    const fetchSalesData = async (): Promise<void> => {
      setIsLoading(true);

      const { data: ordersData, error: ordersError } = await supabase.from(
        "orders",
      ).select(`
          id,
          created_at,
          address,
          status,
          total,
          delivery_fee,
          customer_name,
          contact,
rider:riders (
    area
    )
        `);

      if (ordersError) {
        console.error("Orders fetch error:", ordersError);
        setIsLoading(false);
        return;
      }

      const { data: itemsData, error: itemsError } = await supabase.from(
        "order_items",
      ).select(`
    order_id,
    quantity,
    product_variants (
      flavor
    )
  `);

      if (itemsError) {
        console.error("Order items fetch error:", itemsError);
        setIsLoading(false);
        return;
      }

      setOrders((ordersData as unknown as Order[]) ?? []);
      setOrderItems((itemsData as unknown as OrderItem[]) ?? []);
      console.log("ITEMS DEBUG:", itemsData);
      setIsLoading(false);
    };

    fetchSalesData();
  }, []);

  // ✅ Compute Classic & Spicy totals (GLOBAL - number of orders with each flavor)
  useEffect(() => {
    const classicOrders = new Set<string>();
    const spicyOrders = new Set<string>();

    orderItems.forEach((item) => {
      const flavor = item.product_variants?.flavor ?? "";
      const f = String(flavor ?? "")
        .toLowerCase()
        .trim();

      if (f === "classic") {
        classicOrders.add(item.order_id);
      }
      if (f === "spicy") {
        spicyOrders.add(item.order_id);
      }
    });

    setFlavorTotals({ classic: classicOrders.size, spicy: spicyOrders.size });
  }, [orderItems]);

  // ✅ Sales summary
  const salesSummary = useMemo(
    () => buildSalesSummary(orders, orderItems, new Date()),
    [orders, orderItems],
  );

  // ✅ Orders by area (PER ORDER classic/spicy)
  const ordersByAreaData: OrderByArea[] = useMemo(() => {
    return orders.map((order: Order, index: number) => {
      let classic = 0;
      let spicy = 0;

      const orderItemsForOrder = orderItems.filter(
        (item) => String(item.order_id) === String(order.id),
      );
      orderItemsForOrder.forEach((item) => {
        const flavor = item.product_variants?.flavor;
        const f = String(flavor ?? "")
          .toLowerCase()
          .trim();
        const qty = Number(item.quantity ?? 0);

        if (f === "classic") {
          classic += qty;
        }

        if (f === "spicy") {
          spicy += qty;
        }
      });

      const riderArea = order.rider?.area?.trim();
      const addressArea = extractArea(order.address)?.trim();

      return {
        id: index + 1,
        clientName: order.customer_name || "N/A",
        contactNo: order.contact || "N/A",
        area: riderArea || addressArea || "Unknown",
        classic,
        spicy,
        amount: Number(order.total || 0),
      };
    });
  }, [orders, orderItems]);

  // ✅ Monthly sales
  const monthlySalesData: MonthlySalesData[] = useMemo(() => {
    const map = new Map<
      string,
      {
        monthIndex: number;
        month: string;
        sales: number;
        orders: number;
      }
    >();

    orders.forEach((order: Order) => {
      if (!order.created_at) return;

      const date = new Date(order.created_at);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();

      const key = `${year}-${monthIndex}`;

      if (!map.has(key)) {
        map.set(key, {
          monthIndex,
          month: date.toLocaleString("en-US", { month: "short" }),
          sales: 0,
          orders: 0,
        });
      }

      const entry = map.get(key)!;
      entry.sales += Number(order.total || 0);
      entry.orders += 1;
    });

    return Array.from(map.values())
      .sort((a, b) => a.monthIndex - b.monthIndex)
      .map(({ month, sales, orders }) => ({
        month,
        sales,
        orders,
      }));
  }, [orders]);

  // ✅ Pie chart data (RAW values, not %)
  const flavorData: FlavorData[] = useMemo(() => {
    return [
      { name: "Classic", value: flavorTotals.classic, color: "#1f8f38" },
      { name: "Spicy", value: flavorTotals.spicy, color: "#d08aa7" },
    ];
  }, [flavorTotals]);

  if (isLoading) {
    return (
      <section className="sales-main-content">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading sales data...
        </div>
      </section>
    );
  }

  return (
    <section className="sales-main-content">
      <header className="sales-header">
        <h2>
          <FiBarChart2 />
          Sales
        </h2>
      </header>

      <div className="sales-layout-grid">
        <div className="sales-left-column">
          <section className="sales-summary-grid" aria-label="Sales summary">
            {salesSummary.map((item, index) => (
              <SummaryCard
                key={index}
                icon={item.icon}
                value={item.value}
                label={item.label}
              />
            ))}
          </section>
          <OrdersByAreaSection orders={ordersByAreaData} />
          <MonthlySalesSection data={monthlySalesData} />
        </div>

        <div className="sales-right-column">
          <FlavorBreakdownCard flavorData={flavorData} />
          <PriceListCard />
        </div>
      </div>
    </section>
  );
}
