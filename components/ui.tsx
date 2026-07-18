import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';

export function DisclaimerBanner({
  text,
  tone = 'info',
}: {
  text: string;
  tone?: 'info' | 'warning';
}) {
  const { colors } = useTheme();
  const bg = tone === 'warning' ? colors.warningDim : colors.accentDim;
  const fg = tone === 'warning' ? colors.warning : colors.accent;

  return (
    <View style={[styles.box, { backgroundColor: bg, borderColor: colors.border }]}>
      <Text style={[Typography.overline, { color: fg, marginBottom: 6 }]}>HINWEIS</Text>
      <Text style={[Typography.footnote, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

export function CoachBubble({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.coach, { backgroundColor: colors.surfaceSolid, borderColor: colors.border }]}>
      <Text style={[Typography.overline, { color: colors.accent, marginBottom: 8 }]}>AI COACH</Text>
      <Text style={[Typography.body, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

export function DeltaBadge({ value }: { value: number }) {
  const { colors } = useTheme();
  if (!value) {
    return (
      <Text style={[Typography.caption, { color: colors.textTertiary }]}>±0 seit letztem Scan</Text>
    );
  }
  const up = value > 0;
  return (
    <View style={[styles.delta, { backgroundColor: up ? colors.successDim : colors.warningDim }]}>
      <Text style={[Typography.caption, { color: up ? colors.success : colors.warning }]}>
        {up ? '+' : ''}
        {value} seit letztem Scan
      </Text>
    </View>
  );
}

export function TrendSparkline({
  values,
  width = 280,
  height = 48,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  const { colors } = useTheme();
  if (values.length < 2) return null;
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const d = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={colors.accent} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function MetricBar({
  label,
  score,
  subtitle,
  onPress,
}: {
  label: string;
  score: number;
  subtitle?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const color = score >= 85 ? colors.success : score >= 72 ? colors.accent : colors.warning;

  const body = (
    <View style={{ flex: 1 }}>
      <View style={styles.metricTop}>
        <Text style={[Typography.callout, { color: colors.text, fontWeight: '600' }]}>{label}</Text>
        <Text style={[Typography.title3, { color: colors.text }]}>{score}</Text>
      </View>
      {subtitle ? (
        <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
          {subtitle}
        </Text>
      ) : (
        <View style={{ height: 8 }} />
      )}
      <View style={[styles.track, { backgroundColor: colors.ringTrack }]}>
        <View style={[styles.fill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.metricRow, { opacity: pressed ? 0.7 : 1 }]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={styles.metricRow}>{body}</View>;
}

const styles = StyleSheet.create({
  box: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  coach: {
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  delta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  metricRow: { paddingVertical: Spacing.md },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
