import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { ScoreRing } from '@/components/ScoreRing';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Spacing, Typography } from '@/constants/theme';

export default function FeatureDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { colors } = useTheme();
  const { current } = useAnalysis();

  const factor = current?.factors.find(
    (f) => f.id === key || f.label.toLowerCase() === key?.toLowerCase()
  );
  const metric = current?.symmetryMetrics.find(
    (m) => m.id === key || m.label.toLowerCase().includes((key ?? '').toLowerCase())
  );
  const proportion = current?.proportionMetrics.find(
    (p) => p.id === key || p.label.toLowerCase().includes((key ?? '').toLowerCase())
  );

  const title = factor?.label ?? metric?.label ?? proportion?.label ?? key ?? 'Merkmal';
  const score = factor?.score ?? metric?.score ?? proportion?.score ?? 0;
  const explanation =
    factor?.explanation ??
    metric?.explanation ??
    proportion?.explanation ??
    'Keine Detailbeschreibung verfügbar. Starte einen Scan für vollständige Messwerte.';

  return (
    <AppBackground>
      <ScreenHeader title={title} showBack />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 60 }}>
        <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
          <ScoreRing score={score} label="Score" size={150} />
        </View>

        <DisclaimerBanner text={DISCLAIMERS.general} />

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Erklärung</Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {explanation}
          </Text>
        </GlassCard>

        {metric ? (
          <>
            <GlassCard style={{ marginTop: Spacing.md }}>
              <Text style={[Typography.title3, { color: colors.text }]}>Normbereich</Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                {metric.normRange}
              </Text>
            </GlassCard>
            <GlassCard style={{ marginTop: Spacing.md }}>
              <Text style={[Typography.title3, { color: colors.text }]}>Messwert</Text>
              <Text style={[Typography.title1, { color: colors.accent, marginTop: Spacing.sm }]}>
                {metric.value}
                {metric.unit ? ` ${metric.unit}` : ''}
              </Text>
              <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: 4 }]}>
                Level: {metric.level} · Einfluss: ≈ {metric.impact}
              </Text>
            </GlassCard>
            <GlassCard style={{ marginTop: Spacing.md }}>
              <Text style={[Typography.title3, { color: colors.text }]}>Warum wichtig?</Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                {metric.whyImportant}
              </Text>
            </GlassCard>
          </>
        ) : null}

        {proportion ? (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <Text style={[Typography.title3, { color: colors.text }]}>Messwerte</Text>
            <View style={styles.kv}>
              <Text style={[Typography.callout, { color: colors.textSecondary }]}>Aktuell</Text>
              <Text style={[Typography.callout, { color: colors.text }]}>
                {proportion.value} {proportion.unit}
              </Text>
            </View>
            <View style={styles.kv}>
              <Text style={[Typography.callout, { color: colors.textSecondary }]}>Referenz</Text>
              <Text style={[Typography.callout, { color: colors.text }]}>
                {proportion.ideal} {proportion.unit}
              </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${proportion.score}%`, backgroundColor: colors.accent },
                ]}
              />
            </View>
          </GlassCard>
        ) : null}

        {!current ? (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Kein aktiver Scan. Führe eine Analyse durch, um Messwerte zu sehen.
            </Text>
          </GlassCard>
        ) : null}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
});
