import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  data: { label: string; value: number }[];
  size?: number;
}

export function RadarChart({ data, size = 260 }: Props) {
  const { colors } = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const n = data.length;
  if (n < 3) return null;

  const pointAt = (i: number, value: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const r = (value / 100) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const labelAt = (i: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const r = radius + 22;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const poly = data.map((d, i) => pointAt(i, d.value));
  const polyPoints = poly.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <Polygon
            key={scale}
            points={data
              .map((_, i) => {
                const p = pointAt(i, 100 * scale);
                return `${p.x},${p.y}`;
              })
              .join(' ')}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        {data.map((_, i) => {
          const p = pointAt(i, 100);
          return (
            <Line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke={colors.border}
              strokeWidth={1}
            />
          );
        })}
        <Polygon
          points={polyPoints}
          fill={colors.accentSoft}
          stroke={colors.accent}
          strokeWidth={2}
        />
        {poly.map((p, i) => (
          <Circle key={`pt-${i}`} cx={p.x} cy={p.y} r={3.5} fill={colors.accent} />
        ))}
        {data.map((d, i) => {
          const p = labelAt(i);
          return (
            <SvgText
              key={`lbl-${i}`}
              x={p.x}
              y={p.y}
              fill={colors.textSecondary}
              fontSize={10}
              fontWeight="500"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
