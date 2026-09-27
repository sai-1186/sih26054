import React from 'react';

interface HealthGaugeProps {
  value: number; // 0 - 100
  size?: number; // diameter in px
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showStatusBadge?: boolean;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({
  value,
  size = 200,
  strokeWidth = 14,
  label = 'ENGINE HEALTH',
  sublabel,
  showStatusBadge = true,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 260-degree arc for an aerospace instrument feel
  const arcDegree = 260;
  const arcLength = (arcDegree / 360) * circumference;
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  let color = '#10b981'; // Green
  let statusText = 'HEALTHY';
  let statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (clamped < 40) {
    color = '#ef4444'; // Red
    statusText = 'CRITICAL';
    statusBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (clamped < 65) {
    color = '#f59e0b'; // Amber
    statusText = 'DEGRADED';
    statusBg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (clamped < 85) {
    color = '#0284c7'; // Blue/Cyan
    statusText = 'MONITOR';
    statusBg = 'bg-sky-50 text-sky-700 border-sky-200';
  }

  // Generate tick marks
  const numTicks = 27;
  const startAngle = 140; // degrees
  const angleStep = arcDegree / (numTicks - 1);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform rotate-[0deg] overflow-visible"
        >
          <defs>
            <linearGradient id="healthGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
          />

          {/* Ticks along the arc */}
          {Array.from({ length: numTicks }).map((_, i) => {
            const angle = (startAngle + i * angleStep) * (Math.PI / 180);
            const rInner = radius - strokeWidth / 2 - 4;
            const rOuter = rInner - (i % 5 === 0 ? 7 : 4);
            const x1 = size / 2 + rInner * Math.cos(angle);
            const y1 = size / 2 + rInner * Math.sin(angle);
            const x2 = size / 2 + rOuter * Math.cos(angle);
            const y2 = size / 2 + rOuter * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 5 === 0 ? '#64748b' : '#cbd5e1'}
                strokeWidth={i % 5 === 0 ? 1.5 : 1}
              />
            );
          })}

          {/* Active Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#healthGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
            className="transition-all duration-700 ease-out"
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
          <span className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
            {label}
          </span>
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-extrabold text-slate-900 font-telemetry tracking-tight">
              {clamped}
            </span>
            <span className="text-lg font-semibold text-slate-600 ml-0.5">%</span>
          </div>
          {sublabel && (
            <span className="text-[11px] text-slate-600 font-mono mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {showStatusBadge && (
        <div className={`mt-2 px-3 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-sm ${statusBg}`}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          Status: {statusText}
        </div>
      )}
    </div>
  );
};
