import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/GlassCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { DisclaimerBanner } from '@/components/ui';
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { DISCLAIMERS, Layout, Radii, Spacing, Typography } from '@/constants/theme';

const CHECKS = [
  { icon: 'person' as const, label: 'Gesicht vollständig sichtbar' },
  { icon: 'phone-portrait' as const, label: 'Kopf gerade & frontal' },
  { icon: 'sunny' as const, label: 'Gute, gleichmäßige Beleuchtung' },
  { icon: 'eye-off' as const, label: 'Keine Sonnenbrille' },
  { icon: 'happy' as const, label: 'Neutraler Gesichtsausdruck' },
];

export default function ScanScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { error, clearError } = useAnalysis();
  const [preview, setPreview] = useState<string | null>(null);

  const pick = async (from: 'camera' | 'library') => {
    clearError();
    const permission =
      from === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Berechtigung nötig', 'Bitte Zugriff in den Systemeinstellungen erlauben.');
      return;
    }

    const result =
      from === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.92,
            allowsEditing: true,
            aspect: [3, 4],
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.92,
            allowsEditing: true,
            aspect: [3, 4],
          });

    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri);
    }
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
        <Text style={[Typography.overline, { color: colors.accent }]}>SCAN</Text>
        <Text style={[Typography.title1, { color: colors.text }]}>Qualitätscheck</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Vor der Analyse prüfen wir Frontalität, Haltung und Licht.
        </Text>

        <Animated.View entering={FadeIn} style={{ marginTop: Spacing.lg }}>
          {preview ? (
            <Image
              source={{ uri: preview }}
              style={[styles.preview, { borderColor: colors.border }]}
            />
          ) : (
            <View
              style={[
                styles.placeholder,
                { borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid },
              ]}
            >
              <View style={[styles.guide, { borderColor: colors.accent }]} />
              <Ionicons name="scan" size={40} color={colors.accent} />
              <Text style={[Typography.callout, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                Gesicht in den Rahmen
              </Text>
            </View>
          )}
        </Animated.View>

        {error ? (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
              <Ionicons name="alert-circle" size={24} color={colors.danger} />
              <Text style={[Typography.callout, { color: colors.danger, flex: 1, fontWeight: '700' }]}>
                {error}
              </Text>
            </View>
            <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              Bitte neues Bild aufnehmen.
            </Text>
          </GlassCard>
        ) : null}

        <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
          <PrimaryButton title="Kamera öffnen" onPress={() => pick('camera')} />
          <PrimaryButton title="Aus Galerie" variant="secondary" onPress={() => pick('library')} />
          {preview ? (
            <PrimaryButton
              title="Analyse starten"
              onPress={() => router.push({ pathname: '/analyzing', params: { uri: preview } })}
            />
          ) : (
            <PrimaryButton
              title="Demo ohne Foto"
              variant="ghost"
              onPress={() =>
                router.push({
                  pathname: '/analyzing',
                  params: { uri: `demo://sample/${Date.now()}` },
                })
              }
            />
          )}
        </View>

        <GlassCard style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Checkliste
          </Text>
          {CHECKS.map((c) => (
            <View key={c.label} style={styles.checkRow}>
              <View style={[styles.checkIcon, { backgroundColor: colors.accentDim }]}>
                <Ionicons name={c.icon} size={16} color={colors.accent} />
              </View>
              <Text style={[Typography.callout, { color: colors.text }]}>{c.label}</Text>
            </View>
          ))}
        </GlassCard>

        <View style={{ marginTop: Spacing.md }}>
          <DisclaimerBanner text={DISCLAIMERS.analysis} />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    height: 380,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  placeholder: {
    height: 340,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  guide: {
    position: 'absolute',
    width: '62%',
    height: '72%',
    borderRadius: 999,
    borderWidth: 1.5,
    opacity: 0.35,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 10,
  },
  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
