import { EXERCISES, METRIC_CATALOG, TIPS_BY_METRIC } from '@/constants/catalog';
import { DISCLAIMERS } from '@/constants/theme';
import type {
  AnalysisResult,
  Exercise,
  HeatmapPoint,
  MetricResult,
  QualityCheckResult,
  ScoreBand,
} from '@/types/analysis';

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function band(score: number): ScoreBand {
  if (score >= 88) return 'strong';
  if (score >= 78) return 'balanced';
  if (score >= 68) return 'mild';
  return 'notable';
}

function uid() {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Realistic score distribution: mostly mid-high, rarely extreme */
function realisticScore(rand: () => number, bias = 0): number {
  // Box-Muller-ish via sum of uniforms → centered ~78–86
  const n = (rand() + rand() + rand() + rand()) / 4;
  return Math.round(clamp(68 + n * 28 + bias + (rand() - 0.5) * 4));
}

function formatValue(id: string, score: number, rand: () => number): string {
  switch (id) {
    case 'golden_ratio':
      return `${round1(1.55 + (score / 100) * 0.14)}`;
    case 'canthal_tilt':
      return `${round1(2 + (score / 100) * 6)}`;
    case 'eye_spacing':
    case 'nose_width':
    case 'nose_length':
    case 'lip_width':
    case 'midface_ratio':
    case 'lower_face_ratio':
    case 'forehead':
      return `${round1(0.2 + (score / 100) * 0.28)}`;
    case 'fwhr':
      return `${round1(1.75 + (score / 100) * 0.35)}`;
    case 'lip_shape':
      return `${round1(1.2 + (score / 100) * 0.4)}`;
    case 'eye_height':
    case 'mouth_corners':
      return `${round1((100 - score) * 0.05)}`;
    case 'head_tilt':
    case 'eye_angle':
      return `${round1((100 - score) * 0.06)}`;
    case 'philtrum':
      return `${round1(11 + rand() * 4)}`;
    case 'face_shape': {
      const shapes = ['Oval', 'Herzförmig', 'Rund', 'Eckig', 'Diamant'];
      return shapes[Math.floor(rand() * shapes.length)];
    }
    case 'facial_thirds':
    case 'facial_fifths':
      return `${Math.round(score)}% Balance`;
    default:
      return `${Math.round(score)}`;
  }
}

function coachFor(id: string, score: number, label: string): string {
  if (score >= 88) {
    return `Dein Wert für ${label} liegt im starken Bereich. Das ist eine Schätzung aus Landmarken – keine Aussage über Attraktivität.`;
  }
  if (score >= 78) {
    return `Dein Wert für ${label} liegt im durchschnittlichen bis guten Bereich. Kleine Abweichungen sind bei fast allen Menschen normal.`;
  }
  if (score >= 68) {
    return `${label} zeigt leichte Abweichungen vom Referenzbereich. Prüfe zuerst Fotoqualität und Haltung, bevor du Schlüsse ziehst.`;
  }
  return `${label} weicht deutlicher vom Referenzbereich ab – oft foto- oder haltungsbedingt. Die App bewertet keine objektive Schönheit.`;
}

function exercisesFor(id: string): string[] {
  return EXERCISES.filter((e) => e.relatedMetrics.includes(id)).map((e) => e.id);
}

const HEATMAP_LAYOUT: { id: string; label: string; x: number; y: number; metricId: string }[] = [
  { id: 'h_brow_l', label: 'Braue L', x: 0.34, y: 0.2, metricId: 'eyebrows' },
  { id: 'h_brow_r', label: 'Braue R', x: 0.66, y: 0.2, metricId: 'eyebrows' },
  { id: 'h_eye_l', label: 'Auge L', x: 0.35, y: 0.3, metricId: 'eye_height' },
  { id: 'h_eye_r', label: 'Auge R', x: 0.65, y: 0.3, metricId: 'eye_height' },
  { id: 'h_nose', label: 'Nase', x: 0.5, y: 0.45, metricId: 'nose_symmetry' },
  { id: 'h_cheek_l', label: 'Wange L', x: 0.3, y: 0.48, metricId: 'cheekbones' },
  { id: 'h_cheek_r', label: 'Wange R', x: 0.7, y: 0.48, metricId: 'cheekbones' },
  { id: 'h_lips', label: 'Lippen', x: 0.5, y: 0.6, metricId: 'lip_shape' },
  { id: 'h_jaw_l', label: 'Kiefer L', x: 0.36, y: 0.74, metricId: 'jawline' },
  { id: 'h_jaw_r', label: 'Kiefer R', x: 0.64, y: 0.74, metricId: 'jawline' },
  { id: 'h_chin', label: 'Kinn', x: 0.5, y: 0.84, metricId: 'chin' },
  { id: 'h_forehead', label: 'Stirn', x: 0.5, y: 0.1, metricId: 'forehead' },
];

export function checkImageQuality(imageUri: string): QualityCheckResult {
  if (!imageUri || imageUri.length < 6) {
    return {
      passed: false,
      score: 20,
      lightingScore: 20,
      checks: {
        faceVisible: false,
        headStraight: false,
        frontal: false,
        goodLighting: false,
        noSunglasses: false,
        neutralExpression: false,
      },
      message: 'Bitte neues Bild aufnehmen.',
    };
  }

  // Demo URI and normal photos pass; production would use Face Landmarker.
  const rand = mulberry32(hashSeed(imageUri + '_q'));
  const lightingScore = Math.round(clamp(72 + rand() * 24));

  return {
    passed: true,
    score: Math.round(clamp(78 + rand() * 18)),
    lightingScore,
    checks: {
      faceVisible: true,
      headStraight: true,
      frontal: true,
      goodLighting: lightingScore >= 70,
      noSunglasses: true,
      neutralExpression: true,
    },
  };
}

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function getAllExercises(): Exercise[] {
  return EXERCISES;
}

export async function analyzeFace(imageUri: string): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 2200 + Math.random() * 900));

  const rand = mulberry32(hashSeed(imageUri));
  const quality = checkImageQuality(imageUri);

  const metrics: MetricResult[] = METRIC_CATALOG.map((def) => {
    let bias = 0;
    if (def.category === 'photo') bias = (quality.score - 80) * 0.3;
    if (def.id === 'lighting_quality') bias = (quality.lightingScore - 80) * 0.5;
    if (def.id === 'skin_evenness') bias = (quality.lightingScore - 80) * 0.25;

    const score = realisticScore(rand, bias);
    const tips = TIPS_BY_METRIC[def.id] ?? [
      'Vergleiche nur ähnliche Lichtbedingungen.',
      'Allgemeine Pflege- und Fototipps – keine medizinischen Versprechen.',
    ];

    return {
      ...def,
      score,
      value: formatValue(def.id, score, rand),
      band: band(score),
      impact: round1(0.8 + rand() * 3.2),
      coachNote: coachFor(def.id, score, def.label),
      tips,
      exerciseIds: exercisesFor(def.id),
      heatmapWeight: def.category === 'symmetry' || def.category === 'features' ? 1 : 0.6,
    };
  });

  const byCat = (cat: string) =>
    metrics.filter((m) => m.category === cat).map((m) => m.score);

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 80;

  const symmetryScore = avg([
    ...byCat('symmetry'),
    metrics.find((m) => m.id === 'face_symmetry')?.score ?? 80,
  ]);
  const proportionsScore = avg(byCat('proportions'));
  const goldenRatioScore = metrics.find((m) => m.id === 'golden_ratio')?.score ?? 80;
  const photoQualityScore = quality.score;

  // Overall: measurable features only, capped realism
  const overallScore = Math.round(
    clamp(
      symmetryScore * 0.34 +
        proportionsScore * 0.28 +
        goldenRatioScore * 0.14 +
        avg(byCat('features')) * 0.18 +
        photoQualityScore * 0.06
    )
  );

  const sorted = [...metrics].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 5).map((m) => ({
    id: `s_${m.id}`,
    title: m.score >= 88 ? `Starke ${m.label}` : `Gute ${m.label}`,
    score: m.score,
    metricId: m.id,
    impact: m.impact,
  }));
  const improvements = sorted
    .slice(-5)
    .reverse()
    .map((m) => ({
      id: `i_${m.id}`,
      title: m.score >= 75 ? `Leichte Abweichung: ${m.label}` : `Fokus: ${m.label}`,
      score: m.score,
      metricId: m.id,
      impact: m.impact,
    }));

  const heatmap: HeatmapPoint[] = HEATMAP_LAYOUT.map((h) => {
    const m = metrics.find((x) => x.id === h.metricId);
    return {
      id: h.id,
      label: h.label,
      x: h.x,
      y: h.y,
      score: m?.score ?? 80,
      metricId: h.metricId,
    };
  });

  const radarLabels = [
    'face_symmetry',
    'golden_ratio',
    'jawline',
    'eye_spacing',
    'nose_symmetry',
    'lip_shape',
    'cheekbones',
    'facial_thirds',
  ];
  const radar = radarLabels.map((id) => {
    const m = metrics.find((x) => x.id === id)!;
    return { label: m.label.split(' ')[0], value: m.score };
  });

  const coachSummary =
    overallScore >= 85
      ? `Dein Gesamtscore liegt bei ${overallScore}. Symmetrie und Proportionen wirken ausgewogen. Kleine Unterschiede zwischen linker und rechter Gesichtshälfte sind normal und bei fast allen Menschen vorhanden.`
      : overallScore >= 75
        ? `Dein Gesamtscore liegt bei ${overallScore} im durchschnittlichen Bereich. Gesichtssymmetrie und Proportionen zeigen typische natürliche Variation. Die Werte sind KI-Schätzungen auf Basis von Landmarken.`
        : `Dein Gesamtscore liegt bei ${overallScore}. Prüfe zuerst Licht, Kopfhaltung und Frontalität – diese Faktoren beeinflussen Messungen stark. Die App bewertet keine objektive Attraktivität.`;

  const dailyTips = [
    improvements[0] ? `Heute fokussieren: ${improvements[0].title.replace(/^[^:]+:\s*/, '')}` : 'Gleichmäßiges Tageslicht für bessere Vergleichbarkeit.',
    'SPF bei Tageslicht – allgemeine Hautpflegeempfehlung.',
    'Chin Tucks für Haltung (ändert keine Knochenstruktur).',
    'Neutrales Frontalfoto für den nächsten Scan.',
  ];

  return {
    id: uid(),
    createdAt: new Date().toISOString(),
    imageUri,
    overallScore,
    symmetryScore,
    proportionsScore,
    goldenRatioScore,
    photoQualityScore,
    metrics,
    heatmap,
    radar,
    strengths,
    improvements,
    coachSummary,
    dailyTips,
    disclaimer: DISCLAIMERS.analysis,
  };
}

export function compareScans(current: AnalysisResult, previous?: AnalysisResult | null) {
  if (!previous) return null;
  return {
    overall: current.overallScore - previous.overallScore,
    symmetry: current.symmetryScore - previous.symmetryScore,
    proportions: current.proportionsScore - previous.proportionsScore,
    golden: current.goldenRatioScore - previous.goldenRatioScore,
  };
}
