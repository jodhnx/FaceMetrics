import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { ScoreRing } from '@/components/ScoreRing';
import { MiniDonut } from '@/components/Charts';
import { MetricRow } from '@/components/MetricRow';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Spacing, Typography } from '@/constants/theme';

export default function ProportionsScreen() {
  const { colors } = useTheme();
  const { current } = useAnalysis();
  const router = useRouter();

  if (!current) {
    return (
      <AppBackground>
        <ScreenHeader title="Proportionen" showBack />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Kein Scan geladen.
        </Text>
      </AppBackground>
    );
  }

  const highlight = current.proportionMetrics.slice(0, 4);

  return (
    <AppBackground>
      <ScreenHeader title="Gesichtsproportionen" showBack />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 60 }}>
        <View style={{ alignItems: 'center' }}>
          <ScoreRing score={current.proportionsScore} label="Proportionen" size={150} />
        </View>

        <DisclaimerBanner text={DISCLAIMERS.general} />

        <View style={styles.donuts}>
          {highlight.map((h) => (
            <MiniDonut key={h.id} value={h.score} label={h.label} />
          ))}
        </View>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Alle Proportionen</Text>
          {current.proportionMetrics.map((p) => (
            <MetricRow
              key={p.id}
              label={p.label}
              score={p.score}
              subtitle={`Wert ${p.value} ${p.unit} · Ideal ≈ ${p.ideal}`}
              onPress={() => router.push(`/feature/${p.id}`)}
            />
          ))}
        </GlassCard>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  donuts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
});
