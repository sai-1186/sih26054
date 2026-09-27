import React, { useState } from 'react';
import { TelemetryPoint } from '../../types/telemetry';
import { Activity, Zap, RefreshCw, Cpu, Gauge, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DigitalTwinEngineProps {
  telemetry: TelemetryPoint;
  showSubsystemFlow?: boolean;
  interactiveMode?: boolean;
  className?: string;
}

export const DigitalTwinEngine: React.FC<DigitalTwinEngineProps> = ({
  telemetry,
  showSubsystemFlow = true,
  interactiveMode = true,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'SYNC' | 'PHYSICAL' | 'VIRTUAL'>('SYNC');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // Status colors based on residuals & active fault
  const isEgtAbnormal = Math.abs(telemetry.residualEgt) > 20;
  const isVibAbnormal = Math.abs(telemetry.residualVibration) > 1.2;
  const isOilAbnormal = Math.abs(telemetry.residualOilPressure) > 0.6;
  const isFuelAbnormal = Math.abs(telemetry.residualFuelFlow) > 2.0;

  const injectorColor = isEgtAbnormal || isFuelAbnormal ? '#ef4444' : '#0284c7';
  const oilColor = isOilAbnormal ? '#f59e0b' : '#10b981';
  const vibColor = isVibAbnormal ? '#ef4444' : '#10b981';

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Header bar with Physical ↕ Digital Twin synchronization badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-sky-600" />
              Aero-Piston Engine State
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700">
              Rotax 914 FADEC Twin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time physics-informed digital twin mapping & sensor telemetry sync
          </p>
        </div>

        {/* View Switcher */}
        {interactiveMode && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveView('SYNC')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                activeView === 'SYNC' ? 'bg-white text-sky-700 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" style={{ animationDuration: '6s' }} />
              Physical ↕ Virtual Sync
            </button>
            <button
              onClick={() => setActiveView('PHYSICAL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeView === 'PHYSICAL' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Physical Engine
            </button>
            <button
              onClick={() => setActiveView('VIRTUAL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeView === 'VIRTUAL' ? 'bg-white text-purple-700 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Digital Twin Core
            </button>
          </div>
        )}
      </div>

      {/* Sync Status Banner */}
      <div className="mb-4 px-3.5 py-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900">PHYSICAL ENGINE</span>
            <span className="text-sky-600 font-bold">◄ 50 Hz CAN 2.0B ►</span>
            <span className="font-semibold text-purple-800">DIGITAL TWIN</span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-600">Deviation Status:</span>
          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
            telemetry.deviationStatus === 'ANOMALOUS'
              ? 'bg-rose-100 text-rose-700 border border-rose-300'
              : telemetry.deviationStatus === 'WARNING'
              ? 'bg-amber-100 text-amber-700 border border-amber-300'
              : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
          }`}>
            {telemetry.deviationStatus}
          </span>
        </div>
      </div>

      {/* Main Aero-Piston Engine Technical Schematic SVG Canvas */}
      <div className="relative w-full flex items-center justify-center bg-slate-50/60 rounded-xl border border-slate-200/80 p-2 min-h-[360px] overflow-hidden">
        
        {/* Technical Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#0284c7 1px, transparent 1px), linear-gradient(90deg, #0284c7 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* High-Precision Technical SVG Vector Representation of 4-Cylinder Aero Piston Engine */}
        <svg
          viewBox="0 0 680 340"
          className="w-full max-w-[640px] h-auto drop-shadow-sm select-none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="crankcaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <linearGradient id="cylinderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="exhaustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor={isEgtAbnormal ? '#ef4444' : '#64748b'} />
            </linearGradient>

            <linearGradient id="turboGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* BACKGROUND COMPONENT LABELS / WATERMARKS */}
          <text x="340" y="28" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" letterSpacing="2">
            ROTAX 914/915 TURBOCHARGED 4-CYLINDER BOXER CONFIGURATION
          </text>

          {/* 1. MOUNTING CRADLE & VIBRATION DAMPENERS */}
          <rect x="220" y="55" width="240" height="230" rx="16" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />
          
          {/* Vibration Mount Callout Pins */}
          <circle cx="220" cy="70" r="6" fill="#e2e8f0" stroke={vibColor} strokeWidth="2" />
          <circle cx="460" cy="70" r="6" fill="#e2e8f0" stroke={vibColor} strokeWidth="2" />
          <circle cx="220" cy="270" r="6" fill="#e2e8f0" stroke={vibColor} strokeWidth="2" />
          <circle cx="460" cy="270" r="6" fill="#e2e8f0" stroke={vibColor} strokeWidth="2" />

          {/* 2. CENTRAL CRANKCASE */}
          <rect
            x="260"
            y="95"
            width="160"
            height="150"
            rx="12"
            fill="url(#crankcaseGrad)"
            stroke="#64748b"
            strokeWidth="2"
            onClick={() => setSelectedComponent('Crankcase & Main Bearings')}
            className="cursor-pointer hover:stroke-sky-600 transition-colors"
          />
          <text x="340" y="165" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            CRANKCASE
          </text>
          <text x="340" y="180" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
            FORGED CRANKSHAFT
          </text>

          {/* Crankshaft rotating hub */}
          <circle cx="340" cy="140" r="22" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <circle cx="340" cy="140" r="10" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
          <path d="M 334 140 L 346 140 M 340 134 L 340 146" stroke="#475569" strokeWidth="2" />

          {/* 3. HORIZONTALLY OPPOSED CYLINDERS (LEFT: 1 & 3, RIGHT: 2 & 4) */}
          {/* Left Cylinder 1 (Top Left) */}
          <g onClick={() => setSelectedComponent('Cylinder #1')} className="cursor-pointer">
            <rect x="150" y="98" width="110" height="58" rx="6" fill="url(#cylinderGrad)" stroke="#475569" strokeWidth="1.5" />
            {/* Cooling fins */}
            {[165, 180, 195, 210, 225, 240].map((x, i) => (
              <line key={i} x1={x} y1="92" x2={x} y2="162" stroke="#64748b" strokeWidth="1.5" />
            ))}
            <text x="185" y="132" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="sans-serif">CYL 1</text>
            <circle cx="152" cy="127" r="4" fill={injectorColor} />
          </g>

          {/* Left Cylinder 3 (Bottom Left) */}
          <g onClick={() => setSelectedComponent('Cylinder #3')} className="cursor-pointer">
            <rect x="150" y="182" width="110" height="58" rx="6" fill="url(#cylinderGrad)" stroke="#475569" strokeWidth="1.5" />
            {[165, 180, 195, 210, 225, 240].map((x, i) => (
              <line key={i} x1={x} y1="176" x2={x} y2="246" stroke="#64748b" strokeWidth="1.5" />
            ))}
            <text x="185" y="216" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="sans-serif">CYL 3</text>
            <circle cx="152" cy="211" r="4" fill={injectorColor} />
          </g>

          {/* Right Cylinder 2 (Top Right - Fault target) */}
          <g onClick={() => setSelectedComponent('Cylinder #2 & Injector')} className="cursor-pointer">
            <rect
              x="420"
              y="98"
              width="110"
              height="58"
              rx="6"
              fill={isEgtAbnormal ? '#fee2e2' : 'url(#cylinderGrad)'}
              stroke={isEgtAbnormal ? '#ef4444' : '#475569'}
              strokeWidth={isEgtAbnormal ? 2.5 : 1.5}
            />
            {[435, 450, 465, 480, 495, 510].map((x, i) => (
              <line key={i} x1={x} y1="92" x2={x} y2="162" stroke={isEgtAbnormal ? '#f87171' : '#64748b'} strokeWidth="1.5" />
            ))}
            <text x="475" y="132" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="sans-serif">CYL 2</text>
            {/* Injector Pin with pulse */}
            <circle cx="528" cy="127" r="5" fill={injectorColor} stroke="#fff" strokeWidth="1" className={isEgtAbnormal ? 'animate-ping' : ''} />
            <circle cx="528" cy="127" r="4" fill={injectorColor} />
          </g>

          {/* Right Cylinder 4 (Bottom Right) */}
          <g onClick={() => setSelectedComponent('Cylinder #4')} className="cursor-pointer">
            <rect x="420" y="182" width="110" height="58" rx="6" fill="url(#cylinderGrad)" stroke="#475569" strokeWidth="1.5" />
            {[435, 450, 465, 480, 495, 510].map((x, i) => (
              <line key={i} x1={x} y1="176" x2={x} y2="246" stroke="#64748b" strokeWidth="1.5" />
            ))}
            <text x="475" y="216" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="sans-serif">CYL 4</text>
            <circle cx="528" cy="211" r="4" fill={injectorColor} />
          </g>

          {/* 4. PROPELLER REDUCTION GEARBOX (PROP SHAFT OUTLET AT FRONT/BOTTOM) */}
          <path d="M 310 245 L 370 245 L 355 285 L 325 285 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          <rect x="330" y="285" width="20" height="20" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          <text x="340" y="270" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">GEARBOX 2.43:1</text>

          {/* 5. TURBOCHARGER & INTERCOOLER (TOP PLENUM) */}
          <g onClick={() => setSelectedComponent('Turbocharger & Wastegate')} className="cursor-pointer">
            <ellipse cx="340" cy="62" rx="34" ry="20" fill="url(#turboGrad)" stroke="#0369a1" strokeWidth="1.5" />
            <circle cx="340" cy="62" r="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
            <text x="340" y="65" textAnchor="middle" fill="#0c4a6e" fontSize="7" fontWeight="bold" fontFamily="monospace">TURBO</text>
          </g>

          {/* 6. EXHAUST MANIFOLD & COLLECTOR */}
          <path
            d="M 140 120 C 100 120 100 240 140 240 M 540 120 C 580 120 580 240 540 240"
            fill="none"
            stroke="url(#exhaustGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* 7. OIL SUMP & PUMP (LOWER CRANKCASE) */}
          <rect
            x="290"
            y="230"
            width="100"
            height="18"
            rx="4"
            fill="#e2e8f0"
            stroke={oilColor}
            strokeWidth="1.5"
          />
          <text x="340" y="242" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="bold">OIL SUMP</text>

          {/* LIVE DATA FLOW INDICATORS (CAN BUS PULSE) */}
          <line x1="150" y1="127" x2="260" y2="127" stroke="#38bdf8" strokeWidth="1.5" className="animate-data-flow" />
          <line x1="530" y1="127" x2="420" y2="127" stroke={injectorColor} strokeWidth="1.5" className="animate-data-flow" />
          <line x1="340" y1="82" x2="340" y2="95" stroke="#38bdf8" strokeWidth="1.5" className="animate-data-flow" />
        </svg>

        {/* 8. FLOATING LIVE SENSOR INDICATORS AROUND THE ENGINE CANVAS */}
        
        {/* RPM - Near Prop Shaft */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2 text-xs">
          <Gauge className="w-3.5 h-3.5 text-sky-600" />
          <div>
            <div className="text-[10px] text-slate-500 font-mono">RPM (Prop Shaft)</div>
            <div className="font-bold text-slate-900 font-telemetry">{telemetry.rpm} <span className="text-[10px] font-normal text-slate-500">RPM</span></div>
          </div>
          {telemetry.residualRpm !== 0 && (
            <span className="text-[10px] font-mono text-slate-600">Δ {telemetry.residualRpm > 0 ? `+${telemetry.residualRpm}` : telemetry.residualRpm}</span>
          )}
        </div>

        {/* EGT - Exhaust Top Right */}
        <div className={`absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border shadow-xs text-xs ${
          isEgtAbnormal ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 font-mono">EGT (Exhaust)</span>
            {isEgtAbnormal && <AlertTriangle className="w-3 h-3 text-rose-600" />}
          </div>
          <div className="font-bold text-slate-900 font-telemetry">{telemetry.egt} <span className="text-[10px] font-normal text-slate-500">°C</span></div>
          <div className="text-[10px] font-mono text-purple-700">Twin: {telemetry.predictedEgt}°C</div>
        </div>

        {/* CHT - Cylinder Head Top Left */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs">
          <div className="text-[10px] text-slate-500 font-mono">CHT (Cylinder Head)</div>
          <div className="font-bold text-slate-900 font-telemetry">{telemetry.cht} <span className="text-[10px] font-normal text-slate-500">°C</span></div>
          <div className="text-[10px] font-mono text-purple-700">Twin: {telemetry.predictedCht}°C</div>
        </div>

        {/* Oil Pressure & Oil Temp - Bottom Left */}
        <div className={`absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border shadow-xs text-xs ${
          isOilAbnormal ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
        }`}>
          <div className="text-[10px] text-slate-500 font-mono">Lubrication Circuit</div>
          <div className="font-bold text-slate-900 font-telemetry">
            {telemetry.oilPressure} <span className="text-[10px] font-normal text-slate-500">bar</span> / {telemetry.oilTemperature}°C
          </div>
          <div className="text-[10px] font-mono text-slate-500">Nom: 4.2 bar / 92°C</div>
        </div>

        {/* Fuel Flow - Right Middle */}
        <div className={`absolute top-1/2 -translate-y-1/2 right-4 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border shadow-xs text-xs ${
          isFuelAbnormal ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
        }`}>
          <div className="text-[10px] text-slate-500 font-mono">Fuel Delivery (Rail)</div>
          <div className="font-bold text-slate-900 font-telemetry">{telemetry.fuelFlow} <span className="text-[10px] font-normal text-slate-500">L/h</span></div>
          <div className="text-[10px] font-mono text-purple-700">Twin: {telemetry.predictedFuelFlow} L/h</div>
        </div>

        {/* Vibration - Left Middle */}
        <div className={`absolute top-1/2 -translate-y-1/2 left-4 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border shadow-xs text-xs ${
          isVibAbnormal ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
        }`}>
          <div className="text-[10px] text-slate-500 font-mono">Vibration RMS</div>
          <div className="font-bold text-slate-900 font-telemetry">{telemetry.vibration} <span className="text-[10px] font-normal text-slate-500">mm/s</span></div>
          <div className="text-[10px] font-mono text-slate-500">Limit: 4.5 mm/s</div>
        </div>
      </div>

      {/* Subsystem Flow Line (AIR/FUEL -> COMBUSTION -> TORQUE -> RPM -> THERMAL -> LUBRICATION -> VIBRATION) */}
      {showSubsystemFlow && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Connected Physical Subsystems Flow</span>
            <span className="font-mono text-[10px] text-sky-700">Digital Twin Thermodynamic Chain</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono">
            {[
              { name: 'AIR/FUEL', param: `${telemetry.fuelFlow} L/h`, ok: !isFuelAbnormal },
              { name: 'COMBUSTION', param: `${telemetry.egt}°C`, ok: !isEgtAbnormal },
              { name: 'TORQUE', param: '124 Nm', ok: true },
              { name: 'RPM', param: `${telemetry.rpm}`, ok: true },
              { name: 'THERMAL', param: `${telemetry.cht}°C`, ok: true },
              { name: 'LUBRICATION', param: `${telemetry.oilPressure} bar`, ok: !isOilAbnormal },
              { name: 'VIBRATION', param: `${telemetry.vibration} mm/s`, ok: !isVibAbnormal },
            ].map((sub, idx) => (
              <div
                key={sub.name}
                className={`p-1.5 rounded border transition-all ${
                  !sub.ok
                    ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="font-bold tracking-tight text-[9px] truncate">{sub.name}</div>
                <div className="text-[10px] mt-0.5 font-telemetry">{sub.param}</div>
                {idx < 6 && (
                  <div className="hidden">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Component Details Modal / Popover if clicked */}
      {selectedComponent && (
        <div className="mt-3 p-2.5 bg-sky-50/80 rounded-lg border border-sky-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-sky-900">{selectedComponent}</span>
            <span className="text-sky-700 font-mono text-[11px]">Telemetry healthy & synchronized with twin physics model</span>
          </div>
          <button
            onClick={() => setSelectedComponent(null)}
            className="text-slate-400 hover:text-slate-700 text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
