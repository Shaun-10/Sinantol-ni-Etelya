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
  BarChart,
} from 'recharts';

const performanceData = [
  { month: 'Oct', orders: 12, revenue: 31, growth: 8 },
  { month: 'Nov', orders: 19, revenue: 43, growth: 13 },
  { month: 'Dec', orders: 32, revenue: 62, growth: 18 },
  { month: 'Jan', orders: 34, revenue: 65, growth: 20 },
  { month: 'Feb', orders: 45, revenue: 83, growth: 26 },
  { month: 'Mar', orders: 41, revenue: 75, growth: 22 },
  { month: 'Apr', orders: 30, revenue: 58, growth: 16 },
];

const breakdownData = [
  { month: 'Oct', completed: 10, failed: 2, cancelled: 1 },
  { month: 'Nov', completed: 14, failed: 3, cancelled: 2 },
  { month: 'Dec', completed: 21, failed: 5, cancelled: 3 },
  { month: 'Jan', completed: 23, failed: 4, cancelled: 3 },
  { month: 'Feb', completed: 30, failed: 6, cancelled: 4 },
  { month: 'Mar', completed: 26, failed: 5, cancelled: 4 },
  { month: 'Apr', completed: 20, failed: 4, cancelled: 3 },
];

export default function DashboardCharts() {
  return (
    <section className="charts-wrap" aria-label="Sales and orders graph">
      <div className="chart-block chart-block-main">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={performanceData} margin={{ top: 15, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d8dfbe" />
            <XAxis dataKey="month" stroke="#6b7442" />
            <YAxis yAxisId="left" stroke="#6b7442" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7442" />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e9d2',
                boxShadow: '0 8px 20px rgba(37, 52, 21, 0.08)',
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="orders" barSize={20} fill="#2f9ad6" radius={[8, 8, 0, 0]} />
            <Bar yAxisId="left" dataKey="revenue" barSize={20} fill="#a8d56d" radius={[8, 8, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growth"
              stroke="#e57fbe"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-block chart-block-secondary">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={breakdownData} margin={{ top: 15, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d8dfbe" />
            <XAxis dataKey="month" stroke="#6b7442" />
            <YAxis stroke="#6b7442" />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e9d2',
                boxShadow: '0 8px 20px rgba(37, 52, 21, 0.08)',
              }}
            />
            <Legend />
            <Bar dataKey="completed" stackId="orders" fill="#2f9ad6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="failed" stackId="orders" fill="#c95f5f" />
            <Bar dataKey="cancelled" stackId="orders" fill="#f0a942" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
