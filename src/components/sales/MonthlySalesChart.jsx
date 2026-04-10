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
} from 'recharts';

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function MonthlySalesChart({ data }) {
  return (
    <section className="sales-panel" aria-label="Monthly sales chart">
      <div className="sales-panel-header">
        <h3>Monthly Sales</h3>
      </div>

      <div className="sales-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 6 }}>
            <CartesianGrid stroke="#dce6cb" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke="#57674f" tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#57674f"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₱${value}`}
            />
            <YAxis yAxisId="right" orientation="right" stroke="#7a8b6f" tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'Sales') {
                  return [pesoFormatter.format(value), name];
                }

                return [value, name];
              }}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #dce6cb',
                background: '#fbfdf4',
                boxShadow: '0 8px 20px rgba(34, 48, 20, 0.08)',
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#1f8f38" barSize={26} radius={[8, 8, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#d08aa7"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#d08aa7' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
