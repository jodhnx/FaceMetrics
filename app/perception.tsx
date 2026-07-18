import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Radii, Spacing, Typography } from '@/constants/theme';

export default function PerceptionScreen() {
  const { colors } = useTheme();
  const { current } = useAnalysis();

  if (!current) {
    return (
      <AppBackground>
        <ScreenHeader title="Wahrnehmung" showBack />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Kein Scan geladen.
        </Text>
      </AppBackground>
    );
  }

  const p = current.perception;
  const rows = [
    { label: 'Symmetrie wirkt im Alltag', value: p.everydaySymmetry },
    { label: 'Natürlichkeit', value: p.naturalness },
    { label: 'Auffälligkeit von Asymmetrien', value: p.asymmetryNoticeability },
    {
      label: 'Wahrscheinlichkeit, dass kleine Asymmetrien bemerkt werden',
      value: p.everydayDetectionChance,
    },
  ];

  return (
    <AppBackground>
      <ScreenHeader title="Wahrnehmungs-Simulation" showBack />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 60 }}>
        <DisclaimerBanner text={DISCLAIMERS.perception} tone="warning" />

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Simulation</Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {p.summary}
          </Text>
        </GlassCard>

        {rows.map((r) => (
          <GlassCard key={r.label} style={{ marginTop: Spacing.sm }}>
            <Text style={[Typography.footnote, { color: colors.textSecondary }]}>{r.label}</Text>
            <View style={[styles.badge, { backgroundColor: colors.accentSoft, marginTop: Spacing.sm }]}>
              <Text style={[Typography.title3, { color: colors.accent }]}>{r.value}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
  },
});
