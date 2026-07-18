import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/GlassCard';
import { TrendSparkline } from '@/components/Charts';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history, refreshHistory, setCurrent } = useAnalysis();

  useFocusEffect(
    useCallback(() => {
      refreshHistory();
    }, [refreshHistory])
  );

  const trend = history
    .slice(0, 10)
    .map((h) => h.overallScore)
    .reverse();

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: 120,
          paddingHorizontal: Spacing.md,
        }}
      >
        <Text style={[Typography.caption, { color: colors.accent, letterSpacing: 1.2 }]}>TIMELINE</Text>
        <Text style={[Typography.title1, { color: colors.text }]}>Verlauf</Text>

        {history.length === 0 ? (
          <GlassCard style={{ marginTop: Spacing.lg }}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Noch keine Scans gespeichert. Starte deine erste Analyse.
            </Text>
          </GlassCard>
        ) : (
          <>
            {trend.length > 1 ? (
              <GlassCard style={{ marginTop: Spacing.lg }}>
                <Text style={[Typography.title3, { color: colors.text }]}>Score-Verlauf</Text>
                <View style={{ marginTop: Spacing.sm }}>
                  <TrendSparkline values={trend} width={300} height={48} />
                </View>
              </GlassCard>
            ) : null}

            <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
              {history.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setCurrent(item);
                    router.push(`/results/${item.id}`);
                  }}
                >
                  <GlassCard>
                    <View style={styles.row}>
                      {item.imageUri ? (
                        <Image source={{ uri: item.imageUri }} style={styles.thumb} />
                      ) : (
                        <View style={[styles.thumb, { backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }]}>
                          <Ionicons name="person" size={20} color={colors.accent} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[Typography.callout, { color: colors.text, fontWeight: '600' }]}>
                          Score {item.overallScore}
                        </Text>
                        <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                          {formatDate(item.createdAt)}
                        </Text>
                        <Text style={[Typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>
                          Symmetrie {item.symmetryScore} · Proportionen {item.proportionsScore}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                    </View>
                  </GlassCard>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radii.sm,
  },
});
