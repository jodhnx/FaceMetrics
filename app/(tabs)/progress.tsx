import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/GlassCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { DeltaBadge, DisclaimerBanner, TrendSparkline } from '@/components/ui';
import { compareScans } from '@/services/analysisEngine';
import { addWeight, getWeightLog } from '@/services/storage';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import type { WeightEntry } from '@/types/analysis';
import { DISCLAIMERS, Layout, Radii, Spacing, Typography } from '@/constants/theme';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProgressScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history, refreshHistory, setCurrent } = useAnalysis();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [kg, setKg] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshHistory();
      getWeightLog().then(setWeights);
    }, [refreshHistory])
  );

  const trend = history
    .slice(0, 12)
    .map((h) => h.overallScore)
    .reverse();
  const latest = history[0];
  const previous = history[1];
  const delta = latest ? compareScans(latest, previous) : null;

  const saveWeight = async () => {
    const n = parseFloat(kg.replace(',', '.'));
    if (!n || n < 30 || n > 250) {
      Alert.alert('Ungültig', 'Bitte ein realistisches Gewicht in kg eingeben.');
      return;
    }
    setWeights(await addWeight(n));
    setKg('');
  };

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: 140,
          paddingHorizontal: Layout.screenPadding,
        }}
      >
        <Text style={[Typography.overline, { color: colors.accent }]}>TIMELINE</Text>
        <Text style={[Typography.title1, { color: colors.text }]}>Fortschritt</Text>

        {history.length === 0 ? (
          <GlassCard style={{ marginTop: Spacing.lg }}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Noch keine Scans. Starte deine erste Analyse.
            </Text>
            <PrimaryButton
              title="Zum Scan"
              onPress={() => router.push('/(tabs)/scan')}
              style={{ marginTop: Spacing.md }}
            />
          </GlassCard>
        ) : (
          <>
            {delta ? (
              <View style={{ marginTop: Spacing.md }}>
                <DeltaBadge value={delta.overall} />
              </View>
            ) : null}

            {trend.length > 1 ? (
              <GlassCard style={{ marginTop: Spacing.md }}>
                <Text style={[Typography.title3, { color: colors.text }]}>Score-Verlauf</Text>
                <View style={{ marginTop: Spacing.md }}>
                  <TrendSparkline values={trend} width={300} height={56} />
                </View>
              </GlassCard>
            ) : null}

            {latest && previous ? (
              <GlassCard style={{ marginTop: Spacing.md }}>
                <Text style={[Typography.title3, { color: colors.text }]}>Vorher / Nachher</Text>
                <View style={styles.compare}>
                  <View style={styles.compareCol}>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>Vorher</Text>
                    <Text style={[Typography.title1, { color: colors.text }]}>
                      {previous.overallScore}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={colors.accent} />
                  <View style={styles.compareCol}>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>Jetzt</Text>
                    <Text style={[Typography.title1, { color: colors.accent }]}>
                      {latest.overallScore}
                    </Text>
                  </View>
                </View>
                <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                  Symmetrie {(delta?.symmetry ?? 0) >= 0 ? '+' : ''}
                  {delta?.symmetry} · Proportionen {(delta?.proportions ?? 0) >= 0 ? '+' : ''}
                  {delta?.proportions}
                </Text>
              </GlassCard>
            ) : null}

            <Text
              style={[
                Typography.title3,
                { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm },
              ]}
            >
              Verlauf
            </Text>
            {history.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  setCurrent(item);
                  router.push(`/results/${item.id}`);
                }}
                style={{ marginBottom: Spacing.sm }}
              >
                <GlassCard>
                  <View style={styles.row}>
                    {item.imageUri && !item.imageUri.startsWith('demo://') ? (
                      <Image source={{ uri: item.imageUri }} style={styles.thumb} />
                    ) : (
                      <View
                        style={[
                          styles.thumb,
                          {
                            backgroundColor: colors.accentDim,
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        ]}
                      >
                        <Ionicons name="person" size={18} color={colors.accent} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[Typography.callout, { color: colors.text, fontWeight: '700' }]}>
                        Score {item.overallScore}
                      </Text>
                      <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </>
        )}

        <GlassCard style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Gewicht (optional)</Text>
          <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: 6 }]}>
            Nur zur persönlichen Korrelation – keine Diätversprechen.
          </Text>
          <View style={styles.weightRow}>
            <TextInput
              value={kg}
              onChangeText={setKg}
              keyboardType="decimal-pad"
              placeholder="kg"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElevated },
              ]}
            />
            <PrimaryButton title="Speichern" onPress={saveWeight} style={{ flex: 1 }} />
          </View>
          {weights.slice(0, 3).map((w) => (
            <Text
              key={w.date}
              style={[Typography.caption, { color: colors.textSecondary, marginTop: 6 }]}
            >
              {formatDate(w.date)} · {w.kg} kg
            </Text>
          ))}
        </GlassCard>

        <View style={{ marginTop: Spacing.md }}>
          <DisclaimerBanner text={DISCLAIMERS.general} />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  compare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
  },
  compareCol: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  thumb: { width: 56, height: 56, borderRadius: Radii.sm },
  weightRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, alignItems: 'center' },
  input: {
    width: 88,
    height: 56,
    borderRadius: Radii.full,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
});
