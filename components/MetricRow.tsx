import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';

interface Props {
  label: string;
  score: number;
  max?: number;
  onPress?: () => void;
  subtitle?: string;
}

export function MetricRow({ label, score, max = 100, onPress, subtitle }: Props) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(100, (score / max) * 100));

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          Haptics.selectionAsync();
          onPress();
        }
      }}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[Typography.callout, { color: colors.text }]}>{label}</Text>
        {subtitle ? (
          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        ) : null}
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${pct}%`,
                backgroundColor:
                  score >= 85 ? colors.success : score >= 70 ? colors.accent : colors.warning,
              },
            ]}
          />
        </View>
      </View>
      <Text style={[Typography.title3, { color: colors.text, marginLeft: Spacing.md }]}>
        {Math.round(score)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  track: {
    height: 4,
    borderRadius: Radii.full,
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.full,
  },
});
