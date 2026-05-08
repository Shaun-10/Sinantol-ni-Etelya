import { useMemo, useState, ChangeEvent, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FiCalendar, FiShoppingCart } from "react-icons/fi";
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

interface SalesSummaryCard {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface FlavorData {
  name: string;
  value: number;
  color: string;
}

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

interface SalesSummarySectionProps {
  salesSummaryCards: SalesSummaryCard[];
}

function SalesSummarySection({
  salesSummaryCards,
}: SalesSummarySectionProps): JSX.Element {
  return (
    <section
      className="grid grid-cols-2 gap-6"
      aria-label="Sales summary cards"
    >
      {salesSummaryCards.map((card) => {
        const CardIcon = card.icon;

        return (
          <article
            key={card.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl text-gray-600" aria-hidden="true">
                <CardIcon />
              </span>

              <div>
                <p className="font-semibold text-gray-700">{card.title}</p>
                <p className="text-sm text-gray-500">{card.subtitle}</p>
              </div>
            </div>

            <p className="text-2xl font-bold text-gray-900">{card.amount}</p>
          </article>
        );
      })}
    </section>
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
    const areas = new Set(orders.map((order) => order.area).filter(Boolean));
    return ["All Areas", ...Array.from(areas).sort()];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (selectedArea === "All Areas") {
      return orders;
    }

    return orders.filter((order) => order.area === selectedArea);
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
      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      aria-label="Orders by area"
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Orders by Area</h3>

        <label
          className="mt-4 flex items-center gap-3"
          htmlFor="sales-area-select"
        >
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

      <div className="overflow-x-auto">
        <Table>
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
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flavor</TableHead>
                <TableHead>Sizes</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceList.map((group) =>
                group.prices.map((item, priceIndex) => (
                  <TableRow key={`${group.flavor}-${item.size}`}>
                    {priceIndex === 0 ? (
                      <TableCell rowSpan={group.prices.length}>
                        {group.flavor}
                      </TableCell>
                    ) : null}
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{pesoFormatter.format(item.amount)}</TableCell>
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

export default function SalesPage(): JSX.Element {
  const [orders, setOrders] = useState<any[]>([]);
  const [flavorTotals, setFlavorTotals] = useState({ classic: 0, spicy: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch orders + items
  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);

      const { data, error } = await supabase.from("orders").select(`
          id,
          created_at,
          address,
          status,
          total,
          customer_name,
          contact,
          order_items (
            quantity,
            product_variants:product_variants!order_items_product_variant_id_fkey (
              flavor
            )
          )
        `);

      if (error) {
        console.error("Sales fetch error:", error);
        setIsLoading(false);
        return;
      }

      setOrders(data ?? []);
      console.log("ORDERS DEBUG:", JSON.stringify(data, null, 2));
      setIsLoading(false);
    };

    fetchSalesData();
  }, []);

  // ✅ Compute Classic & Spicy totals (GLOBAL)
  useEffect(() => {
    let classic = 0;
    let spicy = 0;

    orders.forEach((order) => {
      order.order_items?.forEach((item: any) => {
        const qty = Number(item.quantity ?? 0);
        const flavor = item.product_variants?.flavor;

        if (flavor === "classic") classic += qty;
        if (flavor === "spicy") spicy += qty;
      });
    });

    setFlavorTotals({ classic, spicy });
  }, [orders]);

  // ✅ Total sales
  const totalSales = useMemo(
    () => orders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    [orders],
  );

  // ✅ Summary cards
  const salesSummaryCards: SalesSummaryCard[] = [
    {
      id: "total-sales",
      title: "Total Sales",
      subtitle: "All Time",
      amount: pesoFormatter.format(totalSales),
      icon: FiShoppingCart,
    },
    {
      id: "total-orders",
      title: "Total Orders",
      subtitle: "All Time",
      amount: String(orders.length),
      icon: FiCalendar,
    },
  ];

  // ✅ Orders by area (PER ORDER classic/spicy)
  const ordersByAreaData: OrderByArea[] = useMemo(() => {
    return orders.map((order, index) => {
      let classic = 0;
      let spicy = 0;

      order.order_items?.forEach((item: any) => {
        const qty = Number(item.quantity ?? 0);
        const flavor = item.product_variants?.flavor;

        if (flavor === "classic") {
          classic += qty;
        }

        if (flavor === "spicy") {
          spicy += qty;
        }
      });

      return {
        id: index + 1,
        clientName: order.customer_name || "N/A",
        contactNo: order.contact || "N/A",
        area: extractArea(order.address),
        classic,
        spicy,
        amount: Number(order.total || 0),
      };
    });
  }, [orders]);

  // ✅ Monthly sales
  const monthlySalesData: MonthlySalesData[] = useMemo(() => {
    const map = new Map<string, MonthlySalesData>();

    orders.forEach((order) => {
      if (!order.created_at) return;

      const date = new Date(order.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!map.has(key)) {
        map.set(key, {
          month: date.toLocaleString("en-US", { month: "short" }),
          sales: 0,
          orders: 0,
        });
      }

      const entry = map.get(key)!;
      entry.sales += Number(order.total || 0);
      entry.orders += 1;
    });

    return Array.from(map.values());
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
    <section className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold">Sales</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <SalesSummarySection salesSummaryCards={salesSummaryCards} />
          <OrdersByAreaSection orders={ordersByAreaData} />
          <MonthlySalesSection data={monthlySalesData} />
        </div>

        <div className="col-span-1 space-y-6">
          <FlavorBreakdownCard flavorData={flavorData} />
          <PriceListCard />
        </div>
      </div>
    </section>
  );
}
