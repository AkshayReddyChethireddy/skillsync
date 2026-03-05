import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import type { DashboardSummary } from '../../types/api';
import { formatHours } from '../../utils/formatters';

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
  index: number;
}

function StatCard({ icon, label, value, sub, color = '#6366f1', index }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/60 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}22` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

interface Props {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: Props) {
  const totalHoursAnim = useAnimatedCounter(summary.total_hours, 1200);
  const streakAnim = useAnimatedCounter(summary.current_streak, 800);
  const momentumAnim = useAnimatedCounter(summary.avg_momentum_score, 1000);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        index={0}
        icon={<Clock size={20} />}
        label="Total Hours Learned"
        value={formatHours(totalHoursAnim)}
        sub={`${formatHours(summary.weekly_hours)} this week`}
        color="#6366f1"
      />
      <StatCard
        index={1}
        icon={<span className="text-lg">🔥</span>}
        label="Current Streak"
        value={`${Math.round(streakAnim)} days`}
        sub={`Best: ${summary.longest_streak} days`}
        color="#f97316"
      />
      <StatCard
        index={2}
        icon={<TrendingUp size={20} />}
        label="Avg Momentum"
        value={`${Math.round(momentumAnim)}`}
        sub={`${summary.active_skills} active skills`}
        color="#3b82f6"
      />
      <StatCard
        index={3}
        icon={<AlertTriangle size={20} />}
        label="Stagnant Skills"
        value={`${summary.stagnant_skills_count}`}
        sub={summary.stagnant_skills_count > 0 ? 'Need attention' : 'All on track!'}
        color={summary.stagnant_skills_count > 0 ? '#ef4444' : '#22c55e'}
      />
    </div>
  );
}
