import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle, Info, X } from 'lucide-react';
import { TelemetryPoint } from '../../types/telemetry';

interface AlertItem {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  parameter?: string;
}

interface AlertPanelProps {
  telemetry: TelemetryPoint;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  telemetry,
  isOpen,
  onClose,
  className = '',
}) => {
  if (!isOpen) return null;

  const alerts: AlertItem[] = [];

  if (telemetry.anomalyScore > 0.6) {
    alerts.push({
      id: 'alt-1',
      type: 'CRITICAL',
      message: 'Isolation Forest detected anomalous sensor residual signature.',
      timestamp: telemetry.timeString,
      parameter: 'Anomaly Score > 0.60',
    });
  }

  if (Math.abs(telemetry.residualEgt) > 20) {
    alerts.push({
      id: 'alt-2',
      type: 'WARNING',
      message: `Exhaust Gas Temp residual +${telemetry.residualEgt.toFixed(1)}°C deviates from virtual engine prediction.`,
      timestamp: telemetry.timeString,
      parameter: 'EGT Residual',
    });
  }

  if (Math.abs(telemetry.residualVibration) > 1.2) {
    alerts.push({
      id: 'alt-3',
      type: 'WARNING',
      message: `Engine vibration RMS elevated (+${telemetry.residualVibration.toFixed(1)} mm/s). Inspect cylinder combustion harmonics.`,
      timestamp: telemetry.timeString,
      parameter: 'Vibration RMS',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'alt-nominal',
      type: 'INFO',
      message: 'All engine subsystems operating within physics model confidence bounds. Zero active alerts.',
      timestamp: telemetry.timeString,
    });
  }

  return (
    <div className={`absolute right-0 top-14 w-84 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn ${className}`}>
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-xs uppercase tracking-wider">Flight GCS System Alerts</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
            {alerts.length}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {alerts.map(a => {
          let bg = 'bg-slate-50 text-slate-700';
          let Icon = Info;
          let iconColor = 'text-sky-600';

          if (a.type === 'CRITICAL') {
            bg = 'bg-rose-50/80 border-rose-200 text-rose-900';
            Icon = AlertOctagon;
            iconColor = 'text-rose-600';
          } else if (a.type === 'WARNING') {
            bg = 'bg-amber-50/80 border-amber-200 text-amber-900';
            Icon = AlertTriangle;
            iconColor = 'text-amber-600';
          } else {
            Icon = CheckCircle;
            iconColor = 'text-emerald-600';
          }

          return (
            <div key={a.id} className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${bg}`}>
              <Icon className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} />
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                  <span className="font-bold">{a.type}</span>
                  <span>{a.timestamp}</span>
                </div>
                <p className="font-medium leading-relaxed">{a.message}</p>
                {a.parameter && (
                  <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 bg-white/80 rounded border border-slate-200">
                    Param: {a.parameter}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
