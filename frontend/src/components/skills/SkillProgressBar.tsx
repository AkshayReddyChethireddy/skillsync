import { motion } from 'framer-motion';

interface Props {
  percent: number;
  color: string;
  height?: number;
}

export function SkillProgressBar({ percent, color, height = 6 }: Props) {
  return (
    <div className="w-full bg-slate-700/50 rounded-full overflow-hidden" style={{ height }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percent, 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
