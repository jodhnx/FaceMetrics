import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Line, Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { ScanPose } from '@/types/analysis';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

interface Props {
  pose: ScanPose;
  size?: number;
  accent?: string;
  progress?: number;
}

function poseOffset(pose: ScanPose) {
  switch (pose) {
    case 'left':
      return { x: -18, y: 0, skew: -0.12 };
    case 'right':
      return { x: 18, y: 0, skew: 0.12 };
    case 'up':
      return { x: 0, y: -14, skew: 0 };
    case 'down':
      return { x: 0, y: 14, skew: 0 };
    default:
      return { x: 0, y: 0, skew: 0 };
  }
}

export function FaceFrame3D({
  pose,
  size = 300,
  accent = '#5EEAD4',
  progress = 0,
}: Props) {
  const pulse = useSharedValue(1);
  const { x, y, skew } = poseOffset(pose);
  const cx = size / 2 + x;
  const cy = size / 2 + y;
  const rx = size * 0.28;
  const ry = size * 0.36;

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.04, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  const ovalProps = useAnimatedProps(() => ({
    rx: rx * pulse.value,
    ry: ry * pulse.value,
  }));

  // Simple wireframe landmarks
  const eyeY = cy - ry * 0.15;
  const eyeLX = cx - rx * 0.35 + skew * 40;
  const eyeRX = cx + rx * 0.35 + skew * 40;
  const noseY = cy + ry * 0.05;
  const mouthY = cy + ry * 0.35;
  const jawY = cy + ry * 0.78;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Outer guide ring */}
        <Ellipse
          cx={size / 2}
          cy={size / 2}
          rx={size * 0.42}
          ry={size * 0.48}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1.5}
          strokeDasharray="6 8"
          fill="none"
        />
        {/* Face oval */}
        <AnimatedEllipse
          cx={cx}
          cy={cy}
          animatedProps={ovalProps}
          stroke={accent}
          strokeWidth={2.5}
          fill="rgba(94,234,212,0.06)"
        />
        {/* Eyes */}
        <Ellipse cx={eyeLX} cy={eyeY} rx={14} ry={8} stroke={accent} strokeWidth={1.5} fill="none" />
        <Ellipse cx={eyeRX} cy={eyeY} rx={14} ry={8} stroke={accent} strokeWidth={1.5} fill="none" />
        {/* Nose */}
        <Path
          d={`M ${cx} ${cy - ry * 0.05} L ${cx + skew * 30} ${noseY + 18} L ${cx - 10} ${noseY + 18}`}
          stroke={accent}
          strokeWidth={1.5}
          fill="none"
          opacity={0.85}
        />
        {/* Mouth */}
        <Path
          d={`M ${cx - 22} ${mouthY} Q ${cx} ${mouthY + 8} ${cx + 22} ${mouthY}`}
          stroke={accent}
          strokeWidth={1.5}
          fill="none"
        />
        {/* Jawline */}
        <Path
          d={`M ${cx - rx * 0.85} ${cy + ry * 0.2} Q ${cx - rx * 0.5} ${jawY} ${cx} ${jawY + 4} Q ${cx + rx * 0.5} ${jawY} ${cx + rx * 0.85} ${cy + ry * 0.2}`}
          stroke={accent}
          strokeWidth={1.5}
          fill="none"
          opacity={0.7}
        />
        {/* Midline */}
        <Line
          x1={cx}
          y1={cy - ry}
          x2={cx + skew * 50}
          y2={cy + ry}
          stroke={accent}
          strokeWidth={1}
          strokeDasharray="4 6"
          opacity={0.45}
        />
        {/* Progress arc hint */}
        <Ellipse
          cx={size / 2}
          cy={size / 2}
          rx={size * 0.46}
          ry={size * 0.52}
          stroke={accent}
          strokeWidth={3}
          fill="none"
          strokeDasharray={`${(progress / 100) * 290} 290`}
          opacity={0.9}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
