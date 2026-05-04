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
      className="sales-summary-grid"
      aria-label="Sales summary cards"
    >
      {salesSummaryCards.map((card) => {
        const CardIcon = card.icon;

        return (
          <article
            key={card.id}
            className="sales-summary-card"
          >
            <div className="sales-summary-card-top">
              <span className="sales-summary-icon" aria-hidden="true">
                <CardIcon />
              </span>

              <div>
                <p className="sales-summary-title">{card.title}</p>
                <p className="sales-summary-subtitle">{card.subtitle}</p>
              </div>
            </div>

            <p className="sales-summary-amount">{card.amount}</p>
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
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * 10, currentPage * 10);

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

        <label
          className="sales-area-filter"
          htmlFor="sales-area-select"
        >
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
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Name</th>
              <th>Contact No.</th>
              <th>Area</th>
              <th>Classic</th>
              <th>Spicy</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.clientName}</td>
                <td>{order.contactNo}</td>
                <td>{order.area}</td>
                <td>{order.classic}</td>
                <td>{order.spicy}</td>
                <td>{pesoFormatter.format(order.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="sales-list-footer">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {currentPage > 1 && (
              <button
                type="button"
                onClick={handlePreviousPage}
                className="sales-page-btn secondary"
              >
                Previous
              </button>
            )}
            {currentPage < totalPages && (
              <button
                type="button"
                onClick={handleNextPage}
                className="sales-page-btn"
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
              outerRadius={152}
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
            <div
              className="sales-pie-dot"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

interface PriceListCardProps {
  priceList: PriceGroup[];
  onUpdate: (priceList: PriceGroup[]) => void;
}

function PriceListCard({ priceList, onUpdate }: PriceListCardProps): JSX.Element {
  const [draftPriceList, setDraftPriceList] = useState<PriceGroup[]>(priceList);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartEdit = (): void => {
    setDraftPriceList(priceList);
    setIsDialogOpen(true);
  };

  const handleCancelEdit = (): void => {
    setIsDialogOpen(false);
  };

  const handleSaveEdit = (): void => {
    onUpdate(draftPriceList);
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
        className="sales-price-card"
        aria-label="Product price list"
      >
        <header className="sales-price-header">
          <h3>Price List</h3>
          <button
            type="button"
            className="sales-price-edit-btn"
            onClick={handleStartEdit}
          >
            Edit
          </button>
        </header>

        <div className="sales-price-table-wrap">
          <table className="sales-price-table">
            <thead>
              <tr>
                <th>Flavor</th>
                <th>Sizes</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {priceList.map((group) =>
                group.prices.map((item, priceIndex) => (
                  <tr key={`${group.flavor}-${item.size}`}>
                    {priceIndex === 0 ? (
                      <td rowSpan={group.prices.length}>
                        {group.flavor}
                      </td>
                    ) : null}
                    <td>{item.size}</td>
                    <td>{pesoFormatter.format(item.amount)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </article>

      {isDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setIsDialogOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 20px", fontSize: "1.2rem", fontWeight: 700 }}>
              Edit Price List
            </h2>

            <div style={{ overflowY: "auto", marginBottom: "20px", maxHeight: "400px" }}>
              <table className="sales-price-table">
                <thead>
                  <tr>
                    <th>Flavor</th>
                    <th>Sizes</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPriceList.map((group, flavorIndex) =>
                    group.prices.map((item, priceIndex) => (
                      <tr key={`${group.flavor}-${item.size}`}>
                        {priceIndex === 0 ? (
                          <td rowSpan={group.prices.length}>
                            {group.flavor}
                          </td>
                        ) : null}
                        <td>{item.size}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="sales-price-input"
                            value={item.amount}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              handlePriceChange(
                                flavorIndex,
                                priceIndex,
                                event.target.value,
                              )
                            }
                          />
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <button
                type="button"
                className="sales-price-cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sales-price-edit-btn"
                onClick={handleSaveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SalesPage(): JSX.Element {
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [flavorTotals, setFlavorTotals] = useState({ classic: 0, spicy: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [priceList, setPriceList] = useState<PriceGroup[]>(initialPriceList);

  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, order_date, address, status, total, customer_name, contact, rider_id");

      if (ordersError) {
        console.error("Sales fetch error:", ordersError);
        setIsLoading(false);
        return;
      }

      const { data: ridersData, error: ridersError } = await supabase
        .from("riders")
        .select("id, location");

      if (ridersError) {
        console.error("Riders fetch error:", ridersError);
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("quantity, product_variants!inner(flavor)")
        .eq("product_variants.flavor", "classic");

      if (itemsError) {
        console.error("Items fetch error:", itemsError);
      }

      const classicTotal = itemsData ? itemsData.reduce((sum, item) => sum + item.quantity, 0) : 0;

      const { data: spicyData, error: spicyError } = await supabase
        .from("order_items")
        .select("quantity, product_variants!inner(flavor)")
        .eq("product_variants.flavor", "spicy");

      if (spicyError) {
        console.error("Spicy fetch error:", spicyError);
      }

      const spicyTotal = spicyData ? spicyData.reduce((sum, item) => sum + item.quantity, 0) : 0;

      setOrders(ordersData ?? []);
      setRiders(ridersData ?? []);
      setFlavorTotals({ classic: classicTotal, spicy: spicyTotal });
      setIsLoading(false);
    };

    fetchSalesData();
  }, []);

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

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

  const ordersByAreaData: OrderByArea[] = useMemo(() => {
    const riderMap = new Map(riders.map((rider) => [rider.id, rider]));
    
    return orders.map((order, index) => {
      const rider = riderMap.get(order.rider_id);
      return {
        id: index + 1,
        clientName: order.customer_name || "N/A",
        contactNo: order.contact || "N/A",
        area: rider?.location || "Unknown",
        classic: 0,
        spicy: 0,
        amount: Number(order.total || 0),
      };
    });
  }, [orders, riders]);

  const monthlySalesData: MonthlySalesData[] = useMemo(() => {
    const map = new Map<string, MonthlySalesData>();

    orders.forEach(order => {
      if (!order.order_date) return;

      const date = new Date(order.order_date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!map.has(key)) {
        map.set(key, {
          month: date.toLocaleString("en-US", { month: "short" }),
          sales: 0,
          orders: 0,
        });
      }

      const item = map.get(key)!;
      item.sales += Number(order.total || 0);
      item.orders += 1;
    });

    return Array.from(map.values());
  }, [orders]);

  const flavorData: FlavorData[] = useMemo(() => {
    const { classic, spicy } = flavorTotals;
    const total = classic + spicy;

    if (total === 0) {
      return [
        { name: "Classic", value: 0, color: "#1f8f38" },
        { name: "Spicy", value: 0, color: "#d08aa7" },
      ];
    }

    return [
      {
        name: "Classic",
        value: Math.round((classic / total) * 100),
        color: "#1f8f38",
      },
      {
        name: "Spicy",
        value: Math.round((spicy / total) * 100),
        color: "#d08aa7",
      },
    ];
  }, [flavorTotals]);

  if (isLoading) {
    return (
      <div className="sales-main-content">
        Loading sales data...
      </div>
    );
  }

  return (
    <section className="sales-main-content">
      <header className="sales-header">
        <h2>
          <FiShoppingCart aria-hidden="true" />
          SALES
        </h2>
      </header>

      <div className="sales-layout-grid">
        <div className="sales-left-column">
          <SalesSummarySection salesSummaryCards={salesSummaryCards} />
          <OrdersByAreaSection orders={ordersByAreaData} />
          <MonthlySalesSection data={monthlySalesData} />
        </div>

        <div className="sales-right-column">
          <FlavorBreakdownCard flavorData={flavorData} />
          <PriceListCard priceList={priceList} onUpdate={setPriceList} />
        </div>
      </div>
    </section>
  );
}
