import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { Radii, Spacing } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
}

export function GlassCard({ children, style, intensity = 40, padding = Spacing.md }: Props) {
  const { isDark, colors } = useTheme();

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.base,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding,
            // @ts-expect-error web backdrop
            backdropFilter: 'blur(20px)',
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.base,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  base: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
