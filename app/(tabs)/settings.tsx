import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/GlassCard';
import { DisclaimerBanner } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { useAnalysis } from '@/context/AnalysisContext';
import { clearHistory } from '@/services/storage';
import type { AppSettings } from '@/types/analysis';
import { DISCLAIMERS, Layout, Radii, Spacing, Typography } from '@/constants/theme';

export default function SettingsScreen() {
  const { colors, settings, updateSettings, isDark } = useTheme();
  const { refreshHistory } = useAnalysis();
  const insets = useSafeAreaInsets();

  const setTheme = (theme: AppSettings['theme']) => updateSettings({ theme });

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: 140,
          paddingHorizontal: Layout.screenPadding,
        }}
      >
        <Text style={[Typography.overline, { color: colors.accent }]}>APP</Text>
        <Text style={[Typography.title1, { color: colors.text }]}>Mehr</Text>

        <GlassCard style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Erscheinungsbild
          </Text>
          <View style={styles.themeRow}>
            {(['dark', 'light', 'system'] as const).map((t) => {
              const label = t === 'dark' ? 'Dunkel' : t === 'light' ? 'Hell' : 'System';
              const active = settings.theme === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTheme(t)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.accent : colors.accentDim,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Typography.caption,
                      { color: active ? colors.accentText : colors.text, fontWeight: '700' },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            Standard: Dark Mode · aktuell {isDark ? 'dunkel' : 'hell'}
          </Text>
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.md }]}>
            Datenschutz
          </Text>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.callout, { color: colors.text }]}>Verlauf speichern</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>Lokal auf dem Gerät</Text>
            </View>
            <Switch
              value={settings.saveHistory}
              onValueChange={(v) => updateSettings({ saveHistory: v })}
              trackColor={{ true: colors.accent }}
            />
          </View>
          <View style={[styles.switchRow, { marginTop: Spacing.md }]}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.callout, { color: colors.text }]}>Fotos nach Analyse löschen</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                Bild nicht im Verlauf behalten
              </Text>
            </View>
            <Switch
              value={settings.autoDeletePhotos}
              onValueChange={(v) => updateSettings({ autoDeletePhotos: v })}
              trackColor={{ true: colors.accent }}
            />
          </View>
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Pressable
            onPress={() =>
              Alert.alert('Verlauf löschen?', 'Alle Scans werden entfernt.', [
                { text: 'Abbrechen', style: 'cancel' },
                {
                  text: 'Löschen',
                  style: 'destructive',
                  onPress: async () => {
                    await clearHistory();
                    await refreshHistory();
                  },
                },
              ])
            }
          >
            <Text style={[Typography.callout, { color: colors.danger, fontWeight: '700' }]}>
              Verlauf löschen
            </Text>
          </Pressable>
        </GlassCard>

        <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
          <DisclaimerBanner text={DISCLAIMERS.analysis} />
          <DisclaimerBanner text={DISCLAIMERS.beauty} tone="warning" />
          <DisclaimerBanner text={DISCLAIMERS.medical} tone="warning" />
        </View>

        <Text
          style={[
            Typography.caption,
            { color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.xl },
          ]}
        >
          FaceMetrics AI · v2.0{'\n'}Mobile First · On-Device-orientiert
        </Text>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  themeRow: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radii.full,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
});
