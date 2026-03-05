import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DayOfWeekItem } from '../../types/api';

interface Props {
  data: DayOfWeekItem[];
}

export function WeeklyPatternChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          formatter={(val) => [`${Math.round(val as number)}m`, 'Avg Minutes'] as [string, string]}
        />
        <Bar dataKey="avg_minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
