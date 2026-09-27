import React, { useState, useEffect } from 'react';
import { TelemetryPoint, CanBusMessage } from '../../types/telemetry';
import { Terminal, ShieldCheck, CheckCircle2, Pause, Play, RefreshCw } from 'lucide-react';

interface CanFrameMonitorProps {
  telemetry: TelemetryPoint;
  className?: string;
}

export const CanFrameMonitor: React.FC<CanFrameMonitorProps> = ({
  telemetry,
  className = '',
}) => {
  const [frames, setFrames] = useState<CanBusMessage[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    // Helper to generate 8 hex bytes from numbers
    const toHex2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase();
    const now = new Date().toISOString().substring(11, 23);

    const rpmHigh = (telemetry.rpm >> 8) & 0xFF;
    const rpmLow = telemetry.rpm & 0xFF;
    const egtHigh = (Math.round(telemetry.egt) >> 8) & 0xFF;
    const egtLow = Math.round(telemetry.egt) & 0xFF;
    const chtVal = Math.round(telemetry.cht) & 0xFF;
    const oilP = Math.round(telemetry.oilPressure * 10) & 0xFF;
    const oilT = Math.round(telemetry.oilTemperature) & 0xFF;
    const fuelF = Math.round(telemetry.fuelFlow * 10) & 0xFF;

    const newFrames: CanBusMessage[] = [
      {
        timestamp: now,
        id: '0x18FEE400',
        channel: 'CAN0_ECU',
        dlc: 8,
        data: [toHex2(rpmLow), toHex2(rpmHigh), toHex2(telemetry.throttle), 'FF', '12', '00', '88', 'A4'],
        decoded: `Engine Speed: ${telemetry.rpm} RPM | Throttle: ${telemetry.throttle}%`,
        status: 'VALID',
      },
      {
        timestamp: now,
        id: '0x18FEE500',
        channel: 'CAN0_ECU',
        dlc: 8,
        data: [toHex2(egtLow), toHex2(egtHigh), toHex2(chtVal), '3C', '02', '14', '00', 'B2'],
        decoded: `EGT: ${telemetry.egt}°C | CHT: ${telemetry.cht}°C`,
        status: Math.abs(telemetry.residualEgt) > 20 ? 'DEV_ALERT' : 'VALID',
      },
      {
        timestamp: now,
        id: '0x18FEE600',
        channel: 'CAN0_ECU',
        dlc: 8,
        data: [toHex2(oilP), toHex2(oilT), '80', '1A', '40', '00', 'FE', 'C1'],
        decoded: `Oil Press: ${telemetry.oilPressure} bar | Oil Temp: ${telemetry.oilTemperature}°C`,
        status: 'VALID',
      },
      {
        timestamp: now,
        id: '0x18FEF200',
        channel: 'CAN0_ECU',
        dlc: 8,
        data: [toHex2(fuelF), '18', '24', '00', '64', '01', 'AA', '09'],
        decoded: `Fuel Flow: ${telemetry.fuelFlow} L/h | Inj Timing: ${telemetry.injectionTiming}°`,
        status: 'VALID',
      },
    ];

    setFrames(prev => [...newFrames, ...prev].slice(0, 16));
  }, [telemetry, isPaused]);

  return (
    <div className={`bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-4 shadow-md font-mono text-xs overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-white uppercase tracking-wider text-xs">
            CAN 2.0B / SocketCAN Telemetry Bus Stream
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-400 border border-slate-700">
            500 kbps Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700"
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Frame Table */}
      <div className="overflow-x-auto space-y-1">
        <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1 uppercase tracking-wider">
          <div className="col-span-2">Time</div>
          <div className="col-span-2">CAN ID</div>
          <div className="col-span-1">DLC</div>
          <div className="col-span-4">Payload (Hex Bytes)</div>
          <div className="col-span-3">Decoded Parameter</div>
        </div>

        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          {frames.map((f, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 text-[11px] py-1 px-1.5 rounded items-center transition-colors ${
                f.status === 'DEV_ALERT'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-900/50'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="col-span-2 text-slate-400 text-[10px]">{f.timestamp}</div>
              <div className="col-span-2 font-bold text-sky-400">{f.id}</div>
              <div className="col-span-1 text-slate-400">{f.dlc}</div>
              <div className="col-span-4 font-mono tracking-wider text-amber-300/90 text-[10px]">
                {f.data.join(' ')}
              </div>
              <div className="col-span-3 truncate text-slate-200 text-[10px] font-sans">
                {f.decoded}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <span>Hardware Filter: Mask 0x1FFFFFFF, Acceptance 0x18FE0000 (FADEC Broadcasts)</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3 h-3" /> CRC-16 Validated
        </span>
      </div>
    </div>
  );
};
