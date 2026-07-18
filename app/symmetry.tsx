import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { ScoreRing } from '@/components/ScoreRing';
import { SymmetryHeatmap } from '@/components/SymmetryHeatmap';
import { MetricRow } from '@/components/MetricRow';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Spacing, Typography } from '@/constants/theme';

export default function SymmetryScreen() {
  const { colors } = useTheme();
  const { current } = useAnalysis();
  const router = useRouter();

  if (!current) {
    return (
      <AppBackground>
        <ScreenHeader title="Symmetrie" showBack />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Kein Scan geladen.
        </Text>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <ScreenHeader title="Gesichtssymmetrie" showBack />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 60 }}>
        <View style={{ alignItems: 'center' }}>
          <ScoreRing score={current.symmetryScore} label="Symmetrie %" size={150} color={colors.success} />
        </View>

        <DisclaimerBanner text={DISCLAIMERS.general} />

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Heatmap
          </Text>
          <Text style={[Typography.footnote, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
            Grün = symmetrisch · Rot = asymmetrisch
          </Text>
          <SymmetryHeatmap points={current.heatmap} />
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Alle Messungen</Text>
          {current.symmetryMetrics.map((m) => (
            <MetricRow
              key={m.id}
              label={m.label}
              score={m.score}
              subtitle={`${m.value}${m.unit ? ` ${m.unit}` : ''} · Norm: ${m.normRange}`}
              onPress={() => router.push(`/feature/${m.id}`)}
            />
          ))}
        </GlassCard>
      </ScrollView>
    </AppBackground>
  );
}
