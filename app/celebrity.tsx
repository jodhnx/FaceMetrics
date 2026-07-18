import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Radii, Spacing, Typography } from '@/constants/theme';

export default function CelebrityScreen() {
  const { colors } = useTheme();
  const { current } = useAnalysis();

  if (!current) {
    return (
      <AppBackground>
        <ScreenHeader title="Strukturvergleich" showBack />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Kein Scan geladen.
        </Text>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <ScreenHeader title="Ähnliche Gesichtsstruktur" showBack />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 60 }}>
        <DisclaimerBanner text={DISCLAIMERS.celebrity} tone="warning" />

        <Text style={[Typography.body, { color: colors.textSecondary, marginVertical: Spacing.md }]}>
          Die AI sucht ähnliche Landmark-Muster. Das ist kein Identitätsabgleich.
        </Text>

        {current.celebrityMatches.map((m, i) => (
          <GlassCard key={m.id} style={{ marginBottom: Spacing.sm }}>
            <View style={styles.row}>
              <View style={[styles.rank, { backgroundColor: colors.accentSoft }]}>
                <Text style={[Typography.title3, { color: colors.accent }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.title3, { color: colors.text }]}>{m.name}</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>{m.note}</Text>
              </View>
              <Text style={[Typography.title2, { color: colors.accent }]}>{m.similarity}%</Text>
            </View>
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${m.similarity}%`, backgroundColor: colors.accent },
                ]}
              />
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rank: {
    width: 40,
    height: 40,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 5,
    borderRadius: 3,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  fill: { height: '100%' },
});
