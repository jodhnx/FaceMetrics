import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';
import type { HeatmapPoint } from '@/types/analysis';

interface Props {
  points: HeatmapPoint[];
  height?: number;
  interactive?: boolean;
}

function heatColor(score: number, c: { heatGreen: string; heatYellow: string; heatRed: string }) {
  if (score >= 85) return c.heatGreen;
  if (score >= 72) return c.heatYellow;
  return c.heatRed;
}

export function SymmetryHeatmap({ points, height = 320, interactive = true }: Props) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [active, setActive] = useState<HeatmapPoint | null>(null);

  return (
    <View>
      <View style={[styles.wrap, { height, borderColor: colors.border }]}>
        <LinearGradient
          colors={isDark ? ['#12151C', '#0C0E12', '#0A0C10'] : ['#E8EDF2', '#F4F6F8', '#EEF2F5']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.face, { borderColor: colors.borderStrong }]} />
        {points.map((p) => {
          const color = heatColor(p.score, colors);
          const selected = active?.id === p.id;
          return (
            <Pressable
              key={p.id}
              disabled={!interactive}
              onPress={() => {
                Haptics.selectionAsync();
                setActive(p);
              }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/metric/${p.metricId}`);
              }}
              style={[
                styles.dot,
                {
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  backgroundColor: color,
                  transform: [{ scale: selected ? 1.35 : 1 }],
                  borderColor: selected ? colors.text : 'transparent',
                },
              ]}
            />
          );
        })}
        <View style={styles.legend}>
          {[
            { c: colors.heatGreen, t: 'Stark' },
            { c: colors.heatYellow, t: 'Mittel' },
            { c: colors.heatRed, t: 'Abweichung' },
          ].map((l) => (
            <View key={l.t} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: l.c }]} />
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>{l.t}</Text>
            </View>
          ))}
        </View>
      </View>

      {active ? (
        <Pressable
          onPress={() => router.push(`/metric/${active.metricId}`)}
          style={[styles.tooltip, { backgroundColor: colors.surfaceSolid, borderColor: colors.border }]}
        >
          <Text style={[Typography.title3, { color: colors.text }]}>
            {active.label} · {active.score}
          </Text>
          <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: 4 }]}>
            Tippen für Details · Long-press öffnet die Merkmalsseite
          </Text>
        </Pressable>
      ) : interactive ? (
        <Text style={[Typography.footnote, { color: colors.textTertiary, marginTop: Spacing.sm }]}>
          Punkt antippen für Erklärung
        </Text>
      ) : null}
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
  face: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: '6%',
    bottom: '6%',
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    opacity: 0.45,
  },
  dot: {
    position: 'absolute',
    width: 22,
    height: 22,
    marginLeft: -11,
    marginTop: -11,
    borderRadius: 11,
    borderWidth: 2,
  },
  legend: {
    position: 'absolute',
    left: Spacing.sm,
    right: Spacing.sm,
    bottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  tooltip: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
