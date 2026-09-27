import React, { useState, useEffect } from 'react';
import {
  Activity, Bell, Cpu, Layout, Shield,
  Sliders, Clock, Radio, Gauge, Zap, Thermometer, Wind,
  Plane, AlertTriangle
} from 'lucide-react';

// Services & Types
import { telemetryService } from './services/mockTelemetryService';
import { TelemetryPoint } from './types/telemetry';
import { CURRENT_MAINTENANCE_ADVISORY, STATIC_FAULT_PROBABILITIES } from './services/replayData';

// Components
import { DigitalTwinEngine } from './components/common/DigitalTwinEngine';
import { HealthGauge } from './components/common/HealthGauge';
import { TelemetryCard } from './components/common/TelemetryCard';
import { TelemetryChart } from './components/common/TelemetryChart';
import { AlertPanel } from './components/common/AlertPanel';
import { SimulationPanel } from './components/common/SimulationPanel';
import { AnomalyTimeline } from './components/common/AnomalyTimeline';
import { RULChart } from './components/common/RULChart';
import { FaultProbability } from './components/common/FaultProbability';
import { MissionTimeline } from './components/common/MissionTimeline';
import { MaintenanceAdvisoryCard } from './components/common/MaintenanceAdvisoryCard';
import { CanFrameMonitor } from './components/common/CanFrameMonitor';

type ActiveTab = 'OVERVIEW' | 'TELEMETRY' | 'ANOMALY' | 'RUL' | 'MAINTENANCE' | 'SIMULATION' | 'CAN_BUS';

function SubsystemBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-600">{label}</span>
        <span className={`font-bold ${value < 60 ? 'text-rose-600' : value < 80 ? 'text-amber-600' : 'text-slate-800'}`}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function KpiChip({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs ${accent || 'text-slate-200'}`}>
      <span className="opacity-70">{icon}</span>
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="font-bold font-mono tracking-tight">{value}</span>
    </div>
  );
}

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryPoint | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('OVERVIEW');
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    const unsub = telemetryService.subscribe((point, hist) => {
      setTelemetry(point);
      setHistory(hist);
    });
    return unsub;
  }, []);

  if (!telemetry) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-mono">Initializing Digital Twin Engine...</p>
        </div>
      </div>
    );
  }

  const hasActiveAlert = telemetry.anomalyScore > 0.5 || telemetry.deviationStatus !== 'NORMAL';

  const NAV_TABS: { id: ActiveTab; icon: React.ReactNode; label: string }[] = [
    { id: 'OVERVIEW',    icon: <Layout className="w-4 h-4" />,    label: 'Overview' },
    { id: 'TELEMETRY',  icon: <Activity className="w-4 h-4" />,  label: 'Telemetry' },
    { id: 'ANOMALY',    icon: <Shield className="w-4 h-4" />,    label: 'Anomaly AI' },
    { id: 'RUL',        icon: <Clock className="w-4 h-4" />,     label: 'RUL Prognosis' },
    { id: 'MAINTENANCE',icon: <AlertTriangle className="w-4 h-4" />, label: 'Maintenance' },
    { id: 'SIMULATION', icon: <Sliders className="w-4 h-4" />,   label: 'Simulation' },
    { id: 'CAN_BUS',    icon: <Radio className="w-4 h-4" />,     label: 'CAN Bus' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">

      {/* TOP HEADER */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
        <div className="px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-sky-600/20 border border-sky-600/40">
              <Cpu className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-extrabold text-sm tracking-tight">DRONANETRA</span>
                <span className="text-sky-400 font-semibold text-xs">| Digital Twin GCS</span>
              </div>
              <p className="text-slate-500 text-[10px] font-mono hidden sm:block">
                MALE UAV · Rotax 914 · AI-Enabled Predictive Health Monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <KpiChip icon={<Gauge className="w-3.5 h-3.5" />} label="Health" value={`${telemetry.engineHealthIndex}%`} accent={telemetry.engineHealthIndex < 60 ? 'text-rose-400' : telemetry.engineHealthIndex < 80 ? 'text-amber-400' : 'text-emerald-400'} />
            <KpiChip icon={<Activity className="w-3.5 h-3.5" />} label="RPM" value={`${telemetry.rpm.toLocaleString()}`} />
            <KpiChip icon={<Thermometer className="w-3.5 h-3.5" />} label="EGT" value={`${telemetry.egt}°C`} accent={Math.abs(telemetry.residualEgt) > 20 ? 'text-rose-400' : 'text-slate-200'} />
            <KpiChip icon={<Wind className="w-3.5 h-3.5" />} label="Alt" value={`${telemetry.altitude.toLocaleString()} ft`} />
            <KpiChip icon={<Clock className="w-3.5 h-3.5" />} label="RUL" value={`${telemetry.estimatedRul}h`} />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-900/40 border border-sky-700/50 text-sky-300 text-xs font-mono font-semibold">
              <Plane className="w-3.5 h-3.5" />
              {telemetry.missionPhase.replace('_', ' ')}
            </span>

            <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold font-mono ${
              telemetry.deviationStatus === 'ANOMALOUS'
                ? 'bg-rose-900/40 border-rose-700/60 text-rose-300'
                : telemetry.deviationStatus === 'WARNING'
                ? 'bg-amber-900/40 border-amber-700/60 text-amber-300'
                : 'bg-emerald-900/40 border-emerald-700/60 text-emerald-300'
            }`}>
              {telemetry.deviationStatus}
            </span>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>

            <div className="relative">
              <button
                id="alert-bell-btn"
                onClick={() => setAlertOpen(!alertOpen)}
                className={`relative p-2 rounded-lg border transition-all ${hasActiveAlert ? 'bg-rose-900/40 border-rose-700/60 text-rose-300 hover:bg-rose-800/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <Bell className="w-4 h-4" />
                {hasActiveAlert && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-slate-950" />}
              </button>
              <AlertPanel telemetry={telemetry} isOpen={alertOpen} onClose={() => setAlertOpen(false)} />
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="px-4 flex items-center gap-1 overflow-x-auto border-t border-slate-800/70">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id.toLowerCase()}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id ? 'text-sky-400 border-sky-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'MAINTENANCE' && hasActiveAlert && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 py-5 max-w-screen-2xl mx-auto w-full">

        {/* TAB: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Health Gauge */}
              <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col items-center justify-center space-y-3">
                <HealthGauge
                  value={telemetry.engineHealthIndex}
                  size={200}
                  label="ENGINE HEALTH INDEX"
                  sublabel={`Anomaly Score: ${telemetry.anomalyScore.toFixed(2)}`}
                />
                <div className="w-full space-y-2.5 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subsystem Health</p>
                  <SubsystemBar label="Combustion"  value={telemetry.subsystemHealth.combustion}  color="#0284c7" />
                  <SubsystemBar label="Thermal"     value={telemetry.subsystemHealth.thermal}     color="#10b981" />
                  <SubsystemBar label="Lubrication" value={telemetry.subsystemHealth.lubrication} color="#f59e0b" />
                  <SubsystemBar label="Mechanical"  value={telemetry.subsystemHealth.mechanical}  color="#8b5cf6" />
                  <SubsystemBar label="Electrical"  value={telemetry.subsystemHealth.electrical}  color="#06b6d4" />
                  <SubsystemBar label="Fuel System" value={telemetry.subsystemHealth.fuelSystem}  color="#f97316" />
                </div>
              </div>

              {/* Digital Twin Engine Schematic */}
              <div className="lg:col-span-6">
                <DigitalTwinEngine telemetry={telemetry} showSubsystemFlow={true} interactiveMode={true} className="h-full" />
              </div>

              {/* Quick-stats */}
              <div className="lg:col-span-3 space-y-3">
                <TelemetryCard label="Engine Speed" value={telemetry.rpm} unit="RPM" predictedValue={telemetry.predictedRpm} residual={telemetry.residualRpm} nominalMin={4000} nominalMax={4500} status="NORMAL" icon={<Gauge className="w-3.5 h-3.5" />} trend="STABLE" subtitle="Prop Shaft Encoder" />
                <TelemetryCard label="Exhaust Gas Temp" value={telemetry.egt} unit="°C" predictedValue={telemetry.predictedEgt} residual={telemetry.residualEgt} nominalMin={680} nominalMax={720} status={Math.abs(telemetry.residualEgt) > 20 ? 'CRITICAL' : Math.abs(telemetry.residualEgt) > 10 ? 'WARNING' : 'NORMAL'} icon={<Thermometer className="w-3.5 h-3.5" />} trend={telemetry.residualEgt > 10 ? 'UP' : 'STABLE'} subtitle="K-type Thermocouple" />
                <TelemetryCard label="Oil Pressure" value={telemetry.oilPressure} unit="bar" predictedValue={telemetry.predictedOilPressure} residual={telemetry.residualOilPressure} nominalMin={3.8} nominalMax={4.5} status={Math.abs(telemetry.residualOilPressure) > 0.6 ? 'WARNING' : 'NORMAL'} icon={<Zap className="w-3.5 h-3.5" />} subtitle="Lubrication Circuit" />
                <TelemetryCard label="Fuel Flow" value={telemetry.fuelFlow} unit="L/h" predictedValue={telemetry.predictedFuelFlow} residual={telemetry.residualFuelFlow} nominalMin={16} nominalMax={22} status={Math.abs(telemetry.residualFuelFlow) > 2 ? 'WARNING' : 'NORMAL'} icon={<Activity className="w-3.5 h-3.5" />} subtitle="FADEC Fuel Rail" />
              </div>
            </div>

            <MissionTimeline currentPhase={telemetry.missionPhase} currentAltitude={telemetry.altitude} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <TelemetryChart title="Exhaust Gas Temperature (EGT)" data={history} dataKeyActual="egt" dataKeyPredicted="predictedEgt" unit="°C" actualColor="#f97316" predictedColor="#8b5cf6" height={220} />
              <TelemetryChart title="Engine Vibration RMS" data={history} dataKeyActual="vibration" dataKeyPredicted="predictedVibration" unit="mm/s" actualColor="#0284c7" predictedColor="#8b5cf6" height={220} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TelemetryCard label="Cylinder Head Temp" value={telemetry.cht} unit="°C" predictedValue={telemetry.predictedCht} residual={telemetry.residualCht} nominalMin={160} nominalMax={185} status={telemetry.cht > 210 ? 'CRITICAL' : telemetry.cht > 190 ? 'WARNING' : 'NORMAL'} subtitle="CHT Thermocouple" />
              <TelemetryCard label="Oil Temperature" value={telemetry.oilTemperature} unit="°C" predictedValue={telemetry.predictedOilTemperature} residual={telemetry.residualOilTemperature} nominalMin={85} nominalMax={98} status={telemetry.oilTemperature > 115 ? 'CRITICAL' : telemetry.oilTemperature > 105 ? 'WARNING' : 'NORMAL'} subtitle="Sump Temperature" />
              <TelemetryCard label="Battery Voltage" value={parseFloat(telemetry.batteryVoltage.toFixed(2))} unit="V" nominalMin={27.5} nominalMax={28.8} status={telemetry.batteryVoltage < 27 ? 'WARNING' : 'NORMAL'} subtitle={`${telemetry.batteryCurrent.toFixed(1)} A draw`} />
              <TelemetryCard label="Manifold Pressure" value={telemetry.manifoldPressure} unit="inHg" nominalMin={28} nominalMax={36} status="NORMAL" subtitle={`${telemetry.throttle}% Throttle | ${telemetry.ambientTemperature}°C OAT`} />
            </div>
          </div>
        )}

        {/* TAB: TELEMETRY */}
        {activeTab === 'TELEMETRY' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Live Telemetry Charts</h2>
                <p className="text-sm text-slate-500 mt-0.5 font-mono">Physical Engine vs. Digital Twin Predicted Values — Residual Analysis</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {history.length} samples · 1s tick
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
              {[
                { label: 'RPM', value: `${telemetry.rpm}`, unit: 'RPM', delta: telemetry.residualRpm },
                { label: 'EGT', value: `${telemetry.egt}`, unit: '°C', delta: telemetry.residualEgt },
                { label: 'CHT', value: `${telemetry.cht}`, unit: '°C', delta: telemetry.residualCht },
                { label: 'Oil P', value: `${telemetry.oilPressure}`, unit: 'bar', delta: telemetry.residualOilPressure },
                { label: 'Oil T', value: `${telemetry.oilTemperature}`, unit: '°C', delta: telemetry.residualOilTemperature },
                { label: 'Fuel', value: `${telemetry.fuelFlow}`, unit: 'L/h', delta: telemetry.residualFuelFlow },
                { label: 'Vib', value: `${telemetry.vibration}`, unit: 'mm/s', delta: telemetry.residualVibration },
              ].map(({ label, value, unit, delta }) => (
                <div key={label} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-sm text-center">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{label}</div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{value}</div>
                  <div className="text-[10px] text-slate-500">{unit}</div>
                  <div className={`text-[10px] font-mono font-semibold mt-1 ${Math.abs(delta) > 20 ? 'text-rose-600' : 'text-slate-500'}`}>
                    Δ {delta > 0 ? `+${delta}` : delta}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <TelemetryChart title="Engine Speed (RPM)" data={history} dataKeyActual="rpm" dataKeyPredicted="predictedRpm" unit="RPM" actualColor="#0284c7" predictedColor="#8b5cf6" height={200} />
              <TelemetryChart title="Exhaust Gas Temp (EGT)" data={history} dataKeyActual="egt" dataKeyPredicted="predictedEgt" unit="°C" actualColor="#f97316" predictedColor="#8b5cf6" height={200} />
              <TelemetryChart title="Cylinder Head Temp (CHT)" data={history} dataKeyActual="cht" dataKeyPredicted="predictedCht" unit="°C" actualColor="#ef4444" predictedColor="#8b5cf6" height={200} />
              <TelemetryChart title="Oil Pressure" data={history} dataKeyActual="oilPressure" dataKeyPredicted="predictedOilPressure" unit="bar" actualColor="#10b981" predictedColor="#8b5cf6" height={200} />
              <TelemetryChart title="Fuel Flow Rate" data={history} dataKeyActual="fuelFlow" dataKeyPredicted="predictedFuelFlow" unit="L/h" actualColor="#f59e0b" predictedColor="#8b5cf6" height={200} />
              <TelemetryChart title="Engine Vibration RMS" data={history} dataKeyActual="vibration" dataKeyPredicted="predictedVibration" unit="mm/s" actualColor="#8b5cf6" predictedColor="#64748b" height={200} />
            </div>

            <DigitalTwinEngine telemetry={telemetry} showSubsystemFlow={false} interactiveMode={false} />
          </div>
        )}

        {/* TAB: ANOMALY AI */}
        {activeTab === 'ANOMALY' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Anomaly Detection & Fault Classification</h2>
              <p className="text-sm text-slate-500 font-mono mt-0.5">Isolation Forest · LSTM Degradation Model · SHAP Feature Attribution</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <AnomalyTimeline telemetry={telemetry} history={history} />
              </div>
              <div>
                <FaultProbability probabilities={STATIC_FAULT_PROBABILITIES} />
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <TelemetryChart title="EGT Residual (Actual − Twin)" data={history} dataKeyActual="egt" dataKeyPredicted="predictedEgt" unit="°C" actualColor="#f97316" predictedColor="#8b5cf6" height={200} />
              <TelemetryChart title="Vibration Residual" data={history} dataKeyActual="vibration" dataKeyPredicted="predictedVibration" unit="mm/s" actualColor="#ef4444" predictedColor="#8b5cf6" height={200} />
            </div>
          </div>
        )}

        {/* TAB: RUL PROGNOSIS */}
        {activeTab === 'RUL' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Remaining Useful Life (RUL) Estimation</h2>
              <p className="text-sm text-slate-500 font-mono mt-0.5">Bayesian LSTM · 90% Confidence Interval · TBO 200h Reference</p>
            </div>
            <RULChart
              estimatedRul={telemetry.estimatedRul}
              confidenceLow={telemetry.rulConfidenceLow}
              confidenceHigh={telemetry.rulConfidenceHigh}
              currentHealth={telemetry.engineHealthIndex}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col items-center justify-center">
                <HealthGauge value={telemetry.engineHealthIndex} size={180} label="ENGINE HEALTH" sublabel={`RUL ~${telemetry.estimatedRul}h`} />
              </div>
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Subsystem Contribution to Degradation</h3>
                <div className="space-y-3">
                  <SubsystemBar label="Combustion (EGT / Fuel Spray)"      value={telemetry.subsystemHealth.combustion}  color="#f97316" />
                  <SubsystemBar label="Thermal (CHT / Heat Rejection)"      value={telemetry.subsystemHealth.thermal}     color="#ef4444" />
                  <SubsystemBar label="Lubrication (Oil P / Oil T)"         value={telemetry.subsystemHealth.lubrication} color="#10b981" />
                  <SubsystemBar label="Mechanical (Vibration / Bearings)"   value={telemetry.subsystemHealth.mechanical}  color="#8b5cf6" />
                  <SubsystemBar label="Electrical (Alternator / Battery)"   value={telemetry.subsystemHealth.electrical}  color="#06b6d4" />
                  <SubsystemBar label="Fuel System (Injector / Rail P)"     value={telemetry.subsystemHealth.fuelSystem}  color="#f59e0b" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MAINTENANCE */}
        {activeTab === 'MAINTENANCE' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Predictive Maintenance Advisory</h2>
                <p className="text-sm text-slate-500 font-mono mt-0.5">AI-Generated Decision Support — Advisory ID: {CURRENT_MAINTENANCE_ADVISORY.id}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${CURRENT_MAINTENANCE_ADVISORY.severity === 'CRITICAL' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
                {CURRENT_MAINTENANCE_ADVISORY.severity}
              </span>
            </div>
            <MaintenanceAdvisoryCard advisory={CURRENT_MAINTENANCE_ADVISORY} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <FaultProbability probabilities={STATIC_FAULT_PROBABILITIES} />
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Engine Health Trend</h3>
                <TelemetryChart title="Engine Health Index (%)" data={history} dataKeyActual="engineHealthIndex" unit="%" actualColor="#10b981" height={180} allowTimeRangeFilter={false} />
              </div>
            </div>
          </div>
        )}

        {/* TAB: SIMULATION */}
        {activeTab === 'SIMULATION' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Engine Digital Twin Simulation Controls</h2>
              <p className="text-sm text-slate-500 font-mono mt-0.5">Inject mission scenarios, environmental conditions, and fault modes into the virtual engine model.</p>
            </div>
            <SimulationPanel onCompareWithTwin={() => setActiveTab('TELEMETRY')} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <DigitalTwinEngine telemetry={telemetry} showSubsystemFlow={true} interactiveMode={true} />
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col items-center">
                  <HealthGauge value={telemetry.engineHealthIndex} size={160} label="ENGINE HEALTH" sublabel={`Score: ${telemetry.anomalyScore.toFixed(2)}`} />
                </div>
                <TelemetryCard label="Anomaly Score" value={telemetry.anomalyScore.toFixed(2)} unit="" status={telemetry.anomalyScore > 0.5 ? 'CRITICAL' : telemetry.anomalyScore > 0.3 ? 'WARNING' : 'NORMAL'} subtitle="Isolation Forest Output" />
                <TelemetryCard label="Degradation Level" value={telemetry.degradationLevel} unit="" status={telemetry.degradationLevel === 'CRITICAL' || telemetry.degradationLevel === 'SEVERE' ? 'CRITICAL' : telemetry.degradationLevel === 'MODERATE' || telemetry.degradationLevel === 'LOW' ? 'WARNING' : 'NORMAL'} subtitle="Multi-sensor ML Assessment" />
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <TelemetryChart title="EGT: Physical Engine vs Digital Twin" data={history} dataKeyActual="egt" dataKeyPredicted="predictedEgt" unit="°C" actualColor="#f97316" predictedColor="#8b5cf6" height={200} />
              <TelemetryChart title="Fuel Flow: Physical Engine vs Digital Twin" data={history} dataKeyActual="fuelFlow" dataKeyPredicted="predictedFuelFlow" unit="L/h" actualColor="#f59e0b" predictedColor="#8b5cf6" height={200} />
            </div>
          </div>
        )}

        {/* TAB: CAN BUS */}
        {activeTab === 'CAN_BUS' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">CAN Bus / SocketCAN Frame Monitor</h2>
              <p className="text-sm text-slate-500 font-mono mt-0.5">Real-time J1939 / CAN 2.0B frame capture from FADEC ECU — 500kbps · CRC-16 Validated</p>
            </div>
            <CanFrameMonitor telemetry={telemetry} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TelemetryCard label="Battery Voltage" value={parseFloat(telemetry.batteryVoltage.toFixed(2))} unit="V" nominalMin={27.5} nominalMax={28.8} status={telemetry.batteryVoltage < 27 ? 'WARNING' : 'NORMAL'} subtitle="CAN0_POWER Node" />
              <TelemetryCard label="Battery Current" value={parseFloat(telemetry.batteryCurrent.toFixed(1))} unit="A" nominalMin={12} nominalMax={18} status="NORMAL" subtitle="Shunt Sensor" />
              <TelemetryCard label="Alternator Health" value={telemetry.alternatorCondition} unit="%" nominalMin={95} nominalMax={100} status={telemetry.alternatorCondition < 90 ? 'WARNING' : 'NORMAL'} subtitle="PM Alternator" />
              <TelemetryCard label="Injection Timing" value={telemetry.injectionTiming} unit="°BTDC" nominalMin={24} nominalMax={28} status={telemetry.injectionTiming < 23 || telemetry.injectionTiming > 29 ? 'WARNING' : 'NORMAL'} subtitle="FADEC Pulse Width" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <TelemetryChart title="Battery Voltage (CAN Power Node)" data={history} dataKeyActual="batteryVoltage" unit="V" actualColor="#06b6d4" height={200} allowTimeRangeFilter={false} />
              <TelemetryChart title="Engine Health Index Trend" data={history} dataKeyActual="engineHealthIndex" unit="%" actualColor="#10b981" height={200} allowTimeRangeFilter={false} />
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">DRONANETRA</span>
          <span>·</span>
          <span>MALE UAV Digital Twin GCS · v1.0.0</span>
          <span>·</span>
          <span>SIH 2026 Prototype</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Engine: Rotax 914/915 FADEC</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            CAN 2.0B · 500kbps · {new Date().toLocaleTimeString()}
          </span>
          <span>·</span>
          <span className={`font-bold ${hasActiveAlert ? 'text-rose-500' : 'text-emerald-600'}`}>
            {hasActiveAlert ? '⚠ ADVISORY ACTIVE' : '✓ ALL SYSTEMS NOMINAL'}
          </span>
        </div>
      </footer>
    </div>
  );
}
