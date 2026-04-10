import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const flavorData = [
  { name: 'Classic', value: 60, color: '#f4c425' },
  { name: 'Spicy', value: 40, color: '#ef4036' },
];

const RADIAN = Math.PI / 180;

const renderPercentageLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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

export default function SalesFlavorPieCard() {
  return (
    <article className="sales-pie-card" aria-label="Sales flavor breakdown">
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
          <div className="sales-pie-legend-item" key={item.name} role="listitem">
            <span className="sales-pie-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
