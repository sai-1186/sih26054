import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TelemetryPoint } from '../../types/telemetry';

export type TimeRangeFilter = '1m' | '5m' | '15m' | '1h' | 'Mission';

interface TelemetryChartProps {
  title: string;
  data: TelemetryPoint[];
  dataKeyActual: keyof TelemetryPoint;
  dataKeyPredicted?: keyof TelemetryPoint;
  unit: string;
  actualColor?: string;
  predictedColor?: string;
  nominalMin?: number;
  nominalMax?: number;
  showResidualCallout?: boolean;
  height?: number;
  allowTimeRangeFilter?: boolean;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  title,
  data,
  dataKeyActual,
  dataKeyPredicted,
  unit,
  actualColor = '#0284c7', // Sky-600
  predictedColor = '#8b5cf6', // Purple/AI
  nominalMin,
  nominalMax,
  showResidualCallout = true,
  height = 240,
  allowTimeRangeFilter = true,
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRangeFilter>('1m');

  // Filter data according to time range
  let filteredData = data;
  if (selectedRange === '1m') {
    filteredData = data.slice(-60);
  } else if (selectedRange === '5m') {
    filteredData = data.slice(-120);
  } else if (selectedRange === '15m') {
    filteredData = data.slice(-180);
  } else if (selectedRange === '1h') {
    filteredData = data;
  }

  const latestPoint = data.length > 0 ? data[data.length - 1] : null;
  const currentActual = latestPoint ? (latestPoint[dataKeyActual] as number) : 0;
  const currentPredicted = (latestPoint && dataKeyPredicted) ? (latestPoint[dataKeyPredicted] as number) : undefined;
  const currentResidual = (currentPredicted !== undefined) ? (currentActual - currentPredicted) : undefined;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow transition-all">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-slate-800 text-sm tracking-tight">{title}</h4>
          
          {/* Live readouts */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Act:</span>
            <span className="font-bold text-slate-900 font-telemetry">{currentActual} {unit}</span>
            {currentPredicted !== undefined && (
              <>
                <span className="text-purple-400">|</span>
                <span className="text-slate-500">Twin:</span>
                <span className="font-bold text-purple-700 font-telemetry">{currentPredicted} {unit}</span>
              </>
            )}
            {showResidualCallout && currentResidual !== undefined && (
              <span className={`px-1.5 py-0.2 rounded text-[11px] font-semibold ${
                Math.abs(currentResidual) > (currentActual > 100 ? 25 : 1.5)
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                Δ {currentResidual > 0 ? `+${currentResidual.toFixed(1)}` : currentResidual.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Time Range Pills */}
        {allowTimeRangeFilter && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600">
            {(['1m', '5m', '15m', '1h', 'Mission'] as TimeRangeFilter[]).map(range => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-2.5 py-0.5 rounded-md transition-all ${
                  selectedRange === range
                    ? 'bg-white text-sky-700 font-semibold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="timeString"
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              minTickGap={25}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              domain={['auto', 'auto']}
              unit={unit}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload as TelemetryPoint;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs border border-slate-800 font-sans z-50">
                      <div className="text-slate-400 font-mono text-[10px] mb-1.5 border-b border-slate-800 pb-1">
                        Time: {p.timeString} | Phase: {p.missionPhase}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4 font-mono">
                          <span className="flex items-center gap-1.5 text-sky-300">
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                            Actual Engine:
                          </span>
                          <span className="font-bold text-white">
                            {p[dataKeyActual]} {unit}
                          </span>
                        </div>
                        {dataKeyPredicted && (
                          <div className="flex items-center justify-between gap-4 font-mono">
                            <span className="flex items-center gap-1.5 text-purple-300">
                              <span className="w-2 h-2 rounded-full bg-purple-400" />
                              Digital Twin:
                            </span>
                            <span className="font-bold text-purple-200">
                              {p[dataKeyPredicted]} {unit}
                            </span>
                          </div>
                        )}
                        {dataKeyPredicted && (
                          <div className="flex items-center justify-between gap-4 font-mono pt-1 border-t border-slate-800 text-[11px]">
                            <span className="text-slate-400">Model Residual:</span>
                            <span className={`font-bold ${
                              Math.abs((p[dataKeyActual] as number) - (p[dataKeyPredicted] as number)) > 20
                                ? 'text-rose-400'
                                : 'text-emerald-400'
                            }`}>
                              {((p[dataKeyActual] as number) - (p[dataKeyPredicted] as number)) > 0 ? '+' : ''}
                              {(((p[dataKeyActual] as number) - (p[dataKeyPredicted] as number))).toFixed(1)} {unit}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {dataKeyPredicted && (
              <Line
                type="monotone"
                dataKey={dataKeyPredicted as string}
                name="Digital Twin (Predicted)"
                stroke={predictedColor}
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            )}
            <Line
              type="monotone"
              dataKey={dataKeyActual as string}
              name="Physical Engine (Actual)"
              stroke={actualColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
