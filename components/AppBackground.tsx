import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function AppBackground({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.background, colors.gradientEnd]}
      locations={[0, 0.45, 1]}
      style={styles.fill}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
