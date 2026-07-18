export const Colors = {
  dark: {
    background: '#07080A',
    backgroundElevated: '#0E1014',
    surface: 'rgba(28, 30, 36, 0.78)',
    surfaceSolid: '#15171C',
    surfaceHover: '#1C1F26',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
    text: '#F4F5F7',
    textSecondary: '#9AA0AA',
    textTertiary: '#6B7280',
    accent: '#5EEAD4',
    accentDim: 'rgba(94,234,212,0.14)',
    accentText: '#042F2E',
    success: '#34D399',
    successDim: 'rgba(52,211,153,0.14)',
    warning: '#FBBF24',
    warningDim: 'rgba(251,191,36,0.14)',
    danger: '#F87171',
    dangerDim: 'rgba(248,113,113,0.14)',
    heatGreen: '#34D399',
    heatYellow: '#FBBF24',
    heatRed: '#F87171',
    tabBar: 'rgba(10,11,14,0.92)',
    gradientStart: '#0B1220',
    gradientMid: '#07080A',
    gradientEnd: '#0A0F0E',
    ringTrack: 'rgba(255,255,255,0.08)',
  },
  light: {
    background: '#F3F4F6',
    backgroundElevated: '#FFFFFF',
    surface: 'rgba(255,255,255,0.82)',
    surfaceSolid: '#FFFFFF',
    surfaceHover: '#F9FAFB',
    border: 'rgba(15,23,42,0.08)',
    borderStrong: 'rgba(15,23,42,0.14)',
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    accent: '#0D9488',
    accentDim: 'rgba(13,148,136,0.12)',
    accentText: '#FFFFFF',
    success: '#059669',
    successDim: 'rgba(5,150,105,0.12)',
    warning: '#D97706',
    warningDim: 'rgba(217,119,6,0.12)',
    danger: '#DC2626',
    dangerDim: 'rgba(220,38,38,0.12)',
    heatGreen: '#059669',
    heatYellow: '#D97706',
    heatRed: '#DC2626',
    tabBar: 'rgba(255,255,255,0.92)',
    gradientStart: '#E8EEF2',
    gradientMid: '#F3F4F6',
    gradientEnd: '#EEF6F4',
    ringTrack: 'rgba(15,23,42,0.08)',
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
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  full: 999,
};

export const Typography = {
  hero: { fontSize: 42, fontWeight: '700' as const, letterSpacing: -1.4, lineHeight: 46 },
  title1: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.8, lineHeight: 36 },
  title2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4, lineHeight: 28 },
  title3: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 22 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  callout: { fontSize: 15, fontWeight: '500' as const, lineHeight: 21 },
  footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.4 },
  overline: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.6 },
};

export const Layout = {
  screenPadding: 20,
  cardGap: 14,
  buttonHeight: 56,
  maxContentWidth: 430,
};

export const DISCLAIMERS = {
  analysis:
    'Diese Analyse basiert auf Gesichtsproportionen, Landmarken und Symmetrie und ist eine KI-Schätzung.',
  beauty:
    'Schönheit und Attraktivität sind subjektiv und werden von vielen Faktoren beeinflusst. Die App misst keine objektive Schönheit.',
  medical:
    'Die App ersetzt keine medizinische oder dermatologische Beratung. Empfehlungen sind allgemeine Styling-, Pflege- oder Gesundheitsratschläge ohne medizinische Versprechen.',
  exercises:
    'Gesichtsübungen verändern keine Knochenstruktur oder genetischen Merkmale. Gut belegt sind u. a. Haltung, Hautpflege und Gewichtsmanagement; andere Methoden haben begrenzte Evidenz.',
  general:
    'Ergebnisse sind Schätzungen auf Basis messbarer Gesichtsmerkmale und keine Aussage darüber, wie einzelne Menschen dich wahrnehmen.',
};
