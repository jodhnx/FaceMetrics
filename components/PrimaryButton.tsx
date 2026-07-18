import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { Layout, Radii, Spacing, Typography } from '@/constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: Props) {
  const { colors } = useTheme();

  const bg =
    variant === 'primary'
      ? colors.accent
      : variant === 'secondary'
        ? colors.accentDim
        : variant === 'danger'
          ? colors.dangerDim
          : 'transparent';

  const fg =
    variant === 'primary'
      ? colors.accentText
      : variant === 'danger'
        ? colors.danger
        : colors.accent;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          opacity: pressed || disabled ? 0.7 : 1,
          borderColor: variant === 'ghost' ? colors.borderStrong : 'transparent',
          borderWidth: variant === 'ghost' ? 1 : 0,
          minHeight: Layout.buttonHeight,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[Typography.callout, { color: fg, fontWeight: '700', fontSize: 16 }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
