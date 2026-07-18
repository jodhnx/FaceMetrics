export type EvidenceLevel = 'well_supported' | 'general_advice' | 'limited_evidence';
export type ScoreBand = 'strong' | 'balanced' | 'mild' | 'notable';

export interface MetricDefinition {
  id: string;
  label: string;
  category: 'symmetry' | 'proportions' | 'features' | 'photo' | 'skin';
  description: string;
  howMeasured: string;
  whyImportant: string;
  normRange: string;
  unit: string;
}

export interface MetricResult extends MetricDefinition {
  score: number;
  value: string;
  band: ScoreBand;
  impact: number;
  coachNote: string;
  tips: string[];
  exerciseIds: string[];
  heatmapWeight: number;
}

export interface Exercise {
  id: string;
  title: string;
  category: 'posture' | 'face' | 'jaw' | 'breathing';
  duration: string;
  frequency: string;
  evidence: EvidenceLevel;
  evidenceNote: string;
  steps: string[];
  relatedMetrics: string[];
}

export interface HeatmapPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  score: number;
  metricId: string;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number;
  checks: {
    faceVisible: boolean;
    headStraight: boolean;
    frontal: boolean;
    goodLighting: boolean;
    noSunglasses: boolean;
    neutralExpression: boolean;
  };
  message?: string;
  lightingScore: number;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  imageUri: string;
  overallScore: number;
  symmetryScore: number;
  proportionsScore: number;
  goldenRatioScore: number;
  photoQualityScore: number;
  metrics: MetricResult[];
  heatmap: HeatmapPoint[];
  radar: { label: string; value: number }[];
  strengths: { id: string; title: string; score: number; metricId: string; impact: number }[];
  improvements: { id: string; title: string; score: number; metricId: string; impact: number }[];
  coachSummary: string;
  dailyTips: string[];
  disclaimer: string;
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  autoDeletePhotos: boolean;
  saveHistory: boolean;
  weightKg?: number;
}

export interface WeightEntry {
  date: string;
  kg: number;
}
