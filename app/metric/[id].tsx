import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { ScoreRing } from '@/components/ScoreRing';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CoachBubble, DisclaimerBanner } from '@/components/ui';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { METRIC_CATALOG } from '@/constants/catalog';
import { DISCLAIMERS, Layout, Radii, Spacing, Typography } from '@/constants/theme';

export default function MetricDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { current, history } = useAnalysis();
  const router = useRouter();

  const latest = current ?? history[0] ?? null;
  const metric = latest?.metrics.find((m) => m.id === id);
  const fallback = METRIC_CATALOG.find((m) => m.id === id);

  const title = metric?.label ?? fallback?.label ?? id;
  const score = metric?.score ?? 0;

  return (
    <AppBackground>
      <ScreenHeader title={title} showBack />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: 60,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
          <ScoreRing score={score} label="Score" size={150} />
        </View>

        <DisclaimerBanner text={DISCLAIMERS.analysis} />

        {metric ? (
          <View style={{ marginTop: Spacing.md }}>
            <CoachBubble text={metric.coachNote} />
          </View>
        ) : null}

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Beschreibung</Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {metric?.description ?? fallback?.description}
          </Text>
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Wie gemessen</Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {metric?.howMeasured ?? fallback?.howMeasured}
          </Text>
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Normbereich</Text>
          <Text style={[Typography.title2, { color: colors.accent, marginTop: Spacing.sm }]}>
            {metric?.normRange ?? fallback?.normRange}
          </Text>
          {metric ? (
            <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: 8 }]}>
              Messwert: {metric.value} {metric.unit} · Band: {metric.band} · Einfluss ≈ {metric.impact}
            </Text>
          ) : null}
          <View style={[styles.barTrack, { backgroundColor: colors.ringTrack, marginTop: Spacing.md }]}>
            <View
              style={[styles.barFill, { width: `${score}%`, backgroundColor: colors.accent }]}
            />
          </View>
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Warum wichtig</Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {metric?.whyImportant ?? fallback?.whyImportant}
          </Text>
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Was verbessert werden kann</Text>
          <Text style={[Typography.footnote, { color: colors.textTertiary, marginTop: 4, marginBottom: Spacing.sm }]}>
            Allgemeine Styling-/Pflege-/Fototipps – keine medizinischen Versprechen.
          </Text>
          {(metric?.tips ?? ['Vergleiche unter ähnlichem Licht.', 'Bei Hautproblemen Fachperson fragen.']).map(
            (tip) => (
              <View key={tip} style={styles.tip}>
                <Ionicons name="leaf-outline" size={16} color={colors.accent} />
                <Text style={[Typography.callout, { color: colors.text, flex: 1 }]}>{tip}</Text>
              </View>
            )
          )}
        </GlassCard>

        {metric && metric.exerciseIds.length > 0 ? (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <Text style={[Typography.title3, { color: colors.text }]}>Passende Übungen</Text>
            {metric.exerciseIds.map((eid) => (
              <Pressable
                key={eid}
                onPress={() => router.push(`/exercise/${eid}`)}
                style={[styles.exBtn, { backgroundColor: colors.accentDim }]}
              >
                <Text style={[Typography.callout, { color: colors.accent, fontWeight: '700' }]}>
                  Übung öffnen
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </Pressable>
            ))}
            <Text style={[Typography.footnote, { color: colors.textTertiary, marginTop: Spacing.sm }]}>
              Übungen ändern keine Knochenstruktur.
            </Text>
          </GlassCard>
        ) : null}

        <PrimaryButton
          title="Zur Heatmap"
          variant="secondary"
          onPress={() => router.push('/heatmap')}
          style={{ marginTop: Spacing.lg }}
        />

        <View style={{ marginTop: Spacing.md }}>
          <DisclaimerBanner text={DISCLAIMERS.medical} tone="warning" />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  tip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  exBtn: {
    marginTop: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
