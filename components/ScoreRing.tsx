import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
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
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const accent = color ?? colors.accent;

  useEffect(() => {
    const t = setTimeout(() => {
      progress.value = withTiming(score / 100, {
        duration: 1100,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(t);
  }, [score, delay, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
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
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[Typography.hero, { color: colors.text, fontSize: size * 0.28 }]}>
        {Math.round(score)}
      </Text>
      {label ? (
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: -4 }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
