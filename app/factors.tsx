import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { RadarChart } from '@/components/RadarChart';
import { MetricRow } from '@/components/MetricRow';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Spacing, Typography } from '@/constants/theme';

export default function FactorsScreen() {
  const { colors } = useTheme();
  const { current } = useAnalysis();
  const router = useRouter();

  if (!current) {
    return (
      <AppBackground>
        <ScreenHeader title="Faktoren" showBack />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Kein Scan geladen.
        </Text>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <ScreenHeader title="Attraktivitätsfaktoren" showBack />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 60 }}>
        <DisclaimerBanner text={DISCLAIMERS.attractiveness} />

        <GlassCard style={{ marginTop: Spacing.md }}>
          <RadarChart data={current.radar} />
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Einzelbewertungen 0–100</Text>
          {current.factors.map((f) => (
            <MetricRow
              key={f.id}
              label={f.label}
              score={f.score}
              subtitle={f.explanation}
              onPress={() => router.push(`/feature/${f.id}`)}
            />
          ))}
        </GlassCard>

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </AppBackground>
  );
}
