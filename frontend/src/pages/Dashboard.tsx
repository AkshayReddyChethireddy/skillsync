import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import { useProgressStore } from '../store/progressStore';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { MomentumGauge } from '../components/dashboard/MomentumGauge';
import { StreakCounter } from '../components/dashboard/StreakCounter';
import { ActivityHeatmap } from '../components/dashboard/ActivityHeatmap';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { MomentumChart } from '../components/analytics/MomentumChart';
import { HoursDistribution } from '../components/analytics/HoursDistribution';
import { WeeklyPatternChart } from '../components/analytics/WeeklyPatternChart';
import { ProgressionChart } from '../components/analytics/ProgressionChart';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const { summary, heatmapData, analytics, isLoading, fetchAll, selectedYear, setSelectedYear } = useDashboardStore();
  const { logs, fetchLogs } = useProgressStore();

  useEffect(() => {
    fetchAll();
    fetchLogs({ limit: 20 });
  }, []);

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Your learning momentum at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          {summary?.today_logged && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
              <CheckCircle size={14} />
              Logged today
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={fetchAll} isLoading={isLoading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && <SummaryCards summary={summary} />}

      {/* Momentum + Streak */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/60 rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center"
          >
            <p className="text-sm text-slate-400 mb-4 font-medium">Overall Momentum</p>
            <MomentumGauge score={summary.avg_momentum_score} size={180} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/60 rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center"
          >
            <p className="text-sm text-slate-400 mb-4 font-medium">Learning Streak</p>
            <StreakCounter currentStreak={summary.current_streak} longestStreak={summary.longest_streak} />
          </motion.div>

          {summary.top_skill && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/60 rounded-xl border border-slate-700 p-6"
            >
              <p className="text-sm text-slate-400 mb-4 font-medium">Top Skill</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: summary.top_skill.color }} />
                <p className="text-lg font-bold text-white">{summary.top_skill.name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Momentum</span>
                  <span className="text-white font-medium">{Math.round(summary.top_skill.momentum_score)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Hours</span>
                  <span className="text-white font-medium">{summary.top_skill.total_hours.toFixed(1)}h</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Activity Heatmap */}
      {heatmapData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/60 rounded-xl border border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Activity Heatmap</h2>
              <p className="text-xs text-slate-500 mt-0.5">{heatmapData.total_active_days} active days in {heatmapData.year}</p>
            </div>
            <div className="flex items-center gap-2">
              {[new Date().getFullYear() - 1, new Date().getFullYear()].map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    selectedYear === y
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <ActivityHeatmap cells={heatmapData.data} year={heatmapData.year} />
        </motion.div>
      )}

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/60 rounded-xl border border-slate-700 p-6"
          >
            <h2 className="text-base font-semibold text-white mb-4">Momentum Over Time</h2>
            <MomentumChart data={analytics.momentum_over_time} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/60 rounded-xl border border-slate-700 p-6"
          >
            <h2 className="text-base font-semibold text-white mb-4">Hours by Skill</h2>
            <HoursDistribution data={analytics.hours_by_skill} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/60 rounded-xl border border-slate-700 p-6"
          >
            <h2 className="text-base font-semibold text-white mb-4">Weekly Learning Hours</h2>
            <ProgressionChart data={analytics.hours_by_week} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800/60 rounded-xl border border-slate-700 p-6"
          >
            <h2 className="text-base font-semibold text-white mb-4">Best Days to Learn</h2>
            <WeeklyPatternChart data={analytics.hours_by_day_of_week} />
          </motion.div>
        </div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-800/60 rounded-xl border border-slate-700 p-6"
      >
        <h2 className="text-base font-semibold text-white mb-4">Recent Activity</h2>
        <RecentActivity logs={logs} />
      </motion.div>
    </div>
  );
}
