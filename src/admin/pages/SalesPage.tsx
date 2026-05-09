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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <article className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl text-gray-600" aria-hidden="true">
          <Icon />
        </span>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
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

  const totalPages = Math.ceil(filteredOrders.length / 10);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * 10,
    currentPage * 10,
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
      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col"
      aria-label="Orders by area"
    >
      <div className="p-4 border-b border-gray-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Orders by Area</h3>

        <label className="flex items-center gap-3" htmlFor="sales-area-select">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <select
            id="sales-area-select"
            value={selectedArea}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setSelectedArea(event.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-x-auto max-h-[320px]">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-left">ID</TableHead>
                <TableHead className="w-[220px] text-left">
                  Client Name
                </TableHead>
                <TableHead className="w-[160px] text-left">
                  Contact No.
                </TableHead>
                <TableHead className="w-[140px] text-left">Area</TableHead>
                <TableHead className="w-[80px] text-center">Classic</TableHead>
                <TableHead className="w-[80px] text-center">Spicy</TableHead>
                <TableHead className="w-[120px] text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="w-[60px]">{order.id}</TableCell>

                  <TableCell className="w-[220px] truncate whitespace-nowrap">
                    {order.clientName}
                  </TableCell>

                  <TableCell className="w-[160px] truncate whitespace-nowrap">
                    {order.contactNo}
                  </TableCell>

                  <TableCell className="w-[140px] truncate whitespace-nowrap">
                    {order.area}
                  </TableCell>

                  <TableCell className="w-[80px] text-center">
                    {order.classic}
                  </TableCell>

                  <TableCell className="w-[80px] text-center">
                    {order.spicy}
                  </TableCell>

                  <TableCell className="w-[120px] text-right font-semibold">
                    {pesoFormatter.format(order.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <button
                type="button"
                onClick={handlePreviousPage}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition"
              >
                Previous
              </button>
            )}
            {currentPage < totalPages && (
              <button
                type="button"
                onClick={handleNextPage}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
              >
                Next Page
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
      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      aria-label="Monthly sales chart"
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Sales</h3>
      </div>

      <div className="p-4 h-80">
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
      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      aria-label="Sales flavor breakdown"
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Sales by Flavor</h3>
      </div>

      <div className="p-4 h-80">
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

      <div className="p-4 space-y-2" role="list" aria-label="Flavor legend">
        {flavorData.map((item) => (
          <div
            className="flex items-center gap-3 text-sm"
            key={item.name}
            role="listitem"
          >
            <span
              className={`w-3 h-3 rounded-full inline-block ${flavorColorClass[item.name] ?? "bg-gray-300"}`}
              aria-hidden="true"
            />
            <span className="text-gray-700">{item.name}</span>
            <span className="ml-auto font-semibold text-gray-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function PriceListCard(): JSX.Element {
  const [priceList, setPriceList] = useState<PriceGroup[]>(initialPriceList);
  const [draftPriceList, setDraftPriceList] =
    useState<PriceGroup[]>(initialPriceList);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartEdit = (): void => {
    setDraftPriceList(priceList);
    setIsDialogOpen(true);
  };

  const handleCancelEdit = (): void => {
    setIsDialogOpen(false);
  };

  const handleSaveEdit = (): void => {
    setPriceList(draftPriceList);
    setIsDialogOpen(false);
  };

  const handlePriceChange = (
    flavorIndex: number,
    priceIndex: number,
    nextValue: string,
  ): void => {
    const numericValue = Number.parseInt(nextValue, 10);

    if (Number.isNaN(numericValue) && nextValue !== "") {
      return;
    }

    setDraftPriceList((current) =>
      current.map((group, groupIndex) => {
        if (groupIndex !== flavorIndex) {
          return group;
        }

        return {
          ...group,
          prices: group.prices.map((price, itemIndex) => {
            if (itemIndex !== priceIndex) {
              return price;
            }

            return {
              ...price,
              amount: nextValue === "" ? 0 : Math.max(0, numericValue),
            };
          }),
        };
      }),
    );
  };

  const displayedPriceList = isDialogOpen ? draftPriceList : priceList;

  return (
    <>
      <article
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        aria-label="Product price list"
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Price List</h3>
          <button
            type="button"
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition font-semibold"
            onClick={handleStartEdit}
          >
            Edit
          </button>
        </header>

        <div className="overflow-x-auto">
          <Table className="w-full text-sm table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Flavor</TableHead>
                <TableHead className="w-[120px]">Sizes</TableHead>
                <TableHead className="w-[120px] text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceList.map((group) =>
                group.prices.map((item, priceIndex) => (
                  <TableRow key={`${group.flavor}-${item.size}`}>
                    {priceIndex === 0 ? (
                      <TableCell
                        rowSpan={group.prices.length}
                        className="font-medium align-top"
                      >
                        {group.flavor}
                      </TableCell>
                    ) : null}

                    <TableCell className="w-[120px]">{item.size}</TableCell>

                    <TableCell className="w-[120px] text-right">
                      {pesoFormatter.format(item.amount)}
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </div>
      </article>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Price List</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flavor</TableHead>
                  <TableHead>Sizes</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPriceList.map((group, flavorIndex) =>
                  group.prices.map((item, priceIndex) => (
                    <TableRow key={`${group.flavor}-${item.size}`}>
                      {priceIndex === 0 ? (
                        <TableCell rowSpan={group.prices.length}>
                          {group.flavor}
                        </TableCell>
                      ) : null}
                      <TableCell>{item.size}</TableCell>
                      <TableCell>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-20 text-center"
                          value={item.amount}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            handlePriceChange(
                              flavorIndex,
                              priceIndex,
                              event.target.value,
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <button
              type="button"
              className="px-3 py-2 bg-gray-300 text-gray-900 rounded text-sm hover:bg-gray-400 transition"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
              onClick={handleSaveEdit}
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ProductVariant {
  flavor: string;
}

interface OrderItem {
  order_id: string;
  quantity: number;
  product_variants: ProductVariant | ProductVariant[];
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
          product_variants:product_variants!order_items_product_variant_id_fkey (
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
      console.log("ORDERS DEBUG:", JSON.stringify(ordersData, null, 2));
      setIsLoading(false);
    };

    fetchSalesData();
  }, []);

  // ✅ Compute Classic & Spicy totals (GLOBAL)
  useEffect(() => {
    let classic = 0;
    let spicy = 0;

    orderItems.forEach((item) => {
      const qty = Number(item.quantity ?? 0);
      const variants = Array.isArray(item.product_variants)
        ? item.product_variants
        : [item.product_variants];
      const flavor = variants[0]?.flavor;

      const f = String(flavor || "").toLowerCase();

      if (f === "classic") classic += qty;
      if (f === "spicy") spicy += qty;
    });

    setFlavorTotals({ classic, spicy });
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
        (item) => item.order_id === order.id.toString(),
      );
      orderItemsForOrder.forEach((item) => {
        const qty = Number(item.quantity ?? 0);
        const variants = Array.isArray(item.product_variants)
          ? item.product_variants
          : [item.product_variants];
        const flavor = variants[0]?.flavor;

        const f = String(flavor || "").toLowerCase();

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
    return <div className="p-6 text-gray-600">Loading sales data...</div>;
  }

  return (
    <section className="min-h-full flex flex-col space-y-6">
      <h2 className="text-3xl font-bold">Sales</h2>

      <div className="grid grid-cols-3 gap-6 items-stretch min-h-full">
        <div className="col-span-2 flex flex-col gap-6 h-full min-h-0">
          <section
            className="grid grid-cols-3 gap-6"
            aria-label="Sales summary"
          >
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

        <div className="col-span-1 flex flex-col gap-6 h-full min-h-0">
          <FlavorBreakdownCard flavorData={flavorData} />
          <PriceListCard />
        </div>
      </div>
    </section>
  );
}
