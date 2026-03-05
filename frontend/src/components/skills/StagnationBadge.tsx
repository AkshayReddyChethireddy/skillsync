import { AlertTriangle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { getStagnationLabel } from '../../utils/formatters';

interface Props {
  stagnantSince: string | null;
}

export function StagnationBadge({ stagnantSince }: Props) {
  const days = stagnantSince ? differenceInDays(new Date(), parseISO(stagnantSince)) : 0;
  const { label, color } = getStagnationLabel(days);

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      <AlertTriangle size={10} />
      {label}
    </span>
  );
}
