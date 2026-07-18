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
  size = 160,
  stroke = 10,
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
      progress.value = withTiming(score / 100, {
        duration: 1100,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);

    // Display number animation (web-safe fallback)
    const start = Date.now() + delay;
    const duration = 1100;
    let frame: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const tNorm = Math.min(1, elapsed / duration);
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
      <View style={{ transform: [{ rotate: '-90deg' }], ...StyleSheet.absoluteFillObject }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
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
      <Text style={[Typography.hero, { color: colors.text, fontSize: size * 0.28 }]}>
        {display}
      </Text>
      {label ? (
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: -4 }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
