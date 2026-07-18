import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Layout, Spacing, Typography } from '@/constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack, right }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={16}
            style={[styles.backBtn, { backgroundColor: colors.surfaceSolid, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[Typography.title2, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
        <View style={{ width: 44, alignItems: 'flex-end' }}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
