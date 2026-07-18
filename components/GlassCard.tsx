import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { Radii, Spacing } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export function GlassCard({ children, style, padding = Spacing.md }: Props) {
  const { isDark, colors } = useTheme();

  return (
    <View style={[styles.wrap, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={28} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      ) : null}
      <View
        style={[
          styles.inner,
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
  inner: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
