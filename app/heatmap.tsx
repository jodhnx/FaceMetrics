import { ScrollView, Text, View } from 'react-native';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { SymmetryHeatmap } from '@/components/SymmetryHeatmap';
import { DisclaimerBanner } from '@/components/ui';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Layout, Spacing, Typography } from '@/constants/theme';

export default function HeatmapScreen() {
  const { colors } = useTheme();
  const { current, history } = useAnalysis();
  const latest = current ?? history[0] ?? null;

  return (
    <AppBackground>
      <ScreenHeader title="Heatmap" subtitle="Interaktiv" showBack />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: 60,
        }}
      >
        <DisclaimerBanner text={DISCLAIMERS.analysis} />

        {!latest ? (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Kein Scan geladen. Starte eine Analyse.
            </Text>
          </GlassCard>
        ) : (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
              Gesichtssymmetrie
            </Text>
            <Text style={[Typography.footnote, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
              Grün = stark · Gelb = mittel · Rot = Abweichung. Punkt antippen für Erklärung.
            </Text>
            <SymmetryHeatmap points={latest.heatmap} height={360} interactive />
            <View style={{ marginTop: Spacing.md }}>
              <Text style={[Typography.caption, { color: colors.textTertiary }]}>
                Symmetrie-Score gesamt: {latest.symmetryScore}
              </Text>
            </View>
          </GlassCard>
        )}

        <View style={{ marginTop: Spacing.md }}>
          <DisclaimerBanner text={DISCLAIMERS.beauty} tone="warning" />
        </View>
      </ScrollView>
    </AppBackground>
  );
}
