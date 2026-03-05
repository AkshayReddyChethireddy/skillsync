import { useMemo, useState } from 'react';
import { format, parseISO, startOfYear, getDay, addDays } from 'date-fns';
import type { HeatmapCell } from '../../types/api';

const INTENSITY_COLORS = [
  '#1e293b', // 0 — empty
  '#166534', // 1 — lightest green
  '#15803d', // 2
  '#16a34a', // 3
  '#22c55e', // 4 — brightest
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

interface Props {
  cells: HeatmapCell[];
  year: number;
}

interface Tooltip {
  x: number;
  y: number;
  cell: HeatmapCell;
}

export function ActivityHeatmap({ cells, year }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const grid = useMemo(() => {
    // Build a map from date string to cell
    const cellMap = new Map<string, HeatmapCell>();
    for (const cell of cells) {
      cellMap.set(cell.date, cell);
    }

    // Build columns: each column = one week (Sun-Sat)
    const yearStart = startOfYear(new Date(year, 0, 1));
    const startDow = getDay(yearStart); // 0=Sun, 1=Mon...

    // Pad beginning with empty cells
    const allCells: (HeatmapCell | null)[] = [];
    for (let i = 0; i < startDow; i++) allCells.push(null);

    const yearEnd = new Date(year, 11, 31);
    let d = yearStart;
    while (d <= yearEnd) {
      const key = format(d, 'yyyy-MM-dd');
      allCells.push(cellMap.get(key) ?? { date: key, count: 0, total_minutes: 0, intensity: 0 });
      d = addDays(d, 1);
    }

    // Split into weeks
    const weeks: (HeatmapCell | null)[][] = [];
    for (let i = 0; i < allCells.length; i += 7) {
      weeks.push(allCells.slice(i, i + 7));
    }
    return weeks;
  }, [cells, year]);

  // Month label positions
  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    for (let col = 0; col < grid.length; col++) {
      const week = grid[col];
      for (const cell of week) {
        if (cell) {
          const m = parseInt(cell.date.split('-')[1], 10) - 1;
          if (m !== lastMonth) {
            labels.push({ col, label: MONTHS[m] });
            lastMonth = m;
          }
          break;
        }
      }
    }
    return labels;
  }, [grid]);

  const CELL = 11;
  const GAP = 2;
  const step = CELL + GAP;

  return (
    <div className="overflow-x-auto">
      <div className="relative inline-block">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {monthLabels.map(({ col, label }) => (
            <span
              key={`${col}-${label}`}
              className="text-xs text-slate-500 absolute"
              style={{ left: 32 + col * step }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex mt-5">
          {/* Day labels */}
          <div className="flex flex-col mr-2" style={{ gap: GAP }}>
            {DAYS.map((d, i) => (
              <div key={i} className="text-xs text-slate-600 text-right" style={{ height: CELL, lineHeight: `${CELL}px` }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex" style={{ gap: GAP }}>
            {grid.map((week, col) => (
              <div key={col} className="flex flex-col" style={{ gap: GAP }}>
                {Array.from({ length: 7 }).map((_, row) => {
                  const cell = week[row];
                  const color = cell ? INTENSITY_COLORS[cell.intensity] : 'transparent';
                  return (
                    <div
                      key={row}
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: color,
                        borderRadius: 2,
                        cursor: cell && cell.count > 0 ? 'pointer' : 'default',
                      }}
                      onMouseEnter={(e) => {
                        if (cell && cell.count > 0) {
                          setTooltip({ x: e.clientX, y: e.clientY, cell });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white shadow-xl pointer-events-none"
            style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}
          >
            <p className="font-medium">{format(parseISO(tooltip.cell.date), 'MMMM d, yyyy')}</p>
            <p className="text-slate-300">
              {tooltip.cell.count} session{tooltip.cell.count !== 1 ? 's' : ''} · {tooltip.cell.total_minutes}m
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
