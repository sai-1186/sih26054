import { TelemetryPoint, FaultType, DegradationLevel, DeviationStatus, MissionPhase } from '../types/telemetry';

export interface SimulationParams {
  altitude: number;             // ft
  throttle: number;             // %
  ambientTemperature: number;  // °C
  faultInjected: boolean;
  activeFaultType: FaultType;
  faultSeverity: number;        // 0.0 - 1.0 (gradual degradation)
  scenarioName: string;
}

class MockTelemetryService {
  private currentParams: SimulationParams = {
    altitude: 10000,
    throttle: 70,
    ambientTemperature: 25,
    faultInjected: false,
    activeFaultType: 'NONE',
    faultSeverity: 0,
    scenarioName: 'Normal Cruise',
  };

  private history: TelemetryPoint[] = [];
  private maxHistoryLength = 120; // 2 minutes of 1-sec ticks
  private listeners: ((point: TelemetryPoint, history: TelemetryPoint[]) => void)[] = [];
  private timer: number | null = null;
  private tickCounter = 0;

  constructor() {
    this.initHistory();
    this.start();
  }

  private initHistory() {
    const now = Date.now();
    for (let i = this.maxHistoryLength; i >= 0; i--) {
      const t = now - i * 1000;
      const point = this.calculatePoint(t, false);
      this.history.push(point);
    }
  }

  public getParams(): SimulationParams {
    return { ...this.currentParams };
  }

  public setParams(partial: Partial<SimulationParams>) {
    this.currentParams = { ...this.currentParams, ...partial };
    // If user activated fault but fault type was NONE, default to INJECTOR_DEGRADATION
    if (this.currentParams.faultInjected && this.currentParams.activeFaultType === 'NONE') {
      this.currentParams.activeFaultType = 'INJECTOR_DEGRADATION';
    }
  }

  public injectFault(faultType: FaultType = 'INJECTOR_DEGRADATION') {
    this.currentParams.faultInjected = true;
    this.currentParams.activeFaultType = faultType;
    this.currentParams.faultSeverity = 0.85;
  }

  public clearFault() {
    this.currentParams.faultInjected = false;
    this.currentParams.activeFaultType = 'NONE';
    this.currentParams.faultSeverity = 0;
  }

  public resetSimulation() {
    this.currentParams = {
      altitude: 10000,
      throttle: 70,
      ambientTemperature: 25,
      faultInjected: false,
      activeFaultType: 'NONE',
      faultSeverity: 0,
      scenarioName: 'Normal Cruise',
    };
  }

  public applyPreset(scenario: string) {
    switch (scenario) {
      case 'Normal Cruise':
        this.currentParams = {
          altitude: 10000,
          throttle: 70,
          ambientTemperature: 25,
          faultInjected: false,
          activeFaultType: 'NONE',
          faultSeverity: 0,
          scenarioName: 'Normal Cruise',
        };
        break;
      case 'High Altitude':
        this.currentParams = {
          altitude: 20000,
          throttle: 78,
          ambientTemperature: -15,
          faultInjected: false,
          activeFaultType: 'NONE',
          faultSeverity: 0,
          scenarioName: 'High Altitude',
        };
        break;
      case 'Hot Weather':
        this.currentParams = {
          altitude: 8000,
          throttle: 72,
          ambientTemperature: 38,
          faultInjected: false,
          activeFaultType: 'NONE',
          faultSeverity: 0,
          scenarioName: 'Hot Weather',
        };
        break;
      case 'Rapid Throttle':
        this.currentParams = {
          altitude: 6000,
          throttle: 85,
          ambientTemperature: 22,
          faultInjected: false,
          activeFaultType: 'NONE',
          faultSeverity: 0,
          scenarioName: 'Rapid Throttle',
        };
        break;
      case 'Endurance':
        this.currentParams = {
          altitude: 12000,
          throttle: 65,
          ambientTemperature: 18,
          faultInjected: false,
          activeFaultType: 'NONE',
          faultSeverity: 0,
          scenarioName: 'Endurance',
        };
        break;
    }
  }

