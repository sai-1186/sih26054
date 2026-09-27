import React, { useState } from 'react';
import { telemetryService, SimulationParams } from '../../services/mockTelemetryService';
import { Sliders, Play, RotateCcw, AlertTriangle, CheckCircle, SplitSquareVertical, Flame } from 'lucide-react';
import { FaultType } from '../../types/telemetry';

interface SimulationPanelProps {
  onCompareWithTwin?: () => void;
  className?: string;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  onCompareWithTwin,
  className = '',
}) => {
  const [params, setParams] = useState<SimulationParams>(telemetryService.getParams());
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleScenarioChange = (scenario: string) => {
    telemetryService.applyPreset(scenario);
    setParams(telemetryService.getParams());
    showToast(`Loaded Scenario: ${scenario}`);
  };

  const handleSliderChange = (key: keyof SimulationParams, value: number) => {
    const updated = { ...params, [key]: value };
    setParams(updated);
    telemetryService.setParams({ [key]: value });
  };

  const handleInjectFault = (faultType: FaultType = 'INJECTOR_DEGRADATION') => {
    telemetryService.injectFault(faultType);
    setParams(telemetryService.getParams());
    showToast(`Fault Injected: ${faultType.replace('_', ' ')}! Telemetry residuals rising.`);
  };

  const handleClearFault = () => {
    telemetryService.clearFault();
    setParams(telemetryService.getParams());
    showToast('Fault Cleared. System returning to nominal physics baseline.');
  };

  const handleReset = () => {
    telemetryService.resetSimulation();
    setParams(telemetryService.getParams());
    showToast('Simulation parameters reset to default cruise.');
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-5 ${className}`}>
      {/* Toast notification banner */}
      {notification && (
        <div className="p-2.5 bg-sky-50 border border-sky-300 text-sky-800 rounded-lg text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Scenario Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Engine Digital Twin Simulation Controls
          </span>
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['Normal Cruise', 'High Altitude', 'Hot Weather', 'Rapid Throttle', 'Endurance'].map(s => (
            <button
              key={s}
              onClick={() => handleScenarioChange(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                params.scenarioName === s
                  ? 'bg-sky-50 border-sky-400 text-sky-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Range Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Throttle Position */}
        <div className="space-y-2 p-3 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Throttle Position (Command)</span>
            <span className="font-mono font-bold text-sky-700 font-telemetry">{params.throttle}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={params.throttle}
            onChange={(e) => handleSliderChange('throttle', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>10% (Idle)</span>
            <span>70% (Cruise)</span>
            <span>100% (Full Power)</span>
          </div>
        </div>

        {/* Altitude */}
        <div className="space-y-2 p-3 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Flight Altitude (Air Density)</span>
            <span className="font-mono font-bold text-sky-700 font-telemetry">{params.altitude.toLocaleString()} ft</span>
          </div>
          <input
            type="range"
            min={0}
            max={25000}
            step={500}
            value={params.altitude}
            onChange={(e) => handleSliderChange('altitude', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 ft (Sea Level)</span>
            <span>10,000 ft</span>
            <span>25,000 ft (Ceiling)</span>
          </div>
        </div>

        {/* Ambient Temperature */}
        <div className="space-y-2 p-3 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Ambient Temperature (OAT)</span>
            <span className="font-mono font-bold text-sky-700 font-telemetry">{params.ambientTemperature}°C</span>
          </div>
          <input
            type="range"
            min={-30}
            max={50}
            step={1}
            value={params.ambientTemperature}
            onChange={(e) => handleSliderChange('ambientTemperature', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-30°C</span>
            <span>+15°C (ISA)</span>
            <span>+50°C (Hot Desert)</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Fault Injection Button */}
          {params.faultInjected ? (
            <button
              onClick={handleClearFault}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Clear Active Fault
            </button>
          ) : (
            <div className="relative group inline-block">
              <button
                onClick={() => handleInjectFault('INJECTOR_DEGRADATION')}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Flame className="w-3.5 h-3.5" />
                Inject Fault (Injector Degradation)
              </button>
            </div>
          )}

          {/* Fault Category Specific Injections */}
          <select
            value={params.activeFaultType}
            onChange={(e) => {
              const val = e.target.value as FaultType;
              if (val === 'NONE') handleClearFault();
              else handleInjectFault(val);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="NONE">Select Fault Mode: (None)</option>
            <option value="INJECTOR_DEGRADATION">Injector Degradation (EGT/Fuel Flow ↑)</option>
            <option value="LUBRICATION_DEGRADATION">Lubrication Breakdown (Oil P ↓, Oil T ↑)</option>
            <option value="OVERHEATING">Overheating (CHT/EGT Critical ↑)</option>
            <option value="VIBRATION_DEGRADATION">Mechanical Vibration (RMS &gt; 5.5 mm/s)</option>
            <option value="SENSOR_DRIFT">Sensor Drift (Single EGT Thermocouple Bias)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset
          </button>

          {onCompareWithTwin && (
            <button
              onClick={onCompareWithTwin}
              className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              Compare with Digital Twin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
