import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { ScoreRing } from '@/components/ScoreRing';
import { RadarChart } from '@/components/RadarChart';
import { SymmetryHeatmap } from '@/components/SymmetryHeatmap';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  CoachBubble,
  DisclaimerBanner,
  MetricBar,
} from '@/components/ui';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { getAnalysisById } from '@/services/storage';
import type { AnalysisResult } from '@/types/analysis';
import { DISCLAIMERS, Layout, Radii, Spacing, Typography } from '@/constants/theme';

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { current, setCurrent } = useAnalysis();
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(current?.id === id ? current : null);

  useEffect(() => {
    (async () => {
      if (current?.id === id) {
        setData(current);
        return;
      }
      const found = await getAnalysisById(id);
      if (found) {
        setData(found);
        setCurrent(found);
      }
    })();
  }, [id, current, setCurrent]);

  if (!data) {
    return (
      <AppBackground>
        <ScreenHeader title="Ergebnisse" showBack />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Scan nicht gefunden.
        </Text>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <ScreenHeader title="Ergebnisse" subtitle="KI-Schätzung" showBack />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: 60,
        }}
      >
        <View style={{ alignItems: 'center', marginVertical: Spacing.md }}>
          <ScoreRing score={data.overallScore} label="Gesamtscore" size={170} />
        </View>

        <DisclaimerBanner text={DISCLAIMERS.analysis} />
        <View style={{ marginTop: Spacing.sm }}>
          <DisclaimerBanner text={DISCLAIMERS.beauty} tone="warning" />
        </View>

        <View style={{ marginTop: Spacing.md }}>
          <CoachBubble text={data.coachSummary} />
        </View>

        <View style={styles.chips}>
          {[
            { t: 'Heatmap', h: '/heatmap' },
            { t: 'Coach', h: '/(tabs)/coach' },
            { t: 'Fortschritt', h: '/(tabs)/progress' },
          ].map((c) => (
            <Pressable
              key={c.t}
              onPress={() => router.push(c.h as any)}
              style={[styles.chip, { backgroundColor: colors.accentDim }]}
            >
              <Text style={[Typography.caption, { color: colors.accent }]}>{c.t}</Text>
            </Pressable>
          ))}
        </View>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Radar
          </Text>
          <RadarChart data={data.radar} />
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Heatmap
          </Text>
          <SymmetryHeatmap points={data.heatmap} height={280} />
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Stärken</Text>
          {data.strengths.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => router.push(`/metric/${s.metricId}`)}
              style={styles.item}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.callout, { color: colors.text, fontWeight: '600' }]}>
                  {s.title}
                </Text>
                <Text style={[Typography.caption, { color: colors.textTertiary }]}>
                  Einfluss ≈ {s.impact}
                </Text>
              </View>
              <Text style={[Typography.title3, { color: colors.text }]}>{s.score}</Text>
            </Pressable>
          ))}
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Verbesserungspotenzial</Text>
          {data.improvements.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => router.push(`/metric/${s.metricId}`)}
              style={styles.item}
            >
              <Ionicons name="ellipse-outline" size={20} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.callout, { color: colors.text, fontWeight: '600' }]}>
                  {s.title}
                </Text>
                <Text style={[Typography.caption, { color: colors.textTertiary }]}>
                  Einfluss ≈ {s.impact}
                </Text>
              </View>
              <Text style={[Typography.title3, { color: colors.text }]}>{s.score}</Text>
            </Pressable>
          ))}
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Alle Messwerte</Text>
          {data.metrics.map((m) => (
            <MetricBar
              key={m.id}
              label={m.label}
              score={m.score}
              subtitle={`${m.value} ${m.unit} · ${m.normRange}`}
              onPress={() => router.push(`/metric/${m.id}`)}
            />
          ))}
        </GlassCard>

        <PrimaryButton
          title="Neuen Scan starten"
          onPress={() => router.push('/(tabs)/scan')}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radii.full,
  },
  item: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
