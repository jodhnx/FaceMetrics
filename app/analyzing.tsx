import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AppBackground } from '@/components/AppBackground';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { Layout, Spacing, Typography } from '@/constants/theme';

const STEPS = [
  'Qualitätsprüfung…',
  'Landmark Detection…',
  'Symmetrie & Mitte…',
  'Proportionen & Ratios…',
  'Coach-Zusammenfassung…',
];

export default function AnalyzingScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const { colors } = useTheme();
  const { runAnalysis } = useAnalysis();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const pulse = useSharedValue(0.88);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 650);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!uri) {
      router.back();
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await runAnalysis(uri);
      if (cancelled) return;
      if (result) router.replace(`/results/${result.id}`);
      else router.replace('/(tabs)/scan');
    })();
    return () => {
      cancelled = true;
    };
  }, [uri, runAnalysis, router]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.35 + pulse.value * 0.35,
  }));

  return (
    <AppBackground>
      <View style={styles.center}>
        <Animated.View style={[styles.ring, { borderColor: colors.accent }, ringStyle]} />
        <Animated.View style={[styles.ringInner, { borderColor: colors.accent }]} />
        <Animated.View entering={FadeIn} style={styles.inner}>
          <Text style={[Typography.overline, { color: colors.accent }]}>ON-DEVICE</Text>
          <Text style={[Typography.title1, { color: colors.text, marginTop: Spacing.sm, textAlign: 'center' }]}>
            Analyse läuft
          </Text>
          <Text
            style={[
              Typography.body,
              { color: colors.textSecondary, marginTop: Spacing.lg, textAlign: 'center' },
            ]}
          >
            {STEPS[step]}
          </Text>
        </Animated.View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  ring: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
  },
  ringInner: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    opacity: 0.4,
  },
  inner: { alignItems: 'center', zIndex: 2 },
});
