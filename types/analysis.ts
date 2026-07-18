export type EvidenceLevel = 'well_supported' | 'general_advice' | 'limited_evidence';
export type ScoreBand = 'strong' | 'balanced' | 'mild' | 'notable';
export type ScanPose =
  | 'center'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'center_final';

export interface MetricDefinition {
  id: string;
  label: string;
  category: 'symmetry' | 'proportions' | 'features' | 'photo' | 'skin' | 'profile';
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
  scoreReason: string;
  contributingValues: string[];
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

export interface PerceptionSim {
  asymmetryEveryday: string;
  proportionsFeel: string;
  jawlineFeel: string;
  expressionFeel: string;
  profileFeel: string;
  summary: string;
  disclaimer: string;
}

export interface ScanCapture {
  pose: ScanPose;
  uri: string;
  capturedAt: string;
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
  updatedAt?: string;
  imageUri: string;
  scanType: 'photo' | '360';
  captures?: ScanCapture[];
  favorite?: boolean;
  note?: string;
  overallScore: number;
  symmetryScore: number;
  proportionsScore: number;
  goldenRatioScore: number;
  photoQualityScore: number;
  profileScore: number;
  jawlineScore: number;
  skinScore: number;
  metrics: MetricResult[];
  heatmap: HeatmapPoint[];
  radar: { label: string; value: number }[];
  strengths: { id: string; title: string; score: number; metricId: string; impact: number }[];
  improvements: { id: string; title: string; score: number; metricId: string; impact: number }[];
  perception: PerceptionSim;
  coachSummary: string;
  dailyTips: string[];
  disclaimer: string;
  scoreBreakdown: string;
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

export const SCAN_STEPS: {
  pose: ScanPose;
  title: string;
  instruction: string;
  hint: string;
  targetProgress: number;
}[] = [
  {
    pose: 'center',
    title: 'Geradeaus',
    instruction: 'Gesicht gerade in den Rahmen',
    hint: 'Blick in die Kamera, neutraler Ausdruck',
    targetProgress: 12,
  },
  {
    pose: 'left',
    title: 'Nach links',
    instruction: 'Kopf langsam nach links drehen',
    hint: 'Bitte Kopf etwas weiter nach links drehen.',
    targetProgress: 28,
  },
  {
    pose: 'right',
    title: 'Nach rechts',
    instruction: 'Kopf langsam nach rechts drehen',
    hint: 'Gleichmäßig und langsam bewegen.',
    targetProgress: 48,
  },
  {
    pose: 'up',
    title: 'Leicht nach oben',
    instruction: 'Kinn leicht anheben',
    hint: 'Nicht zu weit – nur leicht nach oben.',
    targetProgress: 65,
  },
  {
    pose: 'down',
    title: 'Leicht nach unten',
    instruction: 'Kinn leicht senken',
    hint: 'Hals entspannt, Blick leicht nach unten.',
    targetProgress: 82,
  },
  {
    pose: 'center_final',
    title: 'Zurück zur Mitte',
    instruction: 'Langsam zurück in die Mitte',
    hint: 'Abschlussaufnahme frontal.',
    targetProgress: 100,
  },
];
