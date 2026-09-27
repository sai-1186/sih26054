export type EngineStatus = 'RUNNING' | 'WARMUP' | 'IDLE' | 'SHUTDOWN' | 'EMERGENCY';

export type DegradationLevel = 'HEALTHY' | 'LOW' | 'MODERATE' | 'CRITICAL' | 'SEVERE';

export type DeviationStatus = 'NORMAL' | 'WARNING' | 'ANOMALOUS';

export type MissionPhase = 'IDLE' | 'TAKEOFF' | 'CLIMB' | 'CRUISE' | 'HIGH_ALTITUDE' | 'DESCENT' | 'LANDED';

export type FaultType = 
  | 'NONE'
  | 'INJECTOR_DEGRADATION'
  | 'LUBRICATION_DEGRADATION'
  | 'OVERHEATING'
  | 'VIBRATION_DEGRADATION'
  | 'SENSOR_DRIFT';

export interface TelemetryPoint {
  timestamp: number;
  timeString: string;
  
  // Primary Engine Sensors
  rpm: number;                  // Engine Speed (RPM, nominal 4000-4500)
  egt: number;                  // Exhaust Gas Temp (°C, nominal 680-720)
  cht: number;                  // Cylinder Head Temp (°C, nominal 160-185)
  oilPressure: number;          // Oil Pressure (bar, nominal 3.8-4.5)
  oilTemperature: number;       // Oil Temperature (°C, nominal 85-98)
  fuelFlow: number;             // Fuel Flow (L/h, nominal 16-22)
  vibration: number;            // Vibration RMS (mm/s, nominal 1.8-2.5)
  
  // Mission & Environment Conditions
  altitude: number;             // Altitude (ft)
  throttle: number;             // Throttle position (%)
  ambientTemperature: number;  // Ambient Temp (°C)
  manifoldPressure: number;     // Manifold Absolute Pressure (inHg, nominal 28-36)
  
  // Electrical & Auxiliary
  batteryVoltage: number;       // Voltage (V, nominal 27.5-28.8)
  batteryCurrent: number;       // Current (A, nominal 12-18)
  alternatorCondition: number;  // Alternator Health (%)
  injectionTiming: number;      // Injection Timing (°BTDC, nominal 24-28)
  
  // Digital Twin Predicted Values
  predictedRpm: number;
  predictedEgt: number;
  predictedCht: number;
  predictedOilPressure: number;
  predictedOilTemperature: number;
  predictedFuelFlow: number;
  predictedVibration: number;

  // Residuals (Actual - Predicted)
  residualRpm: number;
  residualEgt: number;
  residualCht: number;
  residualOilPressure: number;
  residualOilTemperature: number;
  residualFuelFlow: number;
  residualVibration: number;

  // AI & Health Indices
  engineHealthIndex: number;    // EHI 0-100%
  subsystemHealth: {
    combustion: number;
    thermal: number;
    lubrication: number;
    mechanical: number;
    electrical: number;
    fuelSystem: number;
  };
  anomalyScore: number;         // 0.00 - 1.00
  estimatedRul: number;         // Hours
  rulConfidenceLow: number;     // 90% confidence interval lower bound
  rulConfidenceHigh: number;    // 90% confidence interval upper bound
  
  // State metadata
  missionPhase: MissionPhase;
  engineStatus: EngineStatus;
  degradationLevel: DegradationLevel;
  deviationStatus: DeviationStatus;
  activeFault: FaultType;
}

export interface FaultProbabilityItem {
  id: FaultType;
  name: string;
  probability: number; // 0 - 100%
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedParameters: string[];
}

export interface MaintenanceAdvisory {
  id: string;
  title: string;
  severity: 'ATTENTION REQUIRED' | 'WARNING' | 'CRITICAL' | 'NORMAL';
  healthIndex: number;
  anomalyScore: number;
  degradation: DegradationLevel;
  possibleIssue: string;
  estimatedRul: number;
  recommendedAction: string;
  evidence: string[];
  affectedParameters: string[];
  timestamp: string;
  certifiedNotice: string;
  checklist: string[];
}

export interface ReplayEventMarker {
  timeOffsetSec: number;
  timestamp: string;
  type: 'INFO' | 'ANOMALY' | 'DEVIATION' | 'WARNING' | 'MAINTENANCE';
  title: string;
  description: string;
  telemetrySnapshot?: Partial<TelemetryPoint>;
}

export interface CanBusMessage {
  timestamp: string;
  id: string;
  channel: string;
  dlc: number;
  data: string[];
  decoded: string;
  status: 'VALID' | 'CRC_OK' | 'DEV_ALERT';
}
