import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface TelemetryCardProps {
  label: string;
  value: number | string;
  unit: string;
  predictedValue?: number | string;
  residual?: number;
  residualUnit?: string;
  nominalMin?: number;
  nominalMax?: number;
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  icon?: React.ReactNode;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  subtitle?: string;
  className?: string;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  label,
  value,
  unit,
  predictedValue,
  residual,
  nominalMin,
  nominalMax,
  status = 'NORMAL',
  icon,
  trend,
  subtitle,
  className = '',
}) => {
  let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusDot = 'bg-emerald-500';

  if (status === 'WARNING') {
    statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
    statusDot = 'bg-amber-500';
  } else if (status === 'CRITICAL') {
    statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
    statusDot = 'bg-rose-500';
  }

  // Calculate percentage of nominal bar if min/max provided
  let barPercent = 50;
  if (typeof value === 'number' && nominalMin !== undefined && nominalMax !== undefined && nominalMax > nominalMin) {
    barPercent = Math.min(100, Math.max(0, ((value - nominalMin) / (nominalMax - nominalMin)) * 100));
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow transition-all relative overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-slate-500 p-1.5 bg-slate-50 rounded-lg border border-slate-100">{icon}</div>}
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</div>
            {subtitle && <div className="text-[10px] text-slate-500 font-mono">{subtitle}</div>}
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${statusBadge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
          {status}
        </div>
      </div>

      {/* Primary Value Readout */}
      <div className="my-1.5 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-telemetry text-slate-900 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          <span className="text-xs font-medium text-slate-600 uppercase">{unit}</span>
        </div>
        
        {trend && (
          <div className="text-xs font-medium flex items-center gap-0.5">
            {trend === 'UP' && <span className="text-amber-600 flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> High</span>}
            {trend === 'DOWN' && <span className="text-sky-600 flex items-center"><ArrowDownRight className="w-3.5 h-3.5" /> Low</span>}
            {trend === 'STABLE' && <span className="text-emerald-600 flex items-center"><Minus className="w-3.5 h-3.5" /> Nominal</span>}
          </div>
        )}
      </div>

      {/* Digital Twin Comparison & Residual */}
      {predictedValue !== undefined && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <div className="text-slate-600 flex items-center gap-1">
            <span className="text-[9px] uppercase tracking-wide px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-mono">Twin</span>
            <span className="font-mono text-slate-700 font-medium">{predictedValue} {unit}</span>
          </div>

          {residual !== undefined && (
            <div className={`font-mono font-medium flex items-center gap-0.5 ${
              Math.abs(residual) > (typeof value === 'number' && value > 100 ? 25 : 1.5)
                ? 'text-rose-600 font-semibold'
                : 'text-slate-600'
            }`}>
              <span className="text-[10px] text-slate-500 font-normal">Δ:</span>
              <span>{residual > 0 ? `+${residual}` : residual}</span>
            </div>
          )}
        </div>
      )}

      {/* Mini Range Indicator Bar */}
      {nominalMin !== undefined && nominalMax !== undefined && (
        <div className="mt-2.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === 'CRITICAL' ? 'bg-rose-500' : status === 'WARNING' ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
            <span>{nominalMin}</span>
            <span>{nominalMax} {unit}</span>
          </div>
        </div>
      )}
    </div>
  );
};
