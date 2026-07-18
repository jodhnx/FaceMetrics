import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/GlassCard';
import { ScoreRing } from '@/components/ScoreRing';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  CoachBubble,
  DeltaBadge,
  DisclaimerBanner,
  MetricBar,
} from '@/components/ui';
import { compareScans } from '@/services/analysisEngine';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Layout, Radii, Spacing, Typography } from '@/constants/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { current, history, refreshHistory, setCurrent } = useAnalysis();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const latest = current ?? history[0] ?? null;
  const previous = history.find((h) => h.id !== latest?.id) ?? null;
  const delta = latest ? compareScans(latest, previous) : null;

  if (!latest) {
    return (
      <AppBackground>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: 140,
            paddingHorizontal: Layout.screenPadding,
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={[Typography.overline, { color: colors.accent }]}>FACEMETRICS AI</Text>
            <Text style={[Typography.hero, { color: colors.text, marginTop: Spacing.sm }]}>
              Dein Gesicht.{'\n'}Klar gemessen.
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Frontales Foto, gerader Blick, neutrales Gesicht, gutes Licht.
            </Text>
            <PrimaryButton
              title="360° Face Scan"
              onPress={() => router.push('/live-scan' as any)}
              style={{ marginTop: Spacing.xl }}
            />
            <PrimaryButton
              title="Demo-Analyse (ohne Kamera)"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/analyzing',
                  params: { uri: `demo://sample/${Date.now()}` },
                })
              }
              style={{ marginTop: Spacing.sm }}
            />
            <View style={{ marginTop: Spacing.lg }}>
              <DisclaimerBanner text={DISCLAIMERS.analysis} />
            </View>
          </Animated.View>
        </ScrollView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: 140,
          paddingHorizontal: Layout.screenPadding,
        }}
      >
        <View style={styles.top}>
          <View>
            <Text style={[Typography.overline, { color: colors.accent }]}>HOME</Text>
            <Text style={[Typography.title1, { color: colors.text }]}>Dashboard</Text>
          </View>
          {latest.imageUri && !latest.imageUri.startsWith('demo://') ? (
            <Image
              source={{ uri: latest.imageUri }}
              style={[styles.avatar, { borderColor: colors.border }]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.accentDim,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <Ionicons name="person" size={20} color={colors.accent} />
            </View>
          )}
        </View>

        <Animated.View
          entering={FadeInDown.delay(60).duration(500)}
          style={{ alignItems: 'center', marginTop: Spacing.lg }}
        >
          <ScoreRing score={latest.overallScore} label="Gesamtscore" size={180} stroke={13} />
          {delta ? (
            <View style={{ marginTop: Spacing.md }}>
              <DeltaBadge value={delta.overall} />
            </View>
          ) : null}
        </Animated.View>

        <View style={{ marginTop: Spacing.lg }}>
          <DisclaimerBanner text={DISCLAIMERS.analysis} />
        </View>

        <View style={styles.statRow}>
          {[
            { l: 'Symmetrie', v: latest.symmetryScore },
            { l: 'Proportionen', v: latest.proportionsScore },
            { l: 'Golden Ratio', v: latest.goldenRatioScore },
          ].map((s) => (
            <GlassCard key={s.l} style={{ flex: 1 }} padding={Spacing.md}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>{s.l}</Text>
              <Text style={[Typography.title1, { color: colors.text, marginTop: 4 }]}>{s.v}</Text>
            </GlassCard>
          ))}
        </View>

        <PrimaryButton
          title="360° Quick Scan"
          onPress={() => router.push('/live-scan' as any)}
          style={{ marginTop: Spacing.lg }}
        />

        <View style={{ marginTop: Spacing.lg }}>
          <CoachBubble text={latest.coachSummary} />
        </View>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Empfehlungen des Tages
          </Text>
          {latest.dailyTips.map((t) => (
            <View key={t} style={styles.tipRow}>
              <Ionicons name="sparkles" size={16} color={colors.accent} />
              <Text style={[Typography.callout, { color: colors.text, flex: 1 }]}>{t}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <View style={styles.sectionHead}>
            <Text style={[Typography.title3, { color: colors.text }]}>Top-Merkmale</Text>
            <Pressable
              onPress={() => {
                setCurrent(latest);
                router.push(`/results/${latest.id}`);
              }}
            >
              <Text style={[Typography.caption, { color: colors.accent }]}>Alle</Text>
            </Pressable>
          </View>
          {latest.metrics.slice(0, 6).map((m) => (
            <MetricBar
              key={m.id}
              label={m.label}
              score={m.score}
              subtitle={`Einfluss ≈ ${m.impact}`}
              onPress={() => router.push(`/metric/${m.id}`)}
            />
          ))}
        </GlassCard>

        <View style={styles.quickGrid}>
          {[
            { t: 'Heatmap', i: 'flame' as const, href: '/heatmap' },
            { t: 'Ergebnisse', i: 'analytics' as const, href: `/results/${latest.id}` },
            { t: 'Fortschritt', i: 'trending-up' as const, href: '/(tabs)/progress' },
            { t: 'Coach', i: 'chatbubbles' as const, href: '/(tabs)/coach' },
          ].map((q) => (
            <Pressable
              key={q.t}
              onPress={() => {
                setCurrent(latest);
                router.push(q.href as any);
              }}
              style={[
                styles.quick,
                { backgroundColor: colors.surfaceSolid, borderColor: colors.border },
              ]}
            >
              <Ionicons name={q.i} size={22} color={colors.accent} />
              <Text style={[Typography.caption, { color: colors.text, marginTop: 8 }]}>{q.t}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  quick: {
    width: '48%',
    flexGrow: 1,
    minWidth: '46%',
    paddingVertical: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
});
