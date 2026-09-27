import { TelemetryPoint, ReplayEventMarker, MaintenanceAdvisory, FaultProbabilityItem } from '../types/telemetry';

export const REPLAY_EVENTS: ReplayEventMarker[] = [
  {
    timeOffsetSec: 12,
    timestamp: '10:12:00',
    type: 'INFO',
    title: 'Mission Start & Climb',
    description: 'Aircraft cleared for takeoff. Throttle 92%, RPM 4800, climbing to FL100.',
  },
  {
    timeOffsetSec: 35,
    timestamp: '10:28:40',
    type: 'INFO',
    title: 'Cruise Established',
    description: 'Stabilized at 10,000 ft, throttle 70%, RPM 4210. Engine Health 94%.',
  },
  {
    timeOffsetSec: 52,
    timestamp: '10:42:15',
    type: 'ANOMALY',
    title: 'Anomaly Detected',
    description: 'Isolation Forest detected multi-variate deviation. Anomaly score jumped from 0.12 to 0.54.',
  },
  {
    timeOffsetSec: 64,
    timestamp: '10:44:32',
    type: 'DEVIATION',
    title: 'EGT Deviation Increased',
    description: 'Actual EGT reached 735°C vs Digital Twin predicted 700°C (Residual: +35°C).',
  },
  {
    timeOffsetSec: 78,
    timestamp: '10:48:10',
    type: 'WARNING',
    title: 'Vibration Abnormal',
    description: 'Engine RMS vibration elevated to 3.8 mm/s. Fuel flow increased to 20.8 L/h.',
  },
  {
    timeOffsetSec: 92,
    timestamp: '11:02:30',
    type: 'MAINTENANCE',
    title: 'Maintenance Advisory Generated',
    description: 'Random Forest & Autoencoder output: Injector/Combustion degradation (Confidence 72%). Attention required.',
  },
  {
    timeOffsetSec: 110,
    timestamp: '12:05:00',
    type: 'INFO',
    title: 'Descent & Safe Recovery',
    description: 'Conservative descent profile initiated. Safe recovery completed at Base 04.',
  },
];

export const STATIC_FAULT_PROBABILITIES: FaultProbabilityItem[] = [
  {
    id: 'INJECTOR_DEGRADATION',
    name: 'Injector / Combustion Degradation',
    probability: 72,
    riskLevel: 'HIGH',
    description: 'Fuel spray pattern distortion or partial injector coking causing localized lean combustion and elevated EGT.',
    affectedParameters: ['EGT (+35°C)', 'Fuel Flow (+2.8 L/h)', 'Vibration (+1.7 mm/s)'],
  },
  {
    id: 'LUBRICATION_DEGRADATION',
    name: 'Lubrication Degradation',
    probability: 14,
    riskLevel: 'MEDIUM',
    description: 'Slight oil viscosity breakdown or scavenger filter restriction.',
    affectedParameters: ['Oil Pressure (-0.4 bar)', 'Oil Temp (+6°C)'],
  },
  {
    id: 'OVERHEATING',
    name: 'Thermal / Cooling Degradation',
    probability: 9,
    riskLevel: 'LOW',
    description: 'Secondary thermal stress or cylinder head ducting turbulence.',
    affectedParameters: ['CHT (+12°C)', 'EGT (+18°C)'],
  },
  {
    id: 'SENSOR_DRIFT',
    name: 'EGT Thermocouple Sensor Drift',
    probability: 5,
    riskLevel: 'LOW',
    description: 'Thermocouple junction calibration shift or wiring impedance variation.',
    affectedParameters: ['EGT (Single-sensor deviation)'],
  },
];

export const CURRENT_MAINTENANCE_ADVISORY: MaintenanceAdvisory = {
  id: 'ADV-2026-UAV04-091',
  title: 'ATTENTION REQUIRED: Injector Degradation',
  severity: 'ATTENTION REQUIRED',
  healthIndex: 68,
  anomalyScore: 0.81,
  degradation: 'MODERATE',
  possibleIssue: 'Injector / Combustion Degradation',
  estimatedRul: 120,
  recommendedAction: 'Inspect injector and combustion system during the next scheduled maintenance interval.',
  evidence: [
    'Actual EGT (735°C) exceeds Digital Twin model predicted state (700°C) by +35°C',
    'Fuel flow increased from 18.0 L/h nominal to 20.8 L/h (+15.5%) under constant 70% throttle cruise',
    'Vibration RMS elevated from 2.1 mm/s to 3.8 mm/s with harmonic combustion pulsation',
    'Oil pressure remains stable at 4.0 bar, ruling out mechanical bearing failure as root cause',
  ],
  affectedParameters: ['EGT', 'Vibration', 'Fuel Flow', 'Engine Health Index'],
  timestamp: '2026-09-24 11:02:30 UTC',
  certifiedNotice: 'Decision Support System — Not a Certified Maintenance Procedure. Follow OEM Maintenance Manual MM-914-04.',
  checklist: [
    'Perform borescope inspection of Cylinder #2 and #4 fuel injector nozzles',
    'Verify fuel rail differential pressure and filter micron rating',
    'Conduct cold compression and leak-down test on cylinders 1 through 4',
    'Check ECU injector pulse width telemetry logging in FADEC buffer',
  ],
};

