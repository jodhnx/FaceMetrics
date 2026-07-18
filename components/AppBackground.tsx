import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Layout } from '@/constants/theme';

export function AppBackground({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();

  const content = (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      locations={[0, 0.5, 1]}
      style={styles.fill}
    >
      {children}
    </LinearGradient>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webShell}>
        <View style={[styles.phone, { backgroundColor: colors.background, borderColor: colors.borderStrong }]}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  webShell: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    overflow: 'hidden',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
});
