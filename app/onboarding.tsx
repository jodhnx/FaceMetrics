import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppBackground } from '@/components/AppBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useTheme } from '@/context/ThemeContext';
import { setOnboardingDone } from '@/services/storage';
import { DISCLAIMERS, Spacing, Typography } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'FaceMetrics AI',
    body: 'Hochwertige Gesichtsanalyse zu Symmetrie, Proportionen und Harmonie – transparent und schätzungsbasiert.',
    emoji: '◇',
  },
  {
    title: 'Präzise Messungen',
    body: 'Dutzende Merkmale von Augen bis Kiefer – visualisiert mit Heatmaps, Radar und Detailseiten.',
    emoji: '◎',
  },
  {
    title: 'Transparent & privat',
    body: 'On-Device-orientierte Verarbeitung, optionale Foto-Löschung und klare Hinweise zu allen Scores.',
    emoji: '⬡',
  },
];

export default function Onboarding() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await setOnboardingDone();
    router.replace('/(tabs)');
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg }]}>
        <Animated.Text entering={FadeInDown.duration(600)} style={[Typography.caption, { color: colors.accent, textAlign: 'center', letterSpacing: 2 }]}>
          PREMIUM FACIAL ANALYSIS
        </Animated.Text>

        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={{ width, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl }}>
              <Text style={[styles.glyph, { color: colors.accent }]}>{item.emoji}</Text>
              <Text style={[Typography.hero, { color: colors.text, marginTop: Spacing.lg }]}>{item.title}</Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>{item.body}</Text>
            </View>
          )}
        />

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? colors.accent : colors.border,
                  width: i === index ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Text style={[Typography.footnote, { color: colors.textTertiary, textAlign: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.md }]}>
          {DISCLAIMERS.general}
        </Text>

        <View style={{ paddingHorizontal: Spacing.lg }}>
          <PrimaryButton title={index === SLIDES.length - 1 ? 'Loslegen' : 'Weiter'} onPress={next} />
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glyph: { fontSize: 56, fontWeight: '200' },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
