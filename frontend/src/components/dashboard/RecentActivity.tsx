import { formatDate, formatMinutes } from '../../utils/formatters';
import type { ProgressLog } from '../../types/api';

interface Props {
  logs: ProgressLog[];
}

export function RecentActivity({ logs }: Props) {
  if (!logs.length) {
    return <p className="text-sm text-slate-500 text-center py-6">No recent activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {logs.slice(0, 8).map((log) => (
        <div key={log.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: log.skill_color || '#6366f1' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 truncate">{log.skill_name}</p>
            <p className="text-xs text-slate-500">{formatDate(log.session_date)}</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{formatMinutes(log.duration_minutes)}</span>
        </div>
      ))}
    </div>
  );
}
