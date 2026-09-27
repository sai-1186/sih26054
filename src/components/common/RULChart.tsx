import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Clock, ShieldAlert, TrendingDown } from 'lucide-react';

interface RULChartProps {
  estimatedRul: number;
  confidenceLow: number;
  confidenceHigh: number;
  currentHealth: number;
  className?: string;
}

export const RULChart: React.FC<RULChartProps> = ({
  estimatedRul,
  confidenceLow,
  confidenceHigh,
  currentHealth,
  className = '',
}) => {
  // Generate historical + future projected curve data points
  // Current operating point is at t = 74 hours
  const currentFlightHour = 74;
  const targetEndHour = currentFlightHour + estimatedRul + 20;

  const data = [];
  for (let hr = 0; hr <= 220; hr += 10) {
    if (hr <= currentFlightHour) {
      // Historical actual health degradation curve
      const health = Math.max(currentHealth, 100 - (hr / currentFlightHour) * (100 - currentHealth));
      data.push({
        hour: `${hr}h`,
        rawHour: hr,
        actualHealth: Math.round(health),
        projectedHealth: null,
        uncertaintyLow: null,
        uncertaintyHigh: null,
      });
    } else {
      // Future projected degradation using LSTM trend
      const progress = (hr - currentFlightHour) / estimatedRul;
      const projHealth = Math.max(20, Math.round(currentHealth - progress * (currentHealth - 40)));
      const spread = Math.round(progress * 14); // uncertainty grows into future
      
      data.push({
        hour: `${hr}h`,
        rawHour: hr,
        actualHealth: null,
        projectedHealth: projHealth,
        uncertaintyLow: Math.max(15, projHealth - spread),
        uncertaintyHigh: Math.min(100, projHealth + spread),
        // Difference for area fill
        uncertaintyRange: [Math.max(15, projHealth - spread), Math.min(100, projHealth + spread)],
      });
    }
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-6 ${className}`}>
      {/* Top Banner: Central RUL Readout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-sky-50/70 via-slate-50 to-indigo-50/70 rounded-xl border border-sky-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-sky-600" />
            Remaining Useful Life (RUL) Estimation
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-telemetry tracking-tight">
              {estimatedRul}
            </span>
            <span className="text-lg font-semibold text-slate-600">HOURS</span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Statistical prediction based on current operating regime & degradation velocity
          </p>
        </div>

        {/* Confidence Interval Card */}
        <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-lg border border-slate-200/90 shadow-xs text-xs space-y-1.5 w-full sm:w-auto min-w-[210px]">
          <div className="text-slate-500 font-medium">90% Confidence Uncertainty Band</div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-600">Lower Bound:</span>
            <span className="font-bold text-slate-800 font-telemetry">{confidenceLow} h</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-600">Upper Bound:</span>
            <span className="font-bold text-slate-800 font-telemetry">{confidenceHigh} h</span>
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-purple-700">
            <span>Model:</span>
            <span className="font-semibold">Bayesian LSTM</span>
          </div>
        </div>
      </div>

      {/* Degradation Curve Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Health Degradation Curve & Future Projection
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-600 inline-block" />
              Observed History
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-purple-600 inline-block border-b border-dashed" />
              Estimated RUL Trajectory
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-purple-100 border border-purple-200 inline-block rounded-xs" />
              Uncertainty Envelope
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="rulEnvelopeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-xl font-mono border border-slate-800">
                        <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 mb-1">
                          Flight Hour: {p.hour}
                        </div>
                        {p.actualHealth !== null && (
                          <div className="text-sky-300">Observed Health: {p.actualHealth}%</div>
                        )}
                        {p.projectedHealth !== null && (
                          <div className="text-purple-300">Projected Health: {p.projectedHealth}%</div>
                        )}
                        {p.uncertaintyLow !== null && (
                          <div className="text-slate-400 text-[10px]">
                            90% CI: [{p.uncertaintyLow}%, {p.uncertaintyHigh}%]
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Maintenance Limit (40%)', position: 'top', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine x={`${currentFlightHour}h`} stroke="#64748b" strokeDasharray="2 2" label={{ value: 'Current (74h)', position: 'insideTopLeft', fill: '#475569', fontSize: 10 }} />
              
              {/* Uncertainty Area */}
              <Area
                type="monotone"
                dataKey="uncertaintyRange"
                fill="url(#rulEnvelopeGrad)"
                stroke="transparent"
                isAnimationActive={false}
              />

              {/* Observed Actual History */}
              <Line
                type="monotone"
                dataKey="actualHealth"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />

              {/* Projected Future RUL */}
              <Line
                type="monotone"
                dataKey="projectedHealth"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Uncertainty Disclaimer & Technical Details */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Operational Guideline:</span> RUL is calculated as a continuous probabilistic estimate with uncertainty bounds, not a deterministic guarantee. Engine maintenance actions must adhere to Time-Between-Overhaul (TBO 200h) intervals and mandatory borescope checks.
        </div>
      </div>
    </div>
  );
};
