'use client';

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const COLORS = ['#1E3A5F', '#F5A623', '#2ECC71', '#E74C3C', '#9B59B6', '#3498DB'];

export function ReportsCharts({
  monthly,
  breakdown,
}: {
  monthly: { month: string; revenue: number; expenses: number; net: number }[];
  breakdown: { name: string; value: number }[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-4">الإيرادات والمصروفات (6 أشهر)</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="إيرادات" stroke="#2ECC71" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" name="مصروفات" stroke="#E74C3C" strokeWidth={2} />
              <Line type="monotone" dataKey="net" name="صافي" stroke="#1E3A5F" strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-4">المصروفات حسب التصنيف</h2>
        <div className="h-64">
          {breakdown.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center pt-20">لا توجد بيانات.</p>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" outerRadius={80} label>
                  {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-card border border-neutral-200 p-5 md:col-span-2">
        <h2 className="font-semibold mb-4">الإيرادات شهرياً</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" name="إيرادات" fill="#1E3A5F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
