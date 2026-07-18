import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/GlassCard';
import { CoachBubble, DisclaimerBanner } from '@/components/ui';
import { getAllExercises } from '@/services/analysisEngine';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Layout, Radii, Spacing, Typography } from '@/constants/theme';

const EVIDENCE_LABEL = {
  well_supported: 'Gut belegt',
  general_advice: 'Allgemeiner Rat',
  limited_evidence: 'Begrenzte Evidenz',
};

export default function CoachScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { current, history } = useAnalysis();
  const latest = current ?? history[0] ?? null;
  const exercises = getAllExercises();

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: 140,
          paddingHorizontal: Layout.screenPadding,
        }}
      >
        <Text style={[Typography.overline, { color: colors.accent }]}>AI COACH</Text>
        <Text style={[Typography.title1, { color: colors.text }]}>Erklären & üben</Text>

        {latest ? (
          <View style={{ marginTop: Spacing.lg }}>
            <CoachBubble text={latest.coachSummary} />
          </View>
        ) : (
          <GlassCard style={{ marginTop: Spacing.lg }}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Starte einen Scan, damit der Coach deine Werte erklären kann.
            </Text>
          </GlassCard>
        )}

        {latest ? (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <Text style={[Typography.title3, { color: colors.text }]}>Verbesserungsfokus</Text>
            {latest.improvements.slice(0, 4).map((i) => (
              <Pressable
                key={i.id}
                onPress={() => router.push(`/metric/${i.metricId}`)}
                style={styles.focusRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.callout, { color: colors.text, fontWeight: '600' }]}>
                    {i.title}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    Score {i.score} · Einfluss ≈ {i.impact}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
            ))}
          </GlassCard>
        ) : null}

        <Text
          style={[
            Typography.title3,
            { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm },
          ]}
        >
          Übungen
        </Text>
        <DisclaimerBanner text={DISCLAIMERS.exercises} tone="warning" />

        {exercises.map((ex) => (
          <Pressable
            key={ex.id}
            onPress={() => router.push(`/exercise/${ex.id}`)}
            style={{ marginTop: Spacing.sm }}
          >
            <GlassCard>
              <View style={styles.exHead}>
                <View style={[styles.badge, { backgroundColor: colors.accentDim }]}>
                  <Text style={[Typography.caption, { color: colors.accent }]}>
                    {EVIDENCE_LABEL[ex.evidence]}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={28} color={colors.accent} />
              </View>
              <Text style={[Typography.title3, { color: colors.text, marginTop: Spacing.sm }]}>
                {ex.title}
              </Text>
              <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: 4 }]}>
                {ex.duration} · {ex.frequency}
              </Text>
            </GlassCard>
          </Pressable>
        ))}

        <View style={{ marginTop: Spacing.lg }}>
          <DisclaimerBanner text={DISCLAIMERS.medical} tone="warning" />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  exHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
  },
});
