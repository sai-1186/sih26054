import React from 'react';
import { TelemetryPoint } from '../../types/telemetry';
import { ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, AlertOctagon, Wrench, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AnomalyTimelineProps {
  telemetry: TelemetryPoint;
  history: TelemetryPoint[];
  className?: string;
}

export const AnomalyTimeline: React.FC<AnomalyTimelineProps> = ({
  telemetry,
  history,
  className = '',
}) => {
  // Determine current progression stage
  // NORMAL -> EARLY DEGRADATION -> ANOMALY -> FAULT -> MAINTENANCE
  let currentStageIndex = 0;
  if (telemetry.anomalyScore > 0.75) {
    currentStageIndex = 3; // FAULT / MAINTENANCE
  } else if (telemetry.anomalyScore > 0.45) {
    currentStageIndex = 2; // ANOMALY
  } else if (telemetry.anomalyScore > 0.25 || telemetry.engineHealthIndex < 85) {
    currentStageIndex = 1; // EARLY DEGRADATION
  }

  const stages = [
    { name: 'NORMAL', icon: CheckCircle2, desc: 'Twin residual < 5%, nominal', color: 'emerald' },
    { name: 'EARLY DEGRADATION', icon: AlertTriangle, desc: 'Incipient drift detected', color: 'amber' },
    { name: 'ANOMALY', icon: ShieldAlert, desc: 'Multi-sensor residual divergence', color: 'orange' },
    { name: 'FAULT', icon: AlertOctagon, desc: 'High probability signature', color: 'rose' },
    { name: 'MAINTENANCE', icon: Wrench, desc: 'Advisory dispatched to GCS', color: 'purple' },
  ];

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-5 ${className}`}>
      {/* Stage Progression Breadcrumb */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Engine Health Lifecycle Progression
          </span>
          <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Current Stage: {stages[currentStageIndex].name}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div
                key={stage.name}
                className={`relative p-3 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-100 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-white border-slate-100 opacity-50 text-slate-400'
                }`}
              >
                <div className="flex justify-center mb-1.5">
                  <Icon className={`w-5 h-5 ${
                    isCurrent ? 'text-purple-600' : isCompleted ? 'text-slate-600' : 'text-slate-300'
                  }`} />
                </div>
                <div className={`text-[11px] font-bold tracking-tight ${
                  isCurrent ? 'text-purple-900' : 'text-slate-800'
                }`}>
                  {stage.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 hidden sm:block">
                  {stage.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anomaly Score Real-time Trend Area Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Isolation Forest Anomaly Score Trend
            </span>
            <span className="text-[10px] font-mono text-slate-500">Threshold: 0.50</span>
          </div>
          <div className="font-mono text-xs font-bold text-purple-700">
            Score: {telemetry.anomalyScore.toFixed(2)} / 1.00
          </div>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history.slice(-40)} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="anomalyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="timeString" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 1.0]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload as TelemetryPoint;
                    return (
                      <div className="bg-slate-900 text-white text-[11px] p-2 rounded shadow font-mono">
                        <div>Time: {p.timeString}</div>
                        <div className="text-purple-300 font-bold">Anomaly Score: {p.anomalyScore}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="anomalyScore"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#anomalyGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explainable AI Indicators (XAI) */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          Explainable AI Feature Attribution (SHAP / Residual Contributors)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono">Exhaust Gas Temp</div>
              <div className="text-xs font-bold text-rose-700 font-mono">EGT ↑ (+{Math.abs(telemetry.residualEgt).toFixed(1)}°C)</div>
            </div>
            <ArrowUp className="w-4 h-4 text-rose-600" />
          </div>

          <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono">Engine Vibration</div>
              <div className="text-xs font-bold text-amber-700 font-mono">Vibration ↑ (+{Math.abs(telemetry.residualVibration).toFixed(1)} mm/s)</div>
            </div>
            <ArrowUp className="w-4 h-4 text-amber-600" />
          </div>

          <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono">Fuel Flow</div>
              <div className="text-xs font-bold text-rose-700 font-mono">Fuel Flow ↑ (+{Math.abs(telemetry.residualFuelFlow).toFixed(1)} L/h)</div>
            </div>
            <ArrowUp className="w-4 h-4 text-rose-600" />
          </div>

          <div className="p-2.5 rounded-lg border border-sky-200 bg-sky-50/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono">Oil Pressure</div>
              <div className="text-xs font-bold text-sky-700 font-mono">Oil Pressure ↓ (-{Math.abs(telemetry.residualOilPressure).toFixed(2)} bar)</div>
            </div>
            <ArrowDown className="w-4 h-4 text-sky-600" />
          </div>
        </div>
      </div>

      {/* AI Insight Box with Certification Disclaimer */}
      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 flex items-start gap-3 text-xs">
        <div className="p-1.5 bg-purple-100 rounded-lg text-purple-700 shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-purple-900 flex items-center gap-2">
            AI INSIGHT
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-200/80 text-purple-800 font-mono font-medium">
              LSTM Degradation Model
            </span>
          </div>
          <p className="text-purple-800 mt-0.5 leading-relaxed">
            “Engine behavior is deviating from the expected Digital Twin state. Synchronized sensor residuals indicate progressive injector spray distortion in Cylinder #2, causing uneven cylinder combustion harmonics.”
          </p>
          <p className="text-[11px] text-purple-600 font-medium mt-1 italic">
            * Note: Decision Support System — Do not present AI predictions as certified maintenance decisions. Refer to standard OEM technical orders.
          </p>
        </div>
      </div>
    </div>
  );
};
