'use client';

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const COLORS = ['#1E3A5F', '#F5A623', '#2ECC71', '#E74C3C', '#9B59B6'];
const TIER_LABELS: Record<string, string> = {
  free: 'مجاني', basic: 'أساسي', pro: 'احترافي', premium: 'بريميوم',
};

export function AdminCharts({
  monthly,
  planDist,
}: {
  monthly: { month: string; revenue: number; signups: number }[];
  planDist: { tier: string; count: number }[];
}) {
  const dist = planDist.map(d => ({ ...d, label: TIER_LABELS[d.tier] ?? d.tier }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-4">الإيرادات الشهرية</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" name="إيرادات (ج)" stroke="#2ECC71" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-4">المدرسون الجدد شهرياً</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="signups" name="جدد" fill="#1E3A5F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white rounded-card border border-neutral-200 p-5 md:col-span-2">
        <h2 className="font-semibold mb-4">توزيع الاشتراكات حسب الخطة</h2>
        <div className="h-64">
          {dist.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center pt-20">لا توجد اشتراكات بعد.</p>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={dist} dataKey="count" nameKey="label" outerRadius={90} label>
                  {dist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
