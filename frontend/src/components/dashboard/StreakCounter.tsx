import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

interface Props {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCounter({ currentStreak, longestStreak }: Props) {
  const animated = useAnimatedCounter(currentStreak, 1000);
  const isPeak = currentStreak >= 7;

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={isPeak ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex items-end gap-2"
      >
        <span className="text-4xl">🔥</span>
        <span className="text-5xl font-black text-white leading-none">
          {Math.round(animated)}
        </span>
      </motion.div>
      <p className="text-sm text-slate-400 font-medium">
        {currentStreak === 1 ? 'day streak' : 'day streak'}
      </p>
      <p className="text-xs text-slate-600">Best: {longestStreak} days</p>
    </div>
  );
}
