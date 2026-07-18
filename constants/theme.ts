export const Colors = {
  light: {
    background: '#F2F2F7',
    backgroundSecondary: '#FFFFFF',
    surface: 'rgba(255,255,255,0.72)',
    surfaceSolid: '#FFFFFF',
    border: 'rgba(60,60,67,0.12)',
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    textTertiary: '#AEAEB2',
    accent: '#0071E3',
    accentSoft: 'rgba(0,113,227,0.12)',
    success: '#30D158',
    successSoft: 'rgba(48,209,88,0.15)',
    warning: '#FF9F0A',
    warningSoft: 'rgba(255,159,10,0.15)',
    danger: '#FF453A',
    dangerSoft: 'rgba(255,69,58,0.15)',
    chart: '#0071E3',
    heatmapGreen: '#30D158',
    heatmapRed: '#FF453A',
    tabBar: 'rgba(255,255,255,0.85)',
    overlay: 'rgba(0,0,0,0.4)',
    gradientStart: '#E8EEF5',
    gradientEnd: '#F7F8FA',
  },
  dark: {
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    surface: 'rgba(44,44,46,0.72)',
    surfaceSolid: '#1C1C1E',
    border: 'rgba(255,255,255,0.12)',
    text: '#F5F5F7',
    textSecondary: '#98989D',
    textTertiary: '#636366',
    accent: '#0A84FF',
    accentSoft: 'rgba(10,132,255,0.18)',
    success: '#30D158',
    successSoft: 'rgba(48,209,88,0.18)',
    warning: '#FF9F0A',
    warningSoft: 'rgba(255,159,10,0.18)',
    danger: '#FF453A',
    dangerSoft: 'rgba(255,69,58,0.18)',
    chart: '#0A84FF',
    heatmapGreen: '#30D158',
    heatmapRed: '#FF453A',
    tabBar: 'rgba(28,28,30,0.88)',
    overlay: 'rgba(0,0,0,0.55)',
    gradientStart: '#0B0B0F',
    gradientEnd: '#16161A',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
};

export const Typography = {
  hero: { fontSize: 40, fontWeight: '700' as const, letterSpacing: -1.2 },
  title1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.6 },
  title2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.4 },
  title3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  callout: { fontSize: 15, fontWeight: '500' as const },
  footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.2 },
};

export const DISCLAIMERS = {
  attractiveness:
    'Dieser Score ist eine AI-Schätzung auf Basis von Gesichtsproportionen und Symmetrie und stellt keine objektive Bewertung deiner Attraktivität dar.',
  perception:
    'Diese Einschätzung ist eine statistische Simulation und keine Aussage darüber, wie einzelne Menschen dich tatsächlich wahrnehmen.',
  celebrity:
    'Es handelt sich ausschließlich um einen Vergleich der Gesichtsstruktur, nicht um eine Identitätsaussage.',
  general:
    'Alle Bewertungen sind Schätzungen auf Basis von Gesichtsmerkmalen und keine objektiven Aussagen über Schönheit oder den Eindruck auf andere Menschen.',
  medical:
    'Empfehlungen dienen nur Styling-, Pflege- und Fototipps. Sie stellen keine medizinischen Diagnosen dar.',
};
