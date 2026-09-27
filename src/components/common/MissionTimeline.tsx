import React from 'react';
import { MissionPhase } from '../../types/telemetry';
import { Plane, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

interface MissionTimelineProps {
  currentPhase: MissionPhase;
  currentAltitude: number;
  anomalyPoints?: { phase: MissionPhase; label: string; time: string }[];
  className?: string;
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({
  currentPhase,
  currentAltitude,
  anomalyPoints = [
    { phase: 'CRUISE', label: 'EGT Residual Spike (+35°C)', time: '10:44:32' },
  ],
  className = '',
}) => {
  const phases: { id: MissionPhase; label: string; altRange: string }[] = [
    { id: 'IDLE', label: 'Idle / Taxi', altRange: '0 ft' },
    { id: 'TAKEOFF', label: 'Takeoff', altRange: '0 - 1,500 ft' },
    { id: 'CLIMB', label: 'Climb', altRange: '1,500 - 9,500 ft' },
    { id: 'CRUISE', label: 'Cruise', altRange: '10,000 ft' },
    { id: 'HIGH_ALTITUDE', label: 'High Alt', altRange: '18,000+ ft' },
    { id: 'DESCENT', label: 'Descent', altRange: '10,000 - 0 ft' },
  ];

  const currentIdx = phases.findIndex(p => p.id === currentPhase);

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Flight Profile & Mission Phase Tracking
          </span>
        </div>
        <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
          <span>Current Altitude:</span>
          <span className="font-bold text-slate-900 font-telemetry">{currentAltitude.toLocaleString()} ft</span>
        </div>
      </div>

      {/* Stepped Mission Phase Bar */}
      <div className="grid grid-cols-6 gap-2">
        {phases.map((p, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const hasAnomaly = anomalyPoints.some(a => a.phase === p.id);

          return (
            <div
              key={p.id}
              className={`p-3 rounded-lg border relative transition-all text-center flex flex-col justify-between min-h-[85px] ${
                isCurrent
                  ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-100 shadow-xs'
                  : isPassed
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-white border-slate-100 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                {hasAnomaly ? (
                  <span className="p-0.5 rounded bg-rose-100 text-rose-700" title="Anomaly detected during this phase">
                    <AlertTriangle className="w-3 h-3" />
                  </span>
                ) : isPassed ? (
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                ) : null}
              </div>

              <div>
                <div className={`text-xs font-bold truncate ${isCurrent ? 'text-sky-900' : 'text-slate-800'}`}>
                  {p.label}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {p.altRange}
                </div>
              </div>

              {isCurrent && (
                <div className="mt-1 pt-1 border-t border-sky-200 text-[9px] font-bold text-sky-700 font-mono flex items-center justify-center gap-1">
                  <Plane className="w-2.5 h-2.5 transform rotate-45 text-sky-600" /> ACTIVE
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Anomaly Callout along flight path */}
      {anomalyPoints.length > 0 && (
        <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold text-amber-900">Flight Anomaly Marker:</span>
            <span className="text-amber-800">{anomalyPoints[0].label}</span>
          </div>
          <span className="font-mono text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            Logged @ {anomalyPoints[0].time}
          </span>
        </div>
      )}
    </div>
  );
};
