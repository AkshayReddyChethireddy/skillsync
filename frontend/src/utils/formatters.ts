import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatMomentumBand(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score <= 20) return { label: 'Dormant', color: '#6b7280', bgColor: 'bg-gray-500/20' };
  if (score <= 40) return { label: 'Low', color: '#ef4444', bgColor: 'bg-red-500/20' };
  if (score <= 60) return { label: 'Building', color: '#f97316', bgColor: 'bg-orange-500/20' };
  if (score <= 80) return { label: 'Active', color: '#3b82f6', bgColor: 'bg-blue-500/20' };
  return { label: 'Peak', color: '#22c55e', bgColor: 'bg-green-500/20' };
}

export function getStagnationLabel(daysStagnant: number): {
  label: string;
  color: string;
} {
  if (daysStagnant < 7) return { label: 'Slowing Down', color: '#eab308' };
  if (daysStagnant < 17) return { label: 'Stagnant', color: '#f97316' };
  return { label: 'Needs Attention', color: '#ef4444' };
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
