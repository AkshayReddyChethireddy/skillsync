import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Flame, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { SkillWithMetrics } from '../../types/api';
import { SkillProgressBar } from './SkillProgressBar';
import { StagnationBadge } from './StagnationBadge';
import { formatMomentumBand, formatHours } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

interface Props {
  skill: SkillWithMetrics;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

export function SkillCard({ skill, onEdit, onDelete, index }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const metrics = skill.metrics;
  const band = metrics ? formatMomentumBand(metrics.momentum_score) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-slate-800/60 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-all group relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${skill.color}22` }}>
            {skill.icon ?? '📚'}
          </div>
          <div>
            <Link to={`/skills/${skill.id}`} className="font-semibold text-white hover:text-indigo-400 transition-colors">
              {skill.name}
            </Link>
            {skill.category && <p className="text-xs text-slate-500">{skill.category}</p>}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 bg-slate-700 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[120px]" onMouseLeave={() => setMenuOpen(false)}>
              <button onClick={() => { onEdit(skill.id); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 w-full text-left">
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => { onDelete(skill.id); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-600 w-full text-left">
                <Trash2 size={14} /> Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {metrics && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{metrics.progress_percent.toFixed(0)}% to goal</span>
            <span>{formatHours(metrics.total_hours)} / {skill.target_hours}h</span>
          </div>
          <SkillProgressBar percent={metrics.progress_percent} color={skill.color} />
        </div>
      )}

      {/* Stats */}
      {metrics && (
        <div className="flex items-center gap-3 mt-3">
          {band && (
            <Badge color={band.color} dot>
              {Math.round(metrics.momentum_score)} {band.label}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Flame size={12} className="text-orange-400" />
            {metrics.current_streak}d
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            {formatHours(metrics.weekly_hours)}/wk
          </div>
          {metrics.is_stagnant && <StagnationBadge stagnantSince={metrics.stagnant_since} />}
        </div>
      )}
    </motion.div>
  );
}
