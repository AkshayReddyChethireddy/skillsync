import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Flame, Clock, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSkillStore } from '../store/skillStore';
import { MomentumGauge } from '../components/dashboard/MomentumGauge';
import { SkillProgressBar } from '../components/skills/SkillProgressBar';
import { StagnationBadge } from '../components/skills/StagnationBadge';
import { Spinner } from '../components/ui/Spinner';
import { formatHours, formatDate, formatMinutes } from '../utils/formatters';

export function SkillDetail() {
  const { skillId } = useParams<{ skillId: string }>();
  const { selectedSkill, isLoading, fetchSkillDetail } = useSkillStore();

  useEffect(() => {
    if (skillId) fetchSkillDetail(skillId);
  }, [skillId]);

  if (isLoading || !selectedSkill) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  const m = selectedSkill.metrics;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/skills" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Skills
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${selectedSkill.color}22` }}>
          {selectedSkill.icon ?? '📚'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{selectedSkill.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {selectedSkill.category && <span className="text-sm text-slate-400">{selectedSkill.category}</span>}
            {m?.is_stagnant && <StagnationBadge stagnantSince={m.stagnant_since} />}
          </div>
        </div>
      </div>

      {m && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: <Clock size={16} />, label: 'Total Hours', value: formatHours(m.total_hours) },
              { icon: <Flame size={16} className="text-orange-400" />, label: 'Current Streak', value: `${m.current_streak} days` },
              { icon: <Target size={16} />, label: 'Sessions', value: String(m.total_sessions) },
              { icon: <TrendingUp size={16} />, label: 'Avg Session', value: formatMinutes(Math.round(m.avg_session_minutes)) },
            ].map(({ icon, label, value }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm">{icon}{label}</div>
                <p className="text-xl font-bold text-white">{value}</p>
              </motion.div>
            ))}
          </div>

          {/* Momentum + Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6 flex flex-col items-center">
              <p className="text-sm text-slate-400 mb-4">Momentum Score</p>
              <MomentumGauge score={m.momentum_score} size={160} />
            </div>
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
              <p className="text-sm text-slate-400 mb-4">Progress to Goal</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white font-bold">{m.progress_percent.toFixed(1)}%</span>
                <span className="text-slate-400">{formatHours(m.total_hours)} / {selectedSkill.target_hours}h</span>
              </div>
              <SkillProgressBar percent={m.progress_percent} color={selectedSkill.color} height={10} />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">This Week</p>
                  <p className="text-white font-medium">{formatHours(m.weekly_hours)}</p>
                </div>
                <div>
                  <p className="text-slate-400">This Month</p>
                  <p className="text-white font-medium">{formatHours(m.monthly_hours)}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent Logs */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <h2 className="text-base font-semibold text-white mb-4">Recent Sessions</h2>
        {selectedSkill.recent_logs.length === 0 ? (
          <p className="text-sm text-slate-500">No sessions logged yet.</p>
        ) : (
          <div className="space-y-3">
            {selectedSkill.recent_logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 py-2 border-b border-slate-700/50 last:border-0">
                <div>
                  <p className="text-sm text-white">{formatDate(log.session_date)}</p>
                  {log.notes && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{log.notes}</p>}
                </div>
                <div className="ml-auto flex items-center gap-3 text-sm">
                  {log.difficulty && <span className="text-slate-400">Difficulty: {log.difficulty}/5</span>}
                  <span className="text-indigo-400 font-mono font-medium">{formatMinutes(log.duration_minutes)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
