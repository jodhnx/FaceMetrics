export type ScoreLevel = 'excellent' | 'good' | 'average' | 'mild' | 'notable';

export interface MetricValue {
  id: string;
  label: string;
  score: number;
  value: string;
  unit?: string;
  explanation: string;
  normRange: string;
  whyImportant: string;
  impact: number;
  level: ScoreLevel;
}

export interface StrengthWeakness {
  id: string;
  title: string;
  type: 'strength' | 'improvement';
  score: number;
  explanation: string;
  impact: number;
  category: string;
}

export interface ProportionMetric {
  id: string;
  label: string;
  score: number;
  value: number;
  ideal: number;
  unit: string;
  explanation: string;
}

export interface AttractivenessFactor {
  id: string;
  label: string;
  score: number;
  explanation: string;
}

export interface CelebrityMatch {
  id: string;
  name: string;
  similarity: number;
  note: string;
}

export interface PerceptionSim {
  everydaySymmetry: 'höher' | 'durchschnittlich' | 'niedriger';
  naturalness: 'hoch' | 'mittel' | 'niedrig';
  asymmetryNoticeability: 'gering' | 'mittel' | 'hoch';
  everydayDetectionChance: 'niedrig' | 'mittel' | 'hoch';
  summary: string;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  symmetry: number;
  label: string;
}

export interface QualityCheckResult {
  passed: boolean;
  checks: {
    faceVisible: boolean;
    headStraight: boolean;
    goodLighting: boolean;
    noSunglasses: boolean;
    neutralExpression: boolean;
  };
  message?: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  imageUri: string;
  overallScore: number;
  symmetryScore: number;
  goldenRatioScore: number;
  proportionsScore: number;
  symmetryMetrics: MetricValue[];
  proportionMetrics: ProportionMetric[];
  strengths: StrengthWeakness[];
  improvements: StrengthWeakness[];
  factors: AttractivenessFactor[];
  celebrityMatches: CelebrityMatch[];
  perception: PerceptionSim;
  heatmap: HeatmapPoint[];
  radar: { label: string; value: number }[];
  disclaimer: string;
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  autoDeletePhotos: boolean;
  saveHistory: boolean;
  language: 'de';
}
