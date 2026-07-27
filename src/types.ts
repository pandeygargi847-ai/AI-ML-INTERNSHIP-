export interface CVMetrics {
  heartRate: number; // BPM (e.g. 72)
  hrvSdnn: number; // SDNN in ms (e.g. 48)
  hrvRmssd: number; // RMSSD in ms (e.g. 42)
  respirationRate: number; // RPM (e.g. 16)
  fatigueIndex: number; // 0 - 100
  blinkRate: number; // blinks per minute (e.g. 14)
  eyeAspectRatio: number; // EAR value (~0.2 - 0.35)
  postureScore: number; // 0 - 100
  headTiltAngle: number; // degrees
  signalQuality: number; // 0 - 100% SNR
  fps: number; // processed frames per sec
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  sleepHours: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  recentSymptoms: string[];
}

export interface HealthPrediction {
  timestamp: string;
  overallHealthScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED';
  autonomicStressIndex: number; // 0 - 100
  cardiovascularWellnessScore: number; // 0 - 100
  fatigueRiskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  biomarkers: {
    name: string;
    value: string;
    status: 'optimal' | 'borderline' | 'attention';
    description: string;
  }[];
  aiSummary: string;
  recommendations: string[];
  physiologicalFactors: string[];
  confidenceScore: number; // percentage
  retestTimeframe: string;
}

export interface ScanSession {
  id: string;
  timestamp: string;
  durationSeconds: number;
  metrics: CVMetrics;
  prediction?: HealthPrediction;
  rawPpgWave: number[];
  profile: UserProfile;
}

export type CVMode = 'live' | 'demo';

export type CVFilterMode = 'raw' | 'opencv_matrix' | 'ppg_green' | 'face_landmarks' | 'heatmap';
