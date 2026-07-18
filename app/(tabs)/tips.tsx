import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/GlassCard';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Spacing, Typography } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Bessere Fotos',
    icon: 'camera-outline' as const,
    tips: [
      'Nutze weiches Tageslicht von vorne oder leicht seitlich.',
      'Halte die Kamera auf Augenhöhe, Abstand ca. 60–90 cm.',
      'Vermeide starke Unterbeleuchtung und harte Schatten.',
      'Blick gerade in die Linse, Kopf nicht geneigt.',
    ],
  },
  {
    title: 'Gesichtspflege & Haut',
    icon: 'water-outline' as const,
    tips: [
      'Sanfte Reinigung und Feuchtigkeitspflege unterstützen ein ebenmäßiges Hautbild auf Fotos.',
      'Sonnenschutz hilft, die Haut langfristig gleichmäßiger wirken zu lassen.',
      'Kein Ersatz für dermatologische Beratung bei Hautproblemen.',
    ],
  },
  {
    title: 'Schlaf & Alltag',
    icon: 'moon-outline' as const,
    tips: [
      'Ausreichend Schlaf kann Schwellungen und Müdigkeitszeichen reduzieren.',
      'Ausreichend trinken unterstützt ein frischeres Erscheinungsbild.',
    ],
  },
  {
    title: 'Frisuren & Bart',
    icon: 'cut-outline' as const,
    tips: [
      'Frisuren, die die Stirn- und Kieferlinie rahmen, können Proportionen betonen.',
      'Bartformen können die Kieferkontur optisch ausgleichen – experimentiere vorsichtig.',
    ],
  },
  {
    title: 'Brillen & Posing',
    icon: 'glasses-outline' as const,
    tips: [
      'Brillengestelle sollten zur Gesichtsbreite passen und Augen nicht verdecken.',
      'Leichtes Lächeln oder neutrale Pose – je nach gewünschtem Eindruck.',
      'Schultern entspannen, Kinn leicht nach vorne für klarere Konturen auf Fotos.',
    ],
  },
];

export default function TipsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: 120,
          paddingHorizontal: Spacing.md,
        }}
      >
        <Text style={[Typography.caption, { color: colors.accent, letterSpacing: 1.2 }]}>
          AI-EMPFEHLUNGEN
        </Text>
        <Text style={[Typography.title1, { color: colors.text }]}>Tipps</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing.md }]}>
          Styling-, Pflege- und Fototipps – keine medizinischen Diagnosen.
        </Text>

        <DisclaimerBanner text={DISCLAIMERS.medical} tone="warning" />

        {SECTIONS.map((section) => (
          <GlassCard key={section.title} style={{ marginTop: Spacing.md }}>
            <View style={styles.head}>
              <Ionicons name={section.icon} size={20} color={colors.accent} />
              <Text style={[Typography.title3, { color: colors.text }]}>{section.title}</Text>
            </View>
            {section.tips.map((tip) => (
              <Text
                key={tip}
                style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.sm, lineHeight: 20 }]}
              >
                • {tip}
              </Text>
            ))}
          </GlassCard>
        ))}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
