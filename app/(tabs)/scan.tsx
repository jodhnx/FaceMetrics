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
        <Text style={[Typography.overline, { color: colors.accent }]}>SCAN v3</Text>
        <Text style={[Typography.title1, { color: colors.text }]}>Face Scan</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Für die genaueste Auswertung: 360°-Scan mit Frontkamera.
        </Text>

        <GlassCard style={{ marginTop: Spacing.lg }}>
          <View style={styles.heroRow}>
            <View style={[styles.iconBubble, { backgroundColor: colors.accentDim }]}>
              <Ionicons name="scan-circle" size={36} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.title3, { color: colors.text }]}>360° Face Scan</Text>
              <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: 4 }]}>
                Geführte Kopfbewegung · 3D-Rahmen · Profil & Jawline
              </Text>
            </View>
          </View>
          <PrimaryButton
            title="360° Scan starten"
            onPress={() => router.push('/live-scan' as any)}
            style={{ marginTop: Spacing.md }}
          />
        </GlassCard>

        <Text
          style={[
            Typography.caption,
            { color: colors.textTertiary, marginTop: Spacing.lg, marginBottom: Spacing.sm },
          ]}
        >
          ODER EINZELNES FOTO
        </Text>

        <Animated.View entering={FadeIn}>
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
              <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
              <Text style={[Typography.callout, { color: colors.textSecondary, marginTop: 8 }]}>
                Frontales Foto
              </Text>
            </View>
          )}
        </Animated.View>

        {error ? (
          <GlassCard style={{ marginTop: Spacing.md }}>
            <Text style={[Typography.callout, { color: colors.danger, fontWeight: '700' }]}>
              {error}
            </Text>
          </GlassCard>
        ) : null}

        <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
          <PrimaryButton title="Kamera (Foto)" variant="secondary" onPress={() => pick('camera')} />
          <PrimaryButton title="Aus Galerie" variant="ghost" onPress={() => pick('library')} />
          {preview ? (
            <PrimaryButton
              title="Foto analysieren"
              onPress={() => router.push({ pathname: '/analyzing', params: { uri: preview } })}
            />
          ) : null}
        </View>

        <View style={{ marginTop: Spacing.lg }}>
          <DisclaimerBanner text={DISCLAIMERS.analysis} />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: '100%',
    height: 260,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  placeholder: {
    height: 160,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
