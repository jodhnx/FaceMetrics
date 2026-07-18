import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  color?: string;
  delay?: number;
}

export function ScoreRing({
  score,
  size = 168,
  stroke = 12,
  label,
  color,
  delay = 0,
}: Props) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const [display, setDisplay] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const accent = color ?? colors.accent;

  useEffect(() => {
    progress.value = 0;
    const t = setTimeout(() => {
      progress.value = withTiming(Math.min(1, score / 100), {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);

    const start = Date.now() + delay;
    let frame = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const tNorm = Math.min(1, elapsed / 1200);
      const eased = 1 - Math.pow(1 - tNorm, 3);
      setDisplay(Math.round(score * eased));
      if (tNorm < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(frame);
    };
  }, [score, delay, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.ringTrack}
            strokeWidth={stroke}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={accent}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
          />
        </Svg>
      </View>
      <Text style={[Typography.hero, { color: colors.text, fontSize: size * 0.26 }]}>{display}</Text>
      {label ? (
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: -2 }]}>
          {label.toUpperCase()}
        </Text>
      ) : null}
    </View>
  );
}