  private calculatePoint(timestamp: number, isLive: boolean): TelemetryPoint {
    const { altitude, throttle, ambientTemperature, faultInjected, activeFaultType, faultSeverity } = this.currentParams;

    // Small stochastic noise
    const noise = (scale = 1) => (Math.random() - 0.5) * scale;
    const wave = Math.sin(timestamp / 5000) * 0.5;

    // 1. Digital Twin physics model predictions (Virtual Engine State)
    // Nominal physics mapping based on throttle (0-100%) and density altitude
    const densityRatio = Math.max(0.55, 1 - (altitude / 1000) * 0.022);
    const predRpm = 2400 + (throttle / 100) * 2600 * Math.sqrt(densityRatio); // ~4220 RPM at 70% throttle
    const predFuelFlow = 8 + (throttle / 100) * 14.5 * densityRatio;          // ~18.1 L/h
    const predEgt = 640 + (throttle / 100) * 85 + (ambientTemperature - 20) * 0.4; // ~701°C
    const predCht = 145 + (throttle / 100) * 42 + (ambientTemperature - 20) * 0.6; // ~174°C
    const predOilPressure = 3.6 + (predRpm / 5000) * 0.9;                         // ~4.36 bar
    const predOilTemp = 75 + (predRpm / 5000) * 20 + (ambientTemperature - 20) * 0.3; // ~92.5°C
    const predVibration = 1.6 + (predRpm / 5000) * 0.7;                          // ~2.18 mm/s

    // 2. Physical Engine actual values (diverges when fault injected)
    let actRpm = predRpm + noise(18) + wave * 5;
    let actFuelFlow = predFuelFlow + noise(0.2);
    let actEgt = predEgt + noise(2.5);
    let actCht = predCht + noise(1.2);
    let actOilPressure = predOilPressure + noise(0.04);
    let actOilTemp = predOilTemp + noise(0.3);
    let actVibration = predVibration + noise(0.08);

    // Apply Fault Injections if active
    let anomalyScore = 0.12 + Math.random() * 0.04;
    let healthIndex = 92 - Math.random() * 1.5;
    let degradationLevel: DegradationLevel = 'HEALTHY';
    let deviationStatus: DeviationStatus = 'NORMAL';

    if (faultInjected) {
      const sev = Math.min(1.0, faultSeverity + (isLive ? Math.min(0.15, this.tickCounter * 0.005) : 0));

      if (activeFaultType === 'INJECTOR_DEGRADATION') {
        // Injector coking / clogging: inefficient fuel spray causes fuel flow increase,
        // EGT rise (lean burn / uneven flame front), vibration rise, slight RPM instability
        actEgt += sev * 42 + noise(4);            // rises from ~700 -> 742°C
        actVibration += sev * 3.4 + noise(0.3);    // rises from ~2.1 -> 5.5 mm/s
        actFuelFlow += sev * 4.2 + noise(0.2);     // rises from 18 -> 22.2 L/h
        actOilPressure -= sev * 0.8 + noise(0.05); // drops slightly 4.2 -> 3.4 bar
        actRpm -= sev * 80 + noise(25);            // slight RPM drop / roughness
        
        anomalyScore = 0.55 + sev * 0.32;          // jumps to ~0.81 - 0.87
        healthIndex = Math.max(38, 92 - sev * 32); // drops to 68% - 60%
        degradationLevel = healthIndex > 75 ? 'LOW' : healthIndex > 60 ? 'MODERATE' : 'CRITICAL';
        deviationStatus = anomalyScore > 0.75 ? 'ANOMALOUS' : 'WARNING';
      } 
      else if (activeFaultType === 'LUBRICATION_DEGRADATION') {
        // Oil pump or bearing seal wear: pressure drops rapidly, oil temp spikes, mechanical friction raises vibration
        actOilPressure -= sev * 1.8;              // 4.2 -> 2.4 bar (CRITICAL)
        actOilTemp += sev * 24;                   // 92 -> 116°C
        actCht += sev * 18;
        actVibration += sev * 2.8;
        anomalyScore = 0.65 + sev * 0.28;
        healthIndex = Math.max(35, 92 - sev * 45);
        degradationLevel = healthIndex > 65 ? 'MODERATE' : 'CRITICAL';
        deviationStatus = 'ANOMALOUS';
      }
      else if (activeFaultType === 'OVERHEATING') {
        // High thermal stress: CHT and EGT critical
        actCht += sev * 38;                       // 175 -> 213°C
        actEgt += sev * 60;                       // 700 -> 760°C
        actOilTemp += sev * 19;
        anomalyScore = 0.60 + sev * 0.30;
        healthIndex = Math.max(40, 92 - sev * 38);
        degradationLevel = 'CRITICAL';
        deviationStatus = 'ANOMALOUS';
      }
      else if (activeFaultType === 'VIBRATION_DEGRADATION') {
        // Propeller/shaft imbalance or bearing pitting
        actVibration += sev * 5.2;                // 2.1 -> 7.3 mm/s
        anomalyScore = 0.58 + sev * 0.30;
        healthIndex = Math.max(48, 92 - sev * 35);
        degradationLevel = healthIndex > 65 ? 'MODERATE' : 'CRITICAL';
        deviationStatus = anomalyScore > 0.7 ? 'ANOMALOUS' : 'WARNING';
      }
      else if (activeFaultType === 'SENSOR_DRIFT') {
        // Sensor bias without real engine physical damage (AI can distinguish via correlation matrix!)
        actEgt += sev * 45;                       // Sensor drifts high
        // Other parameters remain nominal!
        anomalyScore = 0.48 + sev * 0.25;
        healthIndex = 86 - sev * 12;
        degradationLevel = 'LOW';
        deviationStatus = 'WARNING';
      }
    }

    // Residuals = Actual - Predicted
    const residualRpm = actRpm - predRpm;
    const residualEgt = actEgt - predEgt;
    const residualCht = actCht - predCht;
    const residualOilPressure = actOilPressure - predOilPressure;
    const residualOilTemperature = actOilTemp - predOilTemp;
    const residualFuelFlow = actFuelFlow - predFuelFlow;
    const residualVibration = actVibration - predVibration;

    // RUL calculation
    // Base healthy RUL = 126 hours
    // Degrades non-linearly as Health Index drops below 85%
    let estimatedRul = 126;
    if (healthIndex < 85) {
      const dropRatio = (85 - healthIndex) / 45; // 0 to 1
      estimatedRul = Math.max(18, Math.round(126 - dropRatio * 74)); // drops from 126h -> ~52h
    }
    const rulConfidenceLow = Math.max(12, Math.round(estimatedRul * 0.88));
    const rulConfidenceHigh = Math.round(estimatedRul * 1.12);

    // Mission Phase deduction
    let missionPhase: MissionPhase = 'CRUISE';
    if (altitude > 16000) missionPhase = 'HIGH_ALTITUDE';
    else if (throttle > 85) missionPhase = 'CLIMB';
    else if (throttle < 45) missionPhase = 'DESCENT';
    else if (throttle < 20) missionPhase = 'IDLE';

    // Subsystem health calculation
    const combustion = Math.round(Math.max(20, Math.min(100, 100 - Math.abs(residualEgt) * 1.2 - Math.abs(residualFuelFlow) * 3)));
    const thermal = Math.round(Math.max(20, Math.min(100, 100 - Math.abs(residualCht) * 1.5 - Math.abs(residualOilTemperature) * 1.2)));
    const lubrication = Math.round(Math.max(20, Math.min(100, 100 - Math.abs(residualOilPressure) * 45)));
    const mechanical = Math.round(Math.max(20, Math.min(100, 100 - Math.abs(residualVibration) * 16)));
    const electrical = 96;
    const fuelSystem = Math.round(Math.max(25, Math.min(100, 100 - Math.abs(residualFuelFlow) * 6)));

    const date = new Date(timestamp);
    const timeString = date.toTimeString().split(' ')[0];

    return {
      timestamp,
      timeString,
      rpm: Math.round(actRpm),
      egt: Math.round(actEgt * 10) / 10,
      cht: Math.round(actCht * 10) / 10,
      oilPressure: Math.round(actOilPressure * 100) / 100,
      oilTemperature: Math.round(actOilTemp * 10) / 10,
      fuelFlow: Math.round(actFuelFlow * 10) / 10,
      vibration: Math.round(actVibration * 100) / 100,
      altitude: Math.round(altitude),
      throttle: Math.round(throttle),
      ambientTemperature: Math.round(ambientTemperature),
      manifoldPressure: Math.round((28.5 + (throttle / 100) * 8.2) * 10) / 10,
      batteryVoltage: 28.2 + noise(0.15),
      batteryCurrent: 14.8 + noise(0.5),
      alternatorCondition: 98,
      injectionTiming: 26.0 + (throttle > 75 ? 1.5 : 0),
      
      predictedRpm: Math.round(predRpm),
      predictedEgt: Math.round(predEgt * 10) / 10,
      predictedCht: Math.round(predCht * 10) / 10,
      predictedOilPressure: Math.round(predOilPressure * 100) / 100,
      predictedOilTemperature: Math.round(predOilTemp * 10) / 10,
      predictedFuelFlow: Math.round(predFuelFlow * 10) / 10,
      predictedVibration: Math.round(predVibration * 100) / 100,

      residualRpm: Math.round(residualRpm),
      residualEgt: Math.round(residualEgt * 10) / 10,
      residualCht: Math.round(residualCht * 10) / 10,
      residualOilPressure: Math.round(residualOilPressure * 100) / 100,
      residualOilTemperature: Math.round(residualOilTemperature * 10) / 10,
      residualFuelFlow: Math.round(residualFuelFlow * 10) / 10,
      residualVibration: Math.round(residualVibration * 100) / 100,

      engineHealthIndex: Math.round(healthIndex),
      subsystemHealth: {
        combustion,
        thermal,
        lubrication,
        mechanical,
        electrical,
        fuelSystem,
      },
      anomalyScore: Math.round(anomalyScore * 100) / 100,
      estimatedRul,
      rulConfidenceLow,
      rulConfidenceHigh,

      missionPhase,
      engineStatus: 'RUNNING',
      degradationLevel,
      deviationStatus,
      activeFault: faultInjected ? activeFaultType : 'NONE',
    };
  }

  public subscribe(listener: (point: TelemetryPoint, history: TelemetryPoint[]) => void): () => void {
    this.listeners.push(listener);
    // Send immediate initial data
    if (this.history.length > 0) {
      listener(this.history[this.history.length - 1], this.history);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private start() {
    if (this.timer) return;
    this.timer = window.setInterval(() => {
      this.tickCounter++;
      const now = Date.now();
      const point = this.calculatePoint(now, true);
      this.history.push(point);
      if (this.history.length > this.maxHistoryLength) {
        this.history.shift();
      }
      this.listeners.forEach(fn => fn(point, [...this.history]));
    }, 1000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public getLatestPoint(): TelemetryPoint {
    return this.history[this.history.length - 1];
  }

  public getHistory(): TelemetryPoint[] {
    return [...this.history];
  }
}

export const telemetryService = new MockTelemetryService();
