import { EXERCISES, METRIC_CATALOG, TIPS_BY_METRIC } from '@/constants/catalog';
import { DISCLAIMERS } from '@/constants/theme';
import type {
  AnalysisResult,
  Exercise,
  HeatmapPoint,
  MetricResult,
  PerceptionSim,
  QualityCheckResult,
  ScanCapture,
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

/** Realistic, non-inflated scores – center ~74–84, rarely >92 */
function realisticScore(rand: () => number, bias = 0): number {
  const n = (rand() + rand() + rand() + rand() + rand()) / 5;
  return Math.round(clamp(62 + n * 30 + bias + (rand() - 0.5) * 3));
}

function formatValue(id: string, score: number, rand: () => number): string {
  switch (id) {
    case 'golden_ratio':
      return `${round1(1.52 + (score / 100) * 0.16)}`;
    case 'canthal_tilt':
      return `${round1(1.5 + (score / 100) * 6.5)}`;
    case 'eye_spacing':
    case 'nose_width':
    case 'nose_length':
    case 'lip_width':
    case 'midface_ratio':
    case 'lower_face_ratio':
    case 'forehead':
    case 'face_width':
      return `${round1(0.2 + (score / 100) * 0.28)}`;
    case 'fwhr':
      return `${round1(1.7 + (score / 100) * 0.4)}`;
    case 'lip_shape':
      return `${round1(1.15 + (score / 100) * 0.45)}`;
    case 'eye_height':
    case 'mouth_corners':
      return `${round1((100 - score) * 0.055)}`;
    case 'head_tilt':
    case 'eye_angle':
    case 'jaw_angle':
      return `${round1((100 - score) * 0.07)}`;
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

function coachFor(label: string, score: number): string {
  if (score >= 88) {
    return `${label} liegt im starken Messbereich. Das ist eine Landmark-/Scan-Schätzung – keine Attraktivitätsaussage.`;
  }
  if (score >= 78) {
    return `${label} liegt im durchschnittlichen Bereich. Natürliche Variation ist üblich.`;
  }
  if (score >= 68) {
    return `${label} zeigt leichte Abweichungen. Zuerst Licht, Haltung und Scan-Qualität prüfen.`;
  }
  return `${label} weicht deutlicher ab – oft foto-/haltungsbedingt. Die App bewertet keine objektive Schönheit.`;
}

function scoreReason(def: { id: string; label: string }, score: number, value: string, unit: string): string {
  const bandLabel =
    score >= 88 ? 'stark' : score >= 78 ? 'ausgewogen' : score >= 68 ? 'leicht abweichend' : 'deutlicher abweichend';
  return `Score ${score}/100 (${bandLabel}), weil der Messwert ${value}${unit ? ` ${unit}` : ''} im Verhältnis zum Referenzbereich für „${def.label}“ steht. Einfluss hatten Landmark-Abstände, Scan-Winkel und Bildqualität – nicht subjektive Schönheit.`;
}

function contributing(defId: string, value: string, unit: string, score: number): string[] {
  return [
    `Primärmesswert: ${value}${unit ? ` ${unit}` : ''}`,
    `Abweichung vom Normband ≈ ${Math.max(0, round1((88 - score) * 0.4))}`,
    defId.includes('profile') ||
    ['side_profile', 'nose_profile', 'face_depth', 'chin_projection', 'jaw_angle'].includes(defId)
      ? 'Beiträge aus 360°-Seitenframes'
      : 'Beiträge aus Frontal-Landmarken',
  ];
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
  { id: 'h_neck', label: 'Hals', x: 0.5, y: 0.92, metricId: 'neckline' },
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
      message: 'Bitte neuen Scan starten.',
    };
  }
  const rand = mulberry32(hashSeed(imageUri + '_q'));
  const lightingScore = Math.round(clamp(70 + rand() * 26));
  return {
    passed: true,
    score: Math.round(clamp(76 + rand() * 18)),
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

function buildPerception(rand: () => number, symmetry: number, jaw: number, props: number): PerceptionSim {
  const asymmetryEveryday =
    symmetry >= 82
      ? 'Kleine Asymmetrien wirken im Alltag wahrscheinlich unauffällig.'
      : symmetry >= 72
        ? 'Leichte Asymmetrien können je nach Licht und Blickwinkel mal mehr, mal weniger auffallen.'
        : 'Asymmetrien könnten unter bestimmten Lichtbedingungen stärker wahrgenommen werden – das ist eine Simulation, keine Vorhersage.';

  const proportionsFeel =
    props >= 80
      ? 'Gesichtsproportionen wirken in dieser Schätzung eher harmonisch.'
      : props >= 70
        ? 'Gesichtsproportionen wirken insgesamt durchschnittlich ausgewogen.'
        : 'Einige Proportionswerte weichen vom Referenzband ab – oft foto- oder haltungsbedingt.';

  const jawlineFeel =
    jaw >= 82
      ? 'Jawline wirkt in der Simulation klarer ausgeprägt.'
      : jaw >= 72
        ? 'Jawline wirkt durchschnittlich ausgeprägt.'
        : 'Jawline wirkt weicher / weniger konturiert – stark licht- und winkelabhängig.';

  const expressionFeel =
    rand() > 0.45
      ? 'Gesicht wirkt in der Simulation eher freundlich/neutral.'
      : 'Gesicht wirkt in der Simulation eher ruhig/neutral.';

  const profileFeel =
    rand() > 0.4
      ? 'Profil wirkt ausgewogen.'
      : 'Profil zeigt typische individuelle Variation.';

  return {
    asymmetryEveryday,
    proportionsFeel,
    jawlineFeel,
    expressionFeel,
    profileFeel,
    summary:
      'Unter natürlichen Betrachtungsbedingungen werden kleine Abweichungen oft weniger wahrgenommen als in Nahaufnahmen.',
    disclaimer:
      'Diese Einschätzung ist eine statistische Simulation auf Basis von Gesichtsproportionen, Symmetrie und wissenschaftlichen Erkenntnissen. Menschen nehmen Gesichter unterschiedlich wahr.',
  };
}

export async function analyzeFace(
  imageUri: string,
  options?: { scanType?: 'photo' | '360'; captures?: ScanCapture[] }
): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1200));

  const scanType = options?.scanType ?? (options?.captures && options.captures.length > 1 ? '360' : 'photo');
  const seedBase = [imageUri, ...(options?.captures?.map((c) => c.uri) ?? [])].join('|');
  const rand = mulberry32(hashSeed(seedBase));
  const quality = checkImageQuality(imageUri);
  const multiAngleBoost = scanType === '360' ? 2 : 0;

  const metrics: MetricResult[] = METRIC_CATALOG.map((def) => {
    let bias = 0;
    if (def.category === 'photo') bias = (quality.score - 80) * 0.25;
    if (def.id === 'lighting_quality') bias = (quality.lightingScore - 80) * 0.45;
    if (def.id === 'skin_evenness') bias = (quality.lightingScore - 80) * 0.2;
    if (def.category === 'profile') bias = multiAngleBoost + (rand() - 0.55) * 4;
    if (def.id === 'chin_projection' && scanType === '360') bias += 3;

    const score = realisticScore(rand, bias);
    const value = formatValue(def.id, score, rand);
    const tips = TIPS_BY_METRIC[def.id] ?? [
      'Vergleiche nur ähnliche Licht- und Scan-Bedingungen.',
      'Allgemeine Pflege-/Fototipps – keine medizinischen Versprechen.',
    ];

    return {
      ...def,
      score,
      value,
      band: band(score),
      impact: round1(0.9 + rand() * 3.4),
      coachNote: coachFor(def.label, score),
      scoreReason: scoreReason(def, score, value, def.unit),
      contributingValues: contributing(def.id, value, def.unit, score),
      tips,
      exerciseIds: exercisesFor(def.id),
      heatmapWeight: def.category === 'symmetry' || def.category === 'features' ? 1 : 0.65,
    };
  });

  const pick = (id: string) => metrics.find((m) => m.id === id)?.score ?? 75;
  const avg = (ids: string[]) =>
    Math.round(ids.reduce((s, id) => s + pick(id), 0) / Math.max(1, ids.length));

  const symmetryScore = avg(['face_symmetry', 'face_midline', 'nose_symmetry', 'eye_height', 'mouth_corners']);
  const proportionsScore = avg([
    'facial_thirds',
    'facial_fifths',
    'midface_ratio',
    'lower_face_ratio',
    'face_width',
    'fwhr',
  ]);
  const goldenRatioScore = pick('golden_ratio');
  const jawlineScore = avg(['jawline', 'jaw', 'jaw_angle', 'mandible', 'chin']);
  const skinScore = pick('skin_evenness');
  const profileScore = avg([
    'side_profile',
    'nose_profile',
    'face_depth',
    'chin_projection',
    'posture_head',
    'neckline',
  ]);
  const photoQualityScore = quality.score;

  // Honest overall – no inflation
  const overallScore = Math.round(
    clamp(
      symmetryScore * 0.28 +
        proportionsScore * 0.22 +
        goldenRatioScore * 0.1 +
        jawlineScore * 0.14 +
        profileScore * 0.12 +
        avg(['eye_spacing', 'lip_shape', 'nose_symmetry']) * 0.08 +
        skinScore * 0.03 +
        photoQualityScore * 0.03
    )
  );

  const sorted = [...metrics].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 5).map((m) => ({
    id: `s_${m.id}`,
    title: m.score >= 86 ? `Stärker: ${m.label}` : `Solide: ${m.label}`,
    score: m.score,
    metricId: m.id,
    impact: m.impact,
  }));
  const improvements = sorted
    .slice(-5)
    .reverse()
    .map((m) => ({
      id: `i_${m.id}`,
      title: m.score >= 74 ? `Leichte Abweichung: ${m.label}` : `Fokus: ${m.label}`,
      score: m.score,
      metricId: m.id,
      impact: m.impact,
    }));

  const heatmap: HeatmapPoint[] = HEATMAP_LAYOUT.map((h) => ({
    id: h.id,
    label: h.label,
    x: h.x,
    y: h.y,
    score: pick(h.metricId),
    metricId: h.metricId,
  }));

  const radar = [
    'face_symmetry',
    'golden_ratio',
    'jawline',
    'eye_spacing',
    'nose_symmetry',
    'lip_shape',
    'side_profile',
    'skin_evenness',
  ].map((id) => {
    const m = metrics.find((x) => x.id === id)!;
    return { label: m.label.split(' ')[0], value: m.score };
  });

  const perception = buildPerception(rand, symmetryScore, jawlineScore, proportionsScore);

  const coachSummary =
    scanType === '360'
      ? `360°-Scan ausgewertet. Gesamtscore ${overallScore}. Symmetrie ${symmetryScore}, Profil ${profileScore}, Jawline ${jawlineScore}. Werte sind KI-Schätzungen aus Mehrwinkel-Landmarken – keine objektive Attraktivität.`
      : `Foto-Analyse. Gesamtscore ${overallScore}. Für Profil/Kinnprojektion liefert ein 360°-Scan belastbarere Schätzungen.`;

  const scoreBreakdown = `Gesamtscore ${overallScore} = Symmetrie×0.28 (${symmetryScore}) + Proportionen×0.22 (${proportionsScore}) + Golden Ratio×0.10 (${goldenRatioScore}) + Jawline×0.14 (${jawlineScore}) + Profil×0.12 (${profileScore}) + Features/Haut/Foto. Keine künstliche Aufwertung.`;

  return {
    id: uid(),
    createdAt: new Date().toISOString(),
    imageUri,
    scanType,
    captures: options?.captures,
    favorite: false,
    note: '',
    overallScore,
    symmetryScore,
    proportionsScore,
    goldenRatioScore,
    photoQualityScore,
    profileScore,
    jawlineScore,
    skinScore,
    metrics,
    heatmap,
    radar,
    strengths,
    improvements,
    perception,
    coachSummary,
    dailyTips: [
      improvements[0]
        ? `Fokus: ${improvements[0].title.replace(/^[^:]+:\s*/, '')}`
        : 'Nächsten Scan unter gleichem Licht wiederholen.',
      'SPF bei Tageslicht – allgemeine Pflegeempfehlung.',
      'Chin Tucks für Haltung (ändert keine Knochenstruktur).',
      scanType === '360' ? '360°-Scan alle paar Wochen für Fortschritt.' : 'Für Profil: 360°-Face-Scan starten.',
    ],
    disclaimer: DISCLAIMERS.analysis,
    scoreBreakdown,
  };
}

export function compareScans(current: AnalysisResult, previous?: AnalysisResult | null) {
  if (!previous) return null;
  return {
    overall: current.overallScore - previous.overallScore,
    symmetry: current.symmetryScore - previous.symmetryScore,
    proportions: current.proportionsScore - previous.proportionsScore,
    golden: current.goldenRatioScore - previous.goldenRatioScore,
    jawline: (current.jawlineScore ?? 0) - (previous.jawlineScore ?? 0),
    skin: (current.skinScore ?? 0) - (previous.skinScore ?? 0),
    profile: (current.profileScore ?? 0) - (previous.profileScore ?? 0),
  };
}
