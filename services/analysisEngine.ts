import type {
  AnalysisResult,
  AttractivenessFactor,
  CelebrityMatch,
  HeatmapPoint,
  MetricValue,
  PerceptionSim,
  ProportionMetric,
  QualityCheckResult,
  ScoreLevel,
  StrengthWeakness,
} from '@/types/analysis';
import { DISCLAIMERS } from '@/constants/theme';

/** Deterministic PRNG from string seed */
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

function scoreLevel(score: number): ScoreLevel {
  if (score >= 92) return 'excellent';
  if (score >= 84) return 'good';
  if (score >= 72) return 'average';
  if (score >= 60) return 'mild';
  return 'notable';
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function uid() {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Quality heuristics for demo purposes.
 * Production would use on-device face landmark / CV models (MediaPipe etc.).
 */
export function checkImageQuality(imageUri: string): QualityCheckResult {
  // Demo: URI-basierte Heuristik. Produktion: MediaPipe / Face Landmarker.
  // Sehr kurze / ungültige URIs werden abgelehnt, um die Fehlermeldung zu demonstrieren.
  if (!imageUri || imageUri.length < 8) {
    return {
      passed: false,
      checks: {
        faceVisible: false,
        headStraight: false,
        goodLighting: false,
        noSunglasses: false,
        neutralExpression: false,
      },
      message: 'Bitte lade ein besseres Bild hoch.',
    };
  }

  return {
    passed: true,
    checks: {
      faceVisible: true,
      headStraight: true,
      goodLighting: true,
      noSunglasses: true,
      neutralExpression: true,
    },
  };
}

function buildSymmetryMetrics(rand: () => number): MetricValue[] {
  const defs: Omit<MetricValue, 'score' | 'value' | 'level' | 'impact'>[] = [
    { id: 'eye_height', label: 'Augenhöhe', unit: 'mm Δ', explanation: 'Höhenunterschied zwischen linkem und rechtem Auge relativ zur Gesichtsmitte.', normRange: '< 2 mm Abweichung', whyImportant: 'Augenhöhe beeinflusst den ersten Eindruck von Balance im oberen Gesichtsdrittel.' },
    { id: 'eye_spacing', label: 'Augenabstand', unit: 'ratio', explanation: 'Abstand der Pupillen zueinander im Verhältnis zur Gesichtsbreite.', normRange: '0.44 – 0.48', whyImportant: 'Interpupillardistanz ist ein zentrales Proportionselement.' },
    { id: 'eye_angle', label: 'Augenwinkel', unit: '°', explanation: 'Vergleich der inneren und äußeren Augenwinkel links/rechts.', normRange: '±1.5°', whyImportant: 'Canthal-Winkel prägen den Ausdruck und die Symmetrie.' },
    { id: 'eye_shape', label: 'Augenform', unit: '%', explanation: 'Ähnlichkeit der Kontur und Proportion beider Augen.', normRange: '> 88 %', whyImportant: 'Formähnlichkeit trägt stark zur wahrgenommenen Symmetrie bei.' },
    { id: 'eye_opening', label: 'Augenöffnung', unit: 'mm Δ', explanation: 'Vertikale Öffnungsdifferenz der Lidspalten.', normRange: '< 1.2 mm', whyImportant: 'Unterschiedliche Öffnung kann Asymmetrie betonen.' },
    { id: 'eyelid_sym', label: 'Augenlid-Symmetrie', unit: '%', explanation: 'Symmetrie von Ober- und Unterlidkontur.', normRange: '> 85 %', whyImportant: 'Lidkonturen beeinflussen den Blick und die Gesichtsbalance.' },
    { id: 'brow_height', label: 'Augenbrauenhöhe', unit: 'mm Δ', explanation: 'Höhendifferenz der Brauenbögen.', normRange: '< 2.5 mm', whyImportant: 'Brauen rahmen die Augen und steuern Gesichtsausdruck.' },
    { id: 'brow_angle', label: 'Augenbrauenwinkel', unit: '°', explanation: 'Winkelabweichung der Brauenachsen.', normRange: '±2°', whyImportant: 'Winkeldifferenzen wirken schnell asymmetrisch.' },
    { id: 'brow_thickness', label: 'Augenbrauen-Dicke', unit: '%', explanation: 'Dichte- und Dickenvergleich beider Brauen.', normRange: '> 80 %', whyImportant: 'Dicke beeinflusst Framing und Harmoniewirkung.' },
    { id: 'nose_pos', label: 'Nasenposition', unit: 'mm', explanation: 'Abweichung der Nasenwurzel von der Gesichtsmitte.', normRange: '< 1.5 mm', whyImportant: 'Die Nase ist eine zentrale Achsenreferenz.' },
    { id: 'nose_length', label: 'Nasenlänge', unit: 'ratio', explanation: 'Länge von Nasenwurzel bis Spitze relativ zur Gesichtshöhe.', normRange: '0.20 – 0.24', whyImportant: 'Nasenlänge beeinflusst Midface-Proportionen.' },
    { id: 'nose_width', label: 'Nasenbreite', unit: 'ratio', explanation: 'Breite der Nasenflügel relativ zur Gesichtsbreite.', normRange: '0.20 – 0.26', whyImportant: 'Breite wirkt auf untere Gesichtsbalance.' },
    { id: 'nose_tip', label: 'Nasenspitze', unit: '%', explanation: 'Symmetrie und Projektion der Nasenspitze.', normRange: '> 85 %', whyImportant: 'Die Spitze ist ein visueller Fokuspunkt.' },
    { id: 'nose_axis', label: 'Nasenachse', unit: '°', explanation: 'Abweichung der Nasenachse von der Mittellinie.', normRange: '±1.5°', whyImportant: 'Achsabweichungen beeinflussen Gesamtsymmetrie stark.' },
    { id: 'lip_height', label: 'Lippenhöhe', unit: 'ratio', explanation: 'Höhe von Ober- und Unterlippe im Verhältnis.', normRange: '1:1.2 – 1:1.6', whyImportant: 'Lippenproportionen prägen die untere Gesichtsharmonie.' },
    { id: 'lip_width', label: 'Lippenbreite', unit: 'ratio', explanation: 'Mundbreite relativ zur Augenaußenkante.', normRange: '0.90 – 1.10', whyImportant: 'Breite sollte zu Augen und Kiefer passen.' },
    { id: 'lip_sym', label: 'Lippen-Symmetrie', unit: '%', explanation: 'Links-rechts-Symmetrie der Lippenkontur.', normRange: '> 88 %', whyImportant: 'Lippenasymmetrie fällt im Gespräch oft auf.' },
    { id: 'mouth_corner', label: 'Mundwinkel', unit: 'mm Δ', explanation: 'Höhendifferenz der Mundwinkel.', normRange: '< 1.5 mm', whyImportant: 'Mundwinkel beeinflussen den Ruheausdruck.' },
    { id: 'jaw_width', label: 'Kieferbreite', unit: 'ratio', explanation: 'Kieferbreite relativ zur Jochbeinbreite.', normRange: '0.85 – 1.05', whyImportant: 'Kieferform definiert die untere Gesichtsstruktur.' },
    { id: 'jaw_angle', label: 'Kieferwinkel', unit: '°', explanation: 'Symmetrie der Kieferwinkel links/rechts.', normRange: '±3°', whyImportant: 'Winkel beeinflussen Definition und Kontur.' },
    { id: 'chin_pos', label: 'Kinnposition', unit: 'mm', explanation: 'Abweichung der Kinnspitze von der Mittellinie.', normRange: '< 2 mm', whyImportant: 'Kinnlage schließt die Gesichtsachse ab.' },
    { id: 'chin_sym', label: 'Kinnsymmetrie', unit: '%', explanation: 'Formsymmetrie der Kinnkontur.', normRange: '> 85 %', whyImportant: 'Kinnasymmetrie wirkt auf die untere Balance.' },
    { id: 'face_mid', label: 'Gesichtsmitte', unit: '%', explanation: 'Ausrichtung von Stirn, Nase und Kinn auf einer Achse.', normRange: '> 90 %', whyImportant: 'Die Mittelachse ist Grundlage aller Symmetriebewertungen.' },
    { id: 'cheek_height', label: 'Wangenhöhe', unit: 'mm Δ', explanation: 'Höhendifferenz der Jochbeinhöchpunkte.', normRange: '< 2 mm', whyImportant: 'Wangenhöhe formt Midface-Volumen.' },
    { id: 'cheekbone', label: 'Wangenknochen', unit: '%', explanation: 'Prominenz und Symmetrie der Jochbögen.', normRange: '> 84 %', whyImportant: 'Jochbeinstruktur prägt Gesichtsform und Lichtführung.' },
    { id: 'forehead_w', label: 'Stirnbreite', unit: 'ratio', explanation: 'Stirnbreite relativ zur Jochbeinbreite.', normRange: '0.90 – 1.10', whyImportant: 'Obere Breite steuert die Gesichtsform (oval, herzförmig etc.).' },
    { id: 'forehead_h', label: 'Stirnhöhe', unit: 'ratio', explanation: 'Stirnhöhe als Anteil am oberen Gesichtsdrittel.', normRange: '0.30 – 0.36', whyImportant: 'Facial Thirds beginnen mit der Stirnproportion.' },
  ];

  return defs.map((d) => {
    const score = clamp(72 + rand() * 26);
    const impact = round1(0.5 + rand() * 3.5);
    let value: string;
    if (d.unit === '%') value = `${Math.round(score)}`;
    else if (d.unit === '°') value = `${round1((100 - score) * 0.08)}`;
    else if (d.unit === 'mm' || d.unit === 'mm Δ') value = `${round1((100 - score) * 0.06)}`;
    else value = `${round1(0.2 + (score / 100) * 0.3)}`;

    return {
      ...d,
      score: Math.round(score),
      value,
      level: scoreLevel(score),
      impact,
    };
  });
}

function buildProportions(rand: () => number): ProportionMetric[] {
  const items: { id: string; label: string; ideal: number; unit: string; explanation: string }[] = [
    { id: 'golden', label: 'Golden Ratio', ideal: 1.618, unit: 'φ', explanation: 'Annäherung an den Goldenen Schnitt in Gesichtsverhältnissen.' },
    { id: 'thirds', label: 'Facial Thirds', ideal: 1.0, unit: 'balance', explanation: 'Gleichmäßigkeit von Stirn-, Midface- und Lower-Face-Dritteln.' },
    { id: 'fifths', label: 'Facial Fifths', ideal: 1.0, unit: 'balance', explanation: 'Horizontale Fünftelung der Gesichtsbreite.' },
    { id: 'canthal', label: 'Canthal Tilt', ideal: 5, unit: '°', explanation: 'Neigung der Lidspalte vom inneren zum äußeren Augenwinkel.' },
    { id: 'jaw_def', label: 'Jaw Definition', ideal: 90, unit: 'score', explanation: 'Konturschärfe und Definition der Kieferlinie.' },
    { id: 'midface', label: 'Midface Ratio', ideal: 0.85, unit: 'ratio', explanation: 'Verhältnis von Midface-Höhe zur Gesamthöhe.' },
    { id: 'lower', label: 'Lower Face Ratio', ideal: 0.36, unit: 'ratio', explanation: 'Anteil des unteren Gesichtsdrittels.' },
    { id: 'upper', label: 'Upper Face Ratio', ideal: 0.33, unit: 'ratio', explanation: 'Anteil des oberen Gesichtsdrittels.' },
    { id: 'nose_face', label: 'Nose-to-Face Ratio', ideal: 0.22, unit: 'ratio', explanation: 'Nasenlänge relativ zur Gesichtshöhe.' },
    { id: 'lip_ratio', label: 'Lip Ratio', ideal: 1.4, unit: 'ratio', explanation: 'Verhältnis Unter- zu Oberlippe.' },
    { id: 'eye_face', label: 'Eye-to-Face Ratio', ideal: 0.28, unit: 'ratio', explanation: 'Augenbreite relativ zur Gesichtsbreite.' },
    { id: 'chin_proj', label: 'Chin Projection', ideal: 85, unit: 'score', explanation: 'Relative Projektion des Kinns im Profilbezug (frontale Schätzung).' },
    { id: 'fwhr', label: 'Facial Width Height Ratio', ideal: 1.9, unit: 'fWHR', explanation: 'Verhältnis von Jochbeinbreite zur oberen Gesichtshöhe.' },
    { id: 'ipd', label: 'Interpupillary Distance', ideal: 0.46, unit: 'ratio', explanation: 'Pupillenabstand relativ zur Gesichtsbreite.' },
    { id: 'harmony', label: 'Facial Harmony', ideal: 90, unit: 'score', explanation: 'Gesamtharmonie aus Proportionen und Balance.' },
  ];

  return items.map((item) => {
    const score = clamp(70 + rand() * 28);
    const drift = (50 - score) / 200;
    const value =
      item.unit === 'score' || item.unit === '°'
        ? round1(item.ideal + drift * 10)
        : round1(item.ideal * (1 + drift));
    return { ...item, score: Math.round(score), value };
  });
}

function buildFactors(rand: () => number, symmetryAvg: number, propAvg: number): AttractivenessFactor[] {
  const base = (symmetryAvg + propAvg) / 2;
  const mk = (id: string, label: string, bias: number, explanation: string): AttractivenessFactor => ({
    id,
    label,
    score: Math.round(clamp(base + bias + (rand() - 0.5) * 12)),
    explanation,
  });

  return [
    mk('eyes', 'Augen', 4, 'Schätzung basierend auf Symmetrie, Öffnung, Abstand und Canthal Tilt.'),
    mk('nose', 'Nase', -1, 'Schätzung aus Achse, Breite, Länge und Position relativ zur Mitte.'),
    mk('lips', 'Lippen', 2, 'Schätzung aus Lippenratio, Breite und Symmetrie der Kontur.'),
    mk('jaw', 'Kiefer', 1, 'Schätzung aus Kieferbreite, Winkel und Definition.'),
    mk('chin', 'Kinn', -2, 'Schätzung aus Position, Symmetrie und Projektion.'),
    mk('brows', 'Augenbrauen', 0, 'Schätzung aus Höhe, Winkel und Dickensymmetrie.'),
    mk('shape', 'Gesichtsform', 3, 'Schätzung aus Stirn-, Jochbein- und Kieferverhältnissen.'),
    mk('proportions', 'Proportionen', propAvg - base, 'Aggregierte Nähe zu klassischen Proportionsreferenzen.'),
    mk('symmetry', 'Symmetrie', symmetryAvg - base, 'Aggregierte Links-Rechts-Balance der Landmark-Paare.'),
  ];
}

function buildStrengthsWeaknesses(metrics: MetricValue[], factors: AttractivenessFactor[]): {
  strengths: StrengthWeakness[];
  improvements: StrengthWeakness[];
} {
  const sorted = [...metrics].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, 5);
  const bottom = sorted.slice(-4).reverse();

  const strengths: StrengthWeakness[] = top.map((m, i) => ({
    id: `s_${m.id}`,
    title: m.score >= 90 ? `Sehr gute ${m.label}` : `Gute ${m.label}`,
    type: 'strength',
    score: m.score,
    explanation: m.explanation,
    impact: m.impact,
    category: factors[i % factors.length]?.label ?? 'Allgemein',
  }));

  // Enrich with factor-based strengths
  const strongFactors = [...factors].sort((a, b) => b.score - a.score).slice(0, 2);
  strongFactors.forEach((f) => {
    if (!strengths.find((s) => s.category === f.label)) {
      strengths.push({
        id: `sf_${f.id}`,
        title: f.score >= 88 ? `Starke ${f.label}` : `Harmonische ${f.label}`,
        type: 'strength',
        score: f.score,
        explanation: f.explanation,
        impact: round1(f.score / 30),
        category: f.label,
      });
    }
  });

  const improvements: StrengthWeakness[] = bottom.map((m) => ({
    id: `i_${m.id}`,
    title:
      m.score >= 78
        ? `Leichte Abweichung: ${m.label}`
        : `Verbesserungspotenzial: ${m.label}`,
    type: 'improvement',
    score: m.score,
    explanation: m.explanation,
    impact: m.impact,
    category: m.label,
  }));

  return { strengths: strengths.slice(0, 6), improvements: improvements.slice(0, 5) };
}

function buildCelebrityMatches(rand: () => number): CelebrityMatch[] {
  const pool = [
    'Alex Rivera',
    'Jordan Hale',
    'Sam Ortega',
    'Casey Quinn',
    'Morgan Blake',
    'Riley Chen',
    'Taylor Brooks',
    'Jamie Sato',
  ];
  const shuffled = [...pool].sort(() => rand() - 0.5).slice(0, 3);
  return shuffled.map((name, i) => ({
    id: `c_${i}`,
    name,
    similarity: Math.round(clamp(88 - i * 5 + rand() * 4)),
    note: 'Vergleich der Gesichtsstruktur (Landmark-Muster), keine Identitätsaussage.',
  }));
}

function buildPerception(symmetry: number, rand: () => number): PerceptionSim {
  const everydaySymmetry =
    symmetry >= 90 ? 'höher' : symmetry >= 80 ? 'durchschnittlich' : 'niedriger';
  const asymmetryNoticeability =
    symmetry >= 90 ? 'gering' : symmetry >= 80 ? 'mittel' : 'hoch';
  const everydayDetectionChance =
    symmetry >= 88 ? 'niedrig' : symmetry >= 78 ? 'mittel' : 'hoch';
  const naturalness = rand() > 0.35 ? 'hoch' : rand() > 0.5 ? 'mittel' : 'niedrig';

  return {
    everydaySymmetry,
    naturalness,
    asymmetryNoticeability,
    everydayDetectionChance,
    summary:
      'Unter natürlichen Betrachtungsbedingungen werden kleine Asymmetrien oft weniger wahrgenommen als in Nahaufnahmen unter Studio-Licht.',
  };
}

function buildHeatmap(rand: () => number): HeatmapPoint[] {
  const points: { x: number; y: number; label: string }[] = [
    { x: 0.35, y: 0.28, label: 'Linkes Auge' },
    { x: 0.65, y: 0.28, label: 'Rechtes Auge' },
    { x: 0.35, y: 0.2, label: 'Linke Braue' },
    { x: 0.65, y: 0.2, label: 'Rechte Braue' },
    { x: 0.5, y: 0.42, label: 'Nase' },
    { x: 0.5, y: 0.58, label: 'Lippen' },
    { x: 0.32, y: 0.48, label: 'Linke Wange' },
    { x: 0.68, y: 0.48, label: 'Rechte Wange' },
    { x: 0.38, y: 0.72, label: 'Linker Kiefer' },
    { x: 0.62, y: 0.72, label: 'Rechter Kiefer' },
    { x: 0.5, y: 0.82, label: 'Kinn' },
    { x: 0.5, y: 0.12, label: 'Stirn' },
  ];
  return points.map((p) => ({
    ...p,
    symmetry: Math.round(clamp(75 + rand() * 24)),
  }));
}

export async function analyzeFace(imageUri: string): Promise<AnalysisResult> {
  // Simulate on-device processing latency
  await new Promise((r) => setTimeout(r, 1800 + Math.random() * 1200));

  const rand = mulberry32(hashSeed(imageUri));
  const symmetryMetrics = buildSymmetryMetrics(rand);
  const proportionMetrics = buildProportions(rand);

  const symmetryScore = Math.round(
    symmetryMetrics.reduce((s, m) => s + m.score, 0) / symmetryMetrics.length
  );
  const proportionsScore = Math.round(
    proportionMetrics.reduce((s, m) => s + m.score, 0) / proportionMetrics.length
  );
  const golden = proportionMetrics.find((p) => p.id === 'golden')?.score ?? 85;
  const overallScore = Math.round(symmetryScore * 0.45 + proportionsScore * 0.4 + golden * 0.15);

  const factors = buildFactors(rand, symmetryScore, proportionsScore);
  const { strengths, improvements } = buildStrengthsWeaknesses(symmetryMetrics, factors);
  const celebrityMatches = buildCelebrityMatches(rand);
  const perception = buildPerception(symmetryScore, rand);
  const heatmap = buildHeatmap(rand);

  const radar = factors.slice(0, 8).map((f) => ({ label: f.label, value: f.score }));

  return {
    id: uid(),
    createdAt: new Date().toISOString(),
    imageUri,
    overallScore,
    symmetryScore,
    goldenRatioScore: golden,
    proportionsScore,
    symmetryMetrics,
    proportionMetrics,
    strengths,
    improvements,
    factors,
    celebrityMatches,
    perception,
    heatmap,
    radar,
    disclaimer: DISCLAIMERS.attractiveness,
  };
}
