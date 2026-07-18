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
import { useAnalysis } from '@/context/AnalysisContext';
import { useTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';

const QUALITY_TIPS = [
  'Gesicht vollständig sichtbar',
  'Kopf gerade, Blick frontal',
  'Gute, gleichmäßige Beleuchtung',
  'Keine Sonnenbrille',
  'Möglichst neutraler Gesichtsausdruck',
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
      Alert.alert('Berechtigung nötig', 'Bitte erlaube den Zugriff in den Systemeinstellungen.');
      return;
    }

    const result =
      from === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.9,
            allowsEditing: true,
            aspect: [3, 4],
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.9,
            allowsEditing: true,
            aspect: [3, 4],
          });

    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri);
    }
  };

  const startAnalysis = () => {
    if (!preview) return;
    router.push({ pathname: '/analyzing', params: { uri: preview } });
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
        <Text style={[Typography.caption, { color: colors.accent, letterSpacing: 1.2 }]}>SCAN</Text>
        <Text style={[Typography.title1, { color: colors.text }]}>Foto hochladen</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Frontales Foto, gerader Blick, neutrales Gesicht, gute Beleuchtung.
        </Text>

        <Animated.View entering={FadeIn} style={{ marginTop: Spacing.lg }}>
          {preview ? (
            <Image source={{ uri: preview }} style={[styles.preview, { borderColor: colors.border }]} />
          ) : (
            <View style={[styles.placeholder, { borderColor: colors.border, backgroundColor: colors.surfaceSolid }]}>
              <Ionicons name="scan" size={48} color={colors.accent} />
              <Text style={[Typography.callout, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                Noch kein Foto ausgewählt
              </Text>
            </View>
          )}
        </Animated.View>

        {error ? (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
              <Ionicons name="alert-circle" size={22} color={colors.danger} />
              <Text style={[Typography.callout, { color: colors.danger, flex: 1 }]}>{error}</Text>
            </View>
            <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              Prüfe Beleuchtung, Blickrichtung und ob das ganze Gesicht sichtbar ist.
            </Text>
          </GlassCard>
        ) : null}

        <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
          <PrimaryButton title="Kamera öffnen" onPress={() => pick('camera')} />
          <PrimaryButton title="Aus Galerie wählen" variant="secondary" onPress={() => pick('library')} />
          {preview ? (
            <PrimaryButton title="Analyse starten" onPress={startAnalysis} />
          ) : null}
        </View>

        <GlassCard style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.sm }]}>
            Qualitätsprüfung
          </Text>
          {QUALITY_TIPS.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Ionicons name="checkmark" size={16} color={colors.success} />
              <Text style={[Typography.callout, { color: colors.text }]}>{tip}</Text>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    height: 360,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  placeholder: {
    height: 280,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
});
