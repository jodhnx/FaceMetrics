import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { ScoreRing } from '@/components/ScoreRing';
import { MetricRow } from '@/components/MetricRow';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { getAnalysisById } from '@/services/storage';
import type { AnalysisResult } from '@/types/analysis';
import { DISCLAIMERS, Radii, Spacing, Typography } from '@/constants/theme';

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
      <ScreenHeader title="Ergebnisse" subtitle="AI-Schätzung" showBack />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 60 }}>
        {data.imageUri && !data.imageUri.startsWith('demo://') ? (
          <Image source={{ uri: data.imageUri }} style={[styles.hero, { borderColor: colors.border }]} />
        ) : null}

        <View style={{ alignItems: 'center', marginVertical: Spacing.lg }}>
          <ScoreRing score={data.overallScore} label="Gesamtscore" />
        </View>

        <DisclaimerBanner text={DISCLAIMERS.attractiveness} />

        <View style={styles.quickLinks}>
          {[
            { label: 'Symmetrie', path: '/symmetry' },
            { label: 'Proportionen', path: '/proportions' },
            { label: 'Faktoren', path: '/factors' },
            { label: 'Wahrnehmung', path: '/perception' },
          ].map((l) => (
            <Pressable
              key={l.path}
              onPress={() => router.push(l.path as any)}
              style={[styles.chip, { backgroundColor: colors.accentSoft }]}
            >
              <Text style={[Typography.caption, { color: colors.accent, fontWeight: '600' }]}>
                {l.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Stärken</Text>
          {data.strengths.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => router.push(`/feature/${s.category.toLowerCase()}`)}
              style={styles.item}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.callout, { color: colors.text }]}>{s.title}</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {s.explanation}
                </Text>
                <Text style={[Typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>
                  Einfluss auf Score: ≈ {s.impact}
                </Text>
              </View>
              <Text style={[Typography.callout, { color: colors.text }]}>{s.score}</Text>
            </Pressable>
          ))}
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Verbesserungspotenzial</Text>
          {data.improvements.map((s) => (
            <View key={s.id} style={styles.item}>
              <Ionicons name="ellipse-outline" size={18} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.callout, { color: colors.text }]}>{s.title}</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {s.explanation}
                </Text>
                <Text style={[Typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>
                  Einfluss auf Score: ≈ {s.impact}
                </Text>
              </View>
              <Text style={[Typography.callout, { color: colors.text }]}>{s.score}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: 4 }]}>
            Attraktivitätsfaktoren
          </Text>
          {data.factors.map((f) => (
            <MetricRow
              key={f.id}
              label={f.label}
              score={f.score}
              subtitle={f.explanation}
              onPress={() => router.push(`/feature/${f.id}`)}
            />
          ))}
        </GlassCard>

        <PrimaryButton
          title="Promi-Strukturvergleich"
          variant="secondary"
          onPress={() => router.push('/celebrity')}
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: 220,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },
  item: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
  },
});
