import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/GlassCard';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useTheme } from '@/context/ThemeContext';
import { clearHistory } from '@/services/storage';
import { useAnalysis } from '@/context/AnalysisContext';
import { DISCLAIMERS, Radii, Spacing, Typography } from '@/constants/theme';
import type { AppSettings } from '@/types/analysis';

export default function SettingsScreen() {
  const { colors, settings, updateSettings, isDark } = useTheme();
  const { refreshHistory } = useAnalysis();
  const insets = useSafeAreaInsets();

  const setTheme = (theme: AppSettings['theme']) => updateSettings({ theme });

  const confirmClear = () => {
    Alert.alert('Verlauf löschen', 'Alle gespeicherten Scans werden entfernt.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          await refreshHistory();
        },
      },
    ]);
  };

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: 120,
          paddingHorizontal: Spacing.md,
        }}
      >
        <Text style={[Typography.caption, { color: colors.accent, letterSpacing: 1.2 }]}>APP</Text>
        <Text style={[Typography.title1, { color: colors.text }]}>Einstellungen</Text>

        <GlassCard style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Erscheinungsbild
          </Text>
          <View style={styles.themeRow}>
            {(['system', 'light', 'dark'] as const).map((t) => {
              const active =
                settings.theme === t ||
                (t === 'system' && settings.theme === 'system');
              const label = t === 'system' ? 'System' : t === 'light' ? 'Hell' : 'Dunkel';
              return (
                <Pressable
                  key={t}
                  onPress={() => setTheme(t)}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor: settings.theme === t ? colors.accent : colors.accentSoft,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Typography.caption,
                      { color: settings.theme === t ? '#fff' : colors.text, fontWeight: '600' },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            Aktuell: {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </GlassCard>

        <GlassCard style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.md }]}>
            Datenschutz
          </Text>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.callout, { color: colors.text }]}>Verlauf speichern</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                Scans lokal auf diesem Gerät
              </Text>
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
                Bilddaten werden nicht im Verlauf behalten
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
          <Pressable onPress={confirmClear}>
            <Text style={[Typography.callout, { color: colors.danger, fontWeight: '600' }]}>
              Verlauf löschen
            </Text>
          </Pressable>
        </GlassCard>

        <View style={{ marginTop: Spacing.lg }}>
          <DisclaimerBanner text={DISCLAIMERS.general} />
        </View>

        <Text style={[Typography.caption, { color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.xl }]}>
          FaceMetrics AI · v1.0.0{'\n'}DSGVO-orientierte lokale Speicherung
        </Text>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  themeRow: { flexDirection: 'row', gap: Spacing.sm },
  themeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radii.full,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
