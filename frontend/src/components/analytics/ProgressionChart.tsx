import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { WeeklyHoursItem } from '../../types/api';

interface Props {
  data: WeeklyHoursItem[];
}

export function ProgressionChart({ data }: Props) {
  const chartData = data.map((d) => ({
    week: format(parseISO(d.week_start), 'MMM d'),
    hours: d.hours,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          formatter={(val) => [`${(val as number).toFixed(1)}h`, 'Hours'] as [string, string]}
        />
        <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} fill="url(#hoursGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
