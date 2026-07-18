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
import { RadarChart } from '@/components/RadarChart';
import { SymmetryHeatmap } from '@/components/SymmetryHeatmap';
import { MiniDonut, TrendSparkline } from '@/components/Charts';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Radii, Spacing, Typography } from '@/constants/theme';

export default function Dashboard() {
  const { colors } = useTheme();
  const { current, history, refreshHistory, setCurrent } = useAnalysis();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const latest = current ?? history[0] ?? null;
  const trend = history
    .slice(0, 8)
    .map((h) => h.overallScore)
    .reverse();

  if (!latest) {
    return (
      <AppBackground>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: 120,
            paddingHorizontal: Spacing.md,
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={[Typography.caption, { color: colors.accent, letterSpacing: 1.5 }]}>
              FACEMETRICS AI
            </Text>
            <Text style={[Typography.hero, { color: colors.text, marginTop: Spacing.sm }]}>
              Dein Gesicht.{'\n'}Klar analysiert.
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Lade ein frontales Foto hoch – gerader Blick, neutrales Gesicht, gute Beleuchtung.
            </Text>
            <PrimaryButton
              title="Ersten Scan starten"
              onPress={() => router.push('/(tabs)/scan')}
              style={{ marginTop: Spacing.xl }}
            />
            <PrimaryButton
              title="Demo-Analyse laden"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/analyzing',
                  params: { uri: 'demo://facemetrics/sample-portrait' },
                })
              }
              style={{ marginTop: Spacing.sm }}
            />
          </Animated.View>
        </ScrollView>
      </AppBackground>
    );
  }

  const shortcuts = [
    { label: 'Symmetrie', href: '/symmetry', icon: 'git-compare-outline' as const },
    { label: 'Proportionen', href: '/proportions', icon: 'resize-outline' as const },
    { label: 'Faktoren', href: '/factors', icon: 'analytics-outline' as const },
    { label: 'Promi', href: '/celebrity', icon: 'people-outline' as const },
    { label: 'Wahrnehmung', href: '/perception', icon: 'eye-outline' as const },
  ];

  return (
    <AppBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: 120,
          paddingHorizontal: Spacing.md,
        }}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={[Typography.caption, { color: colors.accent, letterSpacing: 1.2 }]}>
              FACEMETRICS AI
            </Text>
            <Text style={[Typography.title1, { color: colors.text }]}>Dashboard</Text>
          </View>
          {latest.imageUri ? (
            <Image source={{ uri: latest.imageUri }} style={[styles.avatar, { borderColor: colors.border }]} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
              <Ionicons name="person" size={22} color={colors.accent} />
            </View>
          )}
        </View>

        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{ alignItems: 'center', marginVertical: Spacing.lg }}>
          <ScoreRing score={latest.overallScore} label="Gesamtscore" size={180} stroke={12} />
        </Animated.View>

        <DisclaimerBanner text={DISCLAIMERS.attractiveness} />

        <View style={[styles.donutRow, { marginTop: Spacing.lg }]}>
          <MiniDonut value={latest.symmetryScore} label="Symmetrie" color={colors.success} />
          <MiniDonut value={latest.goldenRatioScore} label="Golden Ratio" />
          <MiniDonut value={latest.proportionsScore} label="Proportionen" color={colors.warning} />
        </View>

        {trend.length > 1 ? (
          <GlassCard style={{ marginTop: Spacing.lg }}>
            <Text style={[Typography.title3, { color: colors.text }]}>Trend</Text>
            <Text style={[Typography.footnote, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
              Entwicklung deiner letzten Scans
            </Text>
            <TrendSparkline values={trend} width={280} height={44} />
          </GlassCard>
        ) : null}

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Symmetrie-Heatmap
          </Text>
          <SymmetryHeatmap points={latest.heatmap} height={240} />
          <PrimaryButton
            title="Symmetrie im Detail"
            variant="secondary"
            onPress={() => {
              setCurrent(latest);
              router.push('/symmetry');
            }}
            style={{ marginTop: Spacing.md }}
          />
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Merkmals-Radar
          </Text>
          <RadarChart data={latest.radar} />
        </GlassCard>

        <Text style={[Typography.title3, { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
          Bereiche
        </Text>
        <View style={styles.shortcutGrid}>
          {shortcuts.map((s) => (
            <Pressable
              key={s.label}
              onPress={() => {
                setCurrent(latest);
                router.push(s.href as any);
              }}
              style={[styles.shortcut, { backgroundColor: colors.surfaceSolid, borderColor: colors.border }]}
            >
              <Ionicons name={s.icon} size={22} color={colors.accent} />
              <Text style={[Typography.caption, { color: colors.text, marginTop: 6 }]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        <GlassCard style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Stärken</Text>
          {latest.strengths.slice(0, 3).map((s) => (
            <View key={s.id} style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[Typography.callout, { color: colors.text, flex: 1 }]}>{s.title}</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>{s.score}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Verbesserungspotenzial</Text>
          {latest.improvements.slice(0, 3).map((s) => (
            <View key={s.id} style={styles.listItem}>
              <Ionicons name="remove-circle-outline" size={18} color={colors.warning} />
              <Text style={[Typography.callout, { color: colors.text, flex: 1 }]}>{s.title}</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>{s.score}</Text>
            </View>
          ))}
          <PrimaryButton
            title="Vollständige Ergebnisse"
            onPress={() => router.push(`/results/${latest.id}`)}
            style={{ marginTop: Spacing.md }}
          />
        </GlassCard>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  donutRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  shortcut: {
    width: '31%',
    flexGrow: 1,
    minWidth: '30%',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
});
