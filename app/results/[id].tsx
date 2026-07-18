import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppBackground } from '@/components/AppBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { GlassCard } from '@/components/GlassCard';
import { ScoreRing } from '@/components/ScoreRing';
import { RadarChart } from '@/components/RadarChart';
import { SymmetryHeatmap } from '@/components/SymmetryHeatmap';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  CoachBubble,
  DisclaimerBanner,
  MetricBar,
} from '@/components/ui';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { deleteAnalysis, getAnalysisById, updateAnalysis } from '@/services/storage';
import { exportScanPdf } from '@/services/exportPdf';
import type { AnalysisResult } from '@/types/analysis';
import { DISCLAIMERS, Layout, Radii, Spacing, Typography } from '@/constants/theme';

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { current, setCurrent, refreshHistory } = useAnalysis();
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(current?.id === id ? current : null);
  const [editingNote, setEditingNote] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    (async () => {
      if (current?.id === id) {
        setData(current);
        setNote(current.note ?? '');
        return;
      }
      const found = await getAnalysisById(id);
      if (found) {
        setData(found);
        setCurrent(found);
        setNote(found.note ?? '');
      }
    })();
  }, [id, current, setCurrent]);

  if (!data) {
    return (
      <AppBackground>
        <ScreenHeader title="Ergebnisse" showBack />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Scan nicht gefunden.
        </Text>
      </AppBackground>
    );
  }

  const featureCards = [
    { l: 'Symmetrie', v: data.symmetryScore, id: 'face_symmetry' },
    { l: 'Proportionen', v: data.proportionsScore, id: 'facial_thirds' },
    { l: 'Golden Ratio', v: data.goldenRatioScore, id: 'golden_ratio' },
    { l: 'Jawline', v: data.jawlineScore ?? 0, id: 'jawline' },
    { l: 'Augen', v: data.metrics.find((m) => m.id === 'eye_spacing')?.score ?? 0, id: 'eye_spacing' },
    { l: 'Nase', v: data.metrics.find((m) => m.id === 'nose_symmetry')?.score ?? 0, id: 'nose_symmetry' },
    { l: 'Lippen', v: data.metrics.find((m) => m.id === 'lip_shape')?.score ?? 0, id: 'lip_shape' },
    { l: 'Kinn', v: data.metrics.find((m) => m.id === 'chin')?.score ?? 0, id: 'chin' },
    { l: 'Kiefer', v: data.metrics.find((m) => m.id === 'jaw')?.score ?? 0, id: 'jaw' },
    { l: 'Haut', v: data.skinScore ?? 0, id: 'skin_evenness' },
    { l: 'Profil', v: data.profileScore ?? 0, id: 'side_profile' },
  ];

  const toggleFavorite = async () => {
    const updated = await updateAnalysis(data.id, { favorite: !data.favorite });
    if (updated) {
      setData(updated);
      setCurrent(updated);
      await refreshHistory();
    }
  };

  const saveNote = async () => {
    const updated = await updateAnalysis(data.id, { note });
    if (updated) {
      setData(updated);
      setCurrent(updated);
      setEditingNote(false);
      await refreshHistory();
    }
  };

  const confirmDelete = () => {
    Alert.alert('Möchtest du diesen Scan wirklich löschen?', 'Diese Aktion kann nicht rückgängig gemacht werden.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          await deleteAnalysis(data.id);
          await refreshHistory();
          setCurrent(null);
          router.replace('/(tabs)/progress');
        },
      },
    ]);
  };

  return (
    <AppBackground>
      <ScreenHeader
        title="Scan-Ergebnis"
        subtitle={data.scanType === '360' ? '360° Face Scan' : 'Foto-Analyse'}
        showBack
        right={
          <Pressable onPress={toggleFavorite} hitSlop={12}>
            <Ionicons
              name={data.favorite ? 'star' : 'star-outline'}
              size={22}
              color={data.favorite ? colors.warning : colors.textSecondary}
            />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: 60,
        }}
      >
        <View style={{ alignItems: 'center', marginVertical: Spacing.md }}>
          <ScoreRing score={data.overallScore} label="Gesamtscore" size={170} />
        </View>

        <DisclaimerBanner text={DISCLAIMERS.analysis} />
        <View style={{ marginTop: Spacing.sm }}>
          <DisclaimerBanner text={DISCLAIMERS.beauty} tone="warning" />
        </View>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Warum dieser Score?</Text>
          <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {data.scoreBreakdown}
          </Text>
        </GlassCard>

        <View style={{ marginTop: Spacing.md }}>
          <CoachBubble text={data.coachSummary} />
        </View>

        <View style={styles.grid}>
          {featureCards.map((f) => (
            <Pressable
              key={f.l}
              onPress={() => router.push(`/metric/${f.id}`)}
              style={[styles.gridCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.border }]}
            >
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>{f.l}</Text>
              <Text style={[Typography.title1, { color: colors.text, marginTop: 4 }]}>{f.v}</Text>
            </Pressable>
          ))}
        </View>

        {data.perception ? (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <Text style={[Typography.title3, { color: colors.text }]}>Wahrnehmungs-Simulation</Text>
            <Text style={[Typography.footnote, { color: colors.warning, marginTop: 6 }]}>
              {data.perception.disclaimer}
            </Text>
            {[
              data.perception.asymmetryEveryday,
              data.perception.proportionsFeel,
              data.perception.jawlineFeel,
              data.perception.expressionFeel,
              data.perception.profileFeel,
            ].map((line) => (
              <Text
                key={line}
                style={[Typography.callout, { color: colors.text, marginTop: Spacing.sm }]}
              >
                • {line}
              </Text>
            ))}
          </GlassCard>
        ) : null}

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Heatmap
          </Text>
          <SymmetryHeatmap points={data.heatmap} height={280} />
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <RadarChart data={data.radar} />
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Verbesserungspotenzial</Text>
          {data.improvements.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => router.push(`/metric/${s.metricId}`)}
              style={styles.item}
            >
              <Ionicons name="arrow-forward-circle" size={20} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.callout, { color: colors.text, fontWeight: '600' }]}>
                  {s.title}
                </Text>
                <Text style={[Typography.caption, { color: colors.textTertiary }]}>
                  Score {s.score} · Einfluss ≈ {s.impact}
                </Text>
              </View>
            </Pressable>
          ))}
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Alle Messwerte</Text>
          {data.metrics.map((m) => (
            <MetricBar
              key={m.id}
              label={m.label}
              score={m.score}
              subtitle={m.scoreReason?.slice(0, 80) + '…'}
              onPress={() => router.push(`/metric/${m.id}`)}
            />
          ))}
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text }]}>Notiz bearbeiten</Text>
          {editingNote ? (
            <>
              <TextInput
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="Notiz…"
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.noteInput,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElevated },
                ]}
              />
              <PrimaryButton title="Speichern" onPress={saveNote} style={{ marginTop: Spacing.sm }} />
            </>
          ) : (
            <>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                {data.note || 'Keine Notiz'}
              </Text>
              <PrimaryButton
                title="Bearbeiten"
                variant="secondary"
                onPress={() => setEditingNote(true)}
                style={{ marginTop: Spacing.sm }}
              />
            </>
          )}
        </GlassCard>

        <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
          <PrimaryButton title="Als PDF exportieren" variant="secondary" onPress={() => exportScanPdf(data)} />
          <PrimaryButton title="Neuen 360°-Scan" onPress={() => router.push('/live-scan' as any)} />
          <PrimaryButton title="Scan löschen" variant="danger" onPress={confirmDelete} />
        </View>

        <View style={{ marginTop: Spacing.md }}>
          <DisclaimerBanner text={DISCLAIMERS.medical} tone="warning" />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  gridCard: {
    width: '31%',
    flexGrow: 1,
    minWidth: '30%',
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  noteInput: {
    marginTop: Spacing.sm,
    minHeight: 80,
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    textAlignVertical: 'top',
  },
});
