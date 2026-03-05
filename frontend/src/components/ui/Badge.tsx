import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, color, className, dot }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        !color && 'bg-slate-700 text-slate-300',
        className
      )}
      style={color ? { backgroundColor: `${color}22`, color } : undefined}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={color ? { backgroundColor: color } : { backgroundColor: 'currentColor' }}
        />
      )}
      {children}
    </span>
  );
}
