import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SkillHoursItem } from '../../types/api';

interface Props {
  data: SkillHoursItem[];
}

export function HoursDistribution({ data }: Props) {
  if (!data.length) return <p className="text-sm text-slate-500 text-center py-8">No data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="total_hours" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          formatter={(val) => [`${(val as number).toFixed(1)}h`, 'Hours'] as [string, string]}
        />
        <Legend formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{val}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
