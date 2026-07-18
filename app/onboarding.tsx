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
import { DISCLAIMERS, Layout, Spacing, Typography } from '@/constants/theme';

const width = Math.min(Dimensions.get('window').width, Layout.maxContentWidth);

const SLIDES = [
  {
    kicker: 'FACEMETRICS AI',
    title: 'Messbar.\nEhrlich.\nPrivat.',
    body: 'Landmarken, Symmetrie und Proportionen – als KI-Schätzung, nie als objektive Schönheit.',
  },
  {
    kicker: 'ANALYSE',
    title: 'Dutzende\nMesswerte.',
    body: 'Von Canthal Tilt bis Jawline – mit Score, Normbereich, Coach und klaren Hinweisen.',
  },
  {
    kicker: 'FORTSCHRITT',
    title: 'Vergleichen.\nVerstehen.\nVerbessern.',
    body: 'Verlauf, Heatmaps und evidenzbasierte Tipps zu Haltung, Pflege und Fotos.',
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
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <AppBackground>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={{ width, paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.xxl }}>
              <Animated.Text
                entering={FadeInDown.duration(500)}
                style={[Typography.overline, { color: colors.accent }]}
              >
                {item.kicker}
              </Animated.Text>
              <Text style={[Typography.hero, { color: colors.text, marginTop: Spacing.md }]}>
                {item.title}
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                {item.body}
              </Text>
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
                  backgroundColor: i === index ? colors.accent : colors.borderStrong,
                  width: i === index ? 28 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Text
          style={[
            Typography.footnote,
            {
              color: colors.textTertiary,
              textAlign: 'center',
              marginHorizontal: Layout.screenPadding,
              marginBottom: Spacing.md,
            },
          ]}
        >
          {DISCLAIMERS.general}
        </Text>

        <View style={{ paddingHorizontal: Layout.screenPadding }}>
          <PrimaryButton
            title={index === SLIDES.length - 1 ? 'App starten' : 'Weiter'}
            onPress={next}
          />
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  dot: { height: 8, borderRadius: 4 },
});
