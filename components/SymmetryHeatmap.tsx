import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';
import type { HeatmapPoint } from '@/types/analysis';

interface Props {
  points: HeatmapPoint[];
  height?: number;
}

function heatColor(symmetry: number, green: string, red: string) {
  // green = high symmetry, red = low
  if (symmetry >= 90) return green;
  if (symmetry >= 80) return '#A8E06C';
  if (symmetry >= 70) return '#FFD60A';
  return red;
}

export function SymmetryHeatmap({ points, height = 280 }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.wrap, { height, borderColor: colors.border }]}>
      <LinearGradient
        colors={
          isDark
            ? ['#1A1A1E', '#121216', '#0A0A0C']
            : ['#E8EDF3', '#F4F6F8', '#EEF1F5']
        }
        style={StyleSheet.absoluteFill}
      />
      {/* Face silhouette guide */}
      <View style={[styles.faceGuide, { borderColor: colors.border }]} />
      {points.map((p) => (
        <View
          key={p.label}
          style={[
            styles.dot,
            {
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              backgroundColor: heatColor(p.symmetry, colors.heatmapGreen, colors.heatmapRed),
              shadowColor: heatColor(p.symmetry, colors.heatmapGreen, colors.heatmapRed),
            },
          ]}
        >
          <View style={styles.tooltip}>
            <Text style={[Typography.caption, { color: '#fff', fontSize: 9 }]}>
              {p.symmetry}%
            </Text>
          </View>
        </View>
      ))}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.swatch, { backgroundColor: colors.heatmapGreen }]} />
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>Symmetrisch</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.swatch, { backgroundColor: colors.heatmapRed }]} />
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>Asymmetrisch</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  faceGuide: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    top: '8%',
    bottom: '8%',
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  dot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    marginTop: -9,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  tooltip: {
    marginTop: -22,
  },
  legend: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
});
