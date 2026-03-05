import { useEffect, useState } from 'react';

export function useAnimatedCounter(target: number, duration = 1000): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }
    const startTime = performance.now();
    const startValue = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(startValue + (target - startValue) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return current;
}
