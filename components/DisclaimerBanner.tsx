import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';

interface Props {
  text: string;
  tone?: 'info' | 'warning';
}

export function DisclaimerBanner({ text, tone = 'info' }: Props) {
  const { colors } = useTheme();
  const bg = tone === 'warning' ? colors.warningSoft : colors.accentSoft;
  const fg = tone === 'warning' ? colors.warning : colors.accent;

  return (
    <View style={[styles.box, { backgroundColor: bg, borderColor: colors.border }]}>
      <Text style={[Typography.caption, { color: fg, marginBottom: 4 }]}>Hinweis</Text>
      <Text style={[Typography.footnote, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
