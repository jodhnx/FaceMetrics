import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { DisclaimerBanner } from '@/components/ui';
import { getExercise } from '@/services/analysisEngine';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Layout, Radii, Spacing, Typography } from '@/constants/theme';

const EVIDENCE = {
  well_supported: { label: 'Gut belegt', tone: 'success' as const },
  general_advice: { label: 'Allgemeiner Rat', tone: 'accent' as const },
  limited_evidence: { label: 'Begrenzte Evidenz', tone: 'warning' as const },
};

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const exercise = getExercise(id);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!exercise) {
    return (
      <AppBackground>
        <ScreenHeader title="Übung" showBack />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Übung nicht gefunden.
        </Text>
      </AppBackground>
    );
  }

  const ev = EVIDENCE[exercise.evidence];
  const evColor =
    ev.tone === 'success' ? colors.success : ev.tone === 'warning' ? colors.warning : colors.accent;

  return (
    <AppBackground>
      <ScreenHeader title={exercise.title} showBack />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: 60,
        }}
      >
        <View style={[styles.hero, { backgroundColor: colors.surfaceSolid, borderColor: colors.border }]}>
          <Animated.View style={[styles.orb, { borderColor: colors.accent }, animStyle]}>
            <Ionicons
              name={
                exercise.category === 'breathing'
                  ? 'leaf'
                  : exercise.category === 'posture'
                    ? 'body'
                    : 'fitness'
              }
              size={40}
              color={colors.accent}
            />
          </Animated.View>
          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            Animation · Video folgt in einer späteren Version
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                ev.tone === 'success'
                  ? colors.successDim
                  : ev.tone === 'warning'
                    ? colors.warningDim
                    : colors.accentDim,
              marginTop: Spacing.md,
            },
          ]}
        >
          <Text style={[Typography.caption, { color: evColor }]}>{ev.label}</Text>
        </View>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Evidenz-Hinweis</Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {exercise.evidenceNote}
          </Text>
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <View style={styles.meta}>
            <View>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Dauer</Text>
              <Text style={[Typography.callout, { color: colors.text, fontWeight: '700' }]}>
                {exercise.duration}
              </Text>
            </View>
            <View>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Häufigkeit</Text>
              <Text style={[Typography.callout, { color: colors.text, fontWeight: '700' }]}>
                {exercise.frequency}
              </Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Schritt für Schritt
          </Text>
          {exercise.steps.map((step, i) => (
            <View key={step} style={styles.step}>
              <View style={[styles.stepNum, { backgroundColor: colors.accentDim }]}>
                <Text style={[Typography.caption, { color: colors.accent }]}>{i + 1}</Text>
              </View>
              <Text style={[Typography.body, { color: colors.text, flex: 1 }]}>{step}</Text>
            </View>
          ))}
        </GlassCard>

        <View style={{ marginTop: Spacing.lg }}>
          <DisclaimerBanner text={DISCLAIMERS.exercises} tone="warning" />
        </View>
        <View style={{ marginTop: Spacing.sm }}>
          <DisclaimerBanner text={DISCLAIMERS.medical} tone="warning" />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 220,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  step: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
