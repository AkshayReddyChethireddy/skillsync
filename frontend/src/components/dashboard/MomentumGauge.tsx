import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { formatMomentumBand } from '../../utils/formatters';

interface Props {
  score: number;
  size?: number;
}

export function MomentumGauge({ score, size = 160 }: Props) {
  const band = formatMomentumBand(score);
  const spring = useSpring(0, { stiffness: 60, damping: 15 });

  useEffect(() => {
    spring.set(score);
  }, [score, spring]);

  const strokeDashoffset = useTransform(spring, (v) => {
    const radius = (size / 2) * 0.75;
    const circumference = Math.PI * radius;
    const pct = Math.min(v, 100) / 100;
    return circumference * (1 - pct);
  });

  const radius = (size / 2) * 0.75;
  const circumference = Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* Background arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <motion.path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={band.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            filter={score > 80 ? 'url(#glow)' : undefined}
          />

          {score > 80 && (
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}

          {/* Score text */}
          <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="28" fontWeight="700">
            {Math.round(score)}
          </text>
          <text x={cx} y={cy + 22} textAnchor="middle" fill="#94a3b8" fontSize="11">
            MOMENTUM
          </text>
        </svg>
      </div>

      <span
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: `${band.color}22`, color: band.color }}
      >
        {band.label}
      </span>
    </div>
  );
}
