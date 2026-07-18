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
import { Spacing, Typography } from '@/constants/theme';

const STEPS = [
  'Gesicht lokalisiert…',
  'Landmark Detection…',
  'Symmetrie wird berechnet…',
  'Proportionen & Golden Ratio…',
  'Scores werden aggregiert…',
];

export default function AnalyzingScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const { colors } = useTheme();
  const { runAnalysis } = useAnalysis();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const pulse = useSharedValue(0.85);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 700);
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
      if (result) {
        router.replace(`/results/${result.id}`);
      } else {
        router.replace('/(tabs)/scan');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uri, runAnalysis, router]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.4 + pulse.value * 0.4,
  }));

  return (
    <AppBackground>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.ring,
            { borderColor: colors.accent },
            ringStyle,
          ]}
        />
        <Animated.View entering={FadeIn} style={styles.inner}>
          <Text style={[Typography.caption, { color: colors.accent, letterSpacing: 2 }]}>
            ON-DEVICE ANALYSE
          </Text>
          <Text style={[Typography.title1, { color: colors.text, marginTop: Spacing.sm, textAlign: 'center' }]}>
            FaceMetrics AI
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.lg, textAlign: 'center' }]}>
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
    paddingHorizontal: Spacing.lg,
  },
  ring: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
  },
  inner: { alignItems: 'center' },
});