// Generate 120 historical replay samples
export function generateReplayData(): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const baseTime = new Date('2026-09-24T10:00:00Z').getTime();

  for (let i = 0; i <= 120; i++) {
    const t = baseTime + i * 65 * 1000;
    const progress = i / 120; // 0 to 1

    let altitude = 10000;
    let throttle = 70;
    let phase: TelemetryPoint['missionPhase'] = 'CRUISE';

    if (i < 15) {
      altitude = Math.round(1000 + i * 600);
      throttle = 90;
      phase = 'CLIMB';
    } else if (i > 105) {
      altitude = Math.round(10000 - (i - 105) * 600);
      throttle = 45;
      phase = 'DESCENT';
    }

    // Pred
    const predRpm = 4200;
    const predEgt = 700;
    const predCht = 175;
    const predOilPressure = 4.2;
    const predOilTemp = 92;
    const predFuelFlow = 18.0;
    const predVib = 2.1;

    // Actual - injected degradation starts at i = 45 and grows
    let actRpm = predRpm + (Math.sin(i) * 15);
    let actEgt = predEgt + (Math.cos(i) * 2);
    let actCht = predCht + (Math.sin(i * 0.5) * 1.5);
    let actOilPressure = predOilPressure + (Math.sin(i) * 0.03);
    let actOilTemp = predOilTemp + (Math.cos(i * 0.3) * 0.5);
    let actFuelFlow = predFuelFlow + (Math.sin(i * 0.7) * 0.2);
    let actVib = predVib + (Math.cos(i * 0.8) * 0.05);

    let anomalyScore = 0.12;
    let healthIndex = 94;
    let degLevel: TelemetryPoint['degradationLevel'] = 'HEALTHY';
    let devStatus: TelemetryPoint['deviationStatus'] = 'NORMAL';
    let estRul = 126;

    if (i >= 45) {
      const faultProgress = Math.min(1.0, (i - 45) / 40); // 0 to 1
      actEgt += faultProgress * 36;
      actVib += faultProgress * 1.8;
      actFuelFlow += faultProgress * 2.8;
      actOilPressure -= faultProgress * 0.3;
      anomalyScore = 0.12 + faultProgress * 0.69; // reaches 0.81
      healthIndex = Math.round(94 - faultProgress * 26); // reaches 68%
      estRul = Math.round(126 - faultProgress * 6); // reaches 120h
      degLevel = healthIndex > 80 ? 'LOW' : 'MODERATE';
      devStatus = anomalyScore > 0.6 ? 'ANOMALOUS' : 'WARNING';
    }

    const date = new Date(t);
    const timeString = date.toISOString().substring(11, 19);

    points.push({
      timestamp: t,
      timeString,
      rpm: Math.round(actRpm),
      egt: Math.round(actEgt * 10) / 10,
      cht: Math.round(actCht * 10) / 10,
      oilPressure: Math.round(actOilPressure * 100) / 100,
      oilTemperature: Math.round(actOilTemp * 10) / 10,
      fuelFlow: Math.round(actFuelFlow * 10) / 10,
      vibration: Math.round(actVib * 100) / 100,
      altitude,
      throttle,
      ambientTemperature: 22,
      manifoldPressure: 31.2,
      batteryVoltage: 28.1,
      batteryCurrent: 15.2,
      alternatorCondition: 98,
      injectionTiming: 26.0,

      predictedRpm: predRpm,
      predictedEgt: predEgt,
      predictedCht: predCht,
      predictedOilPressure: predOilPressure,
      predictedOilTemperature: predOilTemp,
      predictedFuelFlow: predFuelFlow,
      predictedVibration: predVib,

      residualRpm: Math.round(actRpm - predRpm),
      residualEgt: Math.round((actEgt - predEgt) * 10) / 10,
      residualCht: Math.round((actCht - predCht) * 10) / 10,
      residualOilPressure: Math.round((actOilPressure - predOilPressure) * 100) / 100,
      residualOilTemperature: Math.round((actOilTemp - predOilTemp) * 10) / 10,
      residualFuelFlow: Math.round((actFuelFlow - predFuelFlow) * 10) / 10,
      residualVibration: Math.round((actVib - predVib) * 100) / 100,

      engineHealthIndex: healthIndex,
      subsystemHealth: {
        combustion: Math.round(Math.max(40, 100 - (actEgt - predEgt) * 1.5)),
        thermal: Math.round(Math.max(50, 100 - (actCht - predCht) * 2.0)),
        lubrication: 92,
        mechanical: Math.round(Math.max(50, 100 - (actVib - predVib) * 18)),
        electrical: 98,
        fuelSystem: Math.round(Math.max(45, 100 - (actFuelFlow - predFuelFlow) * 7)),
      },
      anomalyScore: Math.round(anomalyScore * 100) / 100,
      estimatedRul: estRul,
      rulConfidenceLow: Math.round(estRul * 0.88),
      rulConfidenceHigh: Math.round(estRul * 1.12),

      missionPhase: phase,
      engineStatus: 'RUNNING',
      degradationLevel: degLevel,
      deviationStatus: devStatus,
      activeFault: i >= 45 ? 'INJECTOR_DEGRADATION' : 'NONE',
    });
  }

  return points;
}
