import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { FaceFrame3D } from '@/components/FaceFrame3D';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useTheme } from '@/context/ThemeContext';
import { useAnalysis } from '@/context/AnalysisContext';
import { Layout, Radii, Spacing, Typography } from '@/constants/theme';
import { SCAN_STEPS, type ScanCapture, type ScanPose } from '@/types/analysis';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const COACHING = [
  'Bitte langsam bewegen.',
  'Beleuchtung prüfen – weiches Frontallicht.',
  'Gesicht vollständig im Rahmen halten.',
  'Etwas näher an die Kamera.',
  'Schärfe: still halten für die Aufnahme.',
];

export default function LiveScanScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { runAnalysis } = useAnalysis();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [coach, setCoach] = useState('Gesicht im 3D-Rahmen ausrichten');
  const [qualityOk, setQualityOk] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const capturesRef = useRef<ScanCapture[]>([]);
  const holdRef = useRef(0);
  const [qualityTick, setQualityTick] = useState(0);

  const step = SCAN_STEPS[stepIndex];
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    ringProgress.value = withTiming(progress / 100, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, ringProgress]);

  const animatedRing = useAnimatedProps(() => {
    const c = 2 * Math.PI * 54;
    return { strokeDashoffset: c * (1 - ringProgress.value) };
  });

  // Simulated quality / pose lock loop (production: Face Landmarker)
  useEffect(() => {
    if (!permission?.granted || finishing) return;
    holdRef.current = 0;
    setQualityOk(false);
    setQualityTick(0);
    setCoach(step.instruction);

    const id = setInterval(() => {
      holdRef.current += 1;
      const n = holdRef.current;
      setQualityTick(n);

      if (n === 2) setCoach('Beleuchtung OK · Schärfe prüfen…');
      if (n === 3) {
        const tips = [
          step.hint,
          COACHING[n % COACHING.length],
          'Kopfposition erkannt…',
        ];
        setCoach(tips[Math.floor(Math.random() * tips.length)]);
      }
      if (n === 4) {
        setQualityOk(true);
        setCoach('Halten… Aufnahme');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (n >= 5 && !capturing) {
        void captureStep();
      }
    }, 700);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, permission?.granted, finishing]);

  const captureStep = useCallback(async () => {
    if (capturing || finishing) return;
    setCapturing(true);
    try {
      let uri = `demo://360/${step.pose}/${Date.now()}`;
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.7,
            skipProcessing: Platform.OS === 'android',
          });
          if (photo?.uri) uri = photo.uri;
        } catch {
          // Web / simulator fallback
        }
      }

      capturesRef.current = [
        ...capturesRef.current.filter((c) => c.pose !== step.pose),
        { pose: step.pose, uri, capturedAt: new Date().toISOString() },
      ];

      setProgress(step.targetProgress);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (stepIndex >= SCAN_STEPS.length - 1) {
        setFinishing(true);
        setCoach('Scan abgeschlossen · Analyse…');
        setProgress(100);
        const captures = capturesRef.current;
        const primary =
          captures.find((c) => c.pose === 'center_final')?.uri ||
          captures.find((c) => c.pose === 'center')?.uri ||
          uri;
        const result = await runAnalysis(primary, { scanType: '360', captures });
        if (result) router.replace(`/results/${result.id}`);
        else router.replace('/(tabs)/scan');
      } else {
        setStepIndex((i) => i + 1);
      }
    } finally {
      setCapturing(false);
    }
  }, [capturing, finishing, step, stepIndex, runAnalysis, router]);

  const ringSize = 128;
  const stroke = 8;
  const r = (ringSize - stroke) / 2;
  const c = 2 * Math.PI * r;

  if (!permission) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <Text style={{ color: colors.text, textAlign: 'center' }}>Kamera wird vorbereitet…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.fill,
          {
            backgroundColor: colors.background,
            justifyContent: 'center',
            padding: Layout.screenPadding,
            paddingTop: insets.top + Spacing.lg,
          },
        ]}
      >
        <Text style={[Typography.title1, { color: colors.text }]}>Kamerazugriff</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginVertical: Spacing.md }]}>
          Für den 360°-Face-Scan wird die Frontkamera benötigt.
        </Text>
        <PrimaryButton title="Zugriff erlauben" onPress={requestPermission} />
        <PrimaryButton
          title="Abbrechen"
          variant="ghost"
          onPress={() => router.back()}
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: '#000' }]}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
        mirror={false}
      />

      {/* Dark vignette */}
      <View style={styles.vignette} pointerEvents="none" />

      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing.md },
        ]}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.close, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          <Text style={[Typography.overline, { color: colors.accent }]}>360° FACE SCAN</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.frameArea}>
          <FaceFrame3D
            pose={step.pose}
            size={Math.min(340, Layout.maxContentWidth - 40)}
            accent={qualityOk ? colors.success : colors.accent}
            progress={progress}
          />
        </View>

        <View style={styles.bottom}>
          <View style={styles.progressRow}>
            <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={ringSize} height={ringSize} style={StyleSheet.absoluteFill}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={r}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={stroke}
                  fill="none"
                />
                <AnimatedCircle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={r}
                  stroke={colors.accent}
                  strokeWidth={stroke}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${c} ${c}`}
                  animatedProps={animatedRing}
                  rotation="-90"
                  origin={`${ringSize / 2}, ${ringSize / 2}`}
                />
              </Svg>
              <Text style={[Typography.title2, { color: '#fff' }]}>{Math.round(progress)}%</Text>
              <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.6)' }]}>
                {finishing ? 'ANALYSE' : 'SCANNING'}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[Typography.title3, { color: '#fff' }]}>{step.title}</Text>
              <Text style={[Typography.body, { color: 'rgba(255,255,255,0.85)', marginTop: 4 }]}>
                {coach}
              </Text>
              <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.5)', marginTop: 8 }]}>
                Schritt {stepIndex + 1}/{SCAN_STEPS.length}
              </Text>
            </View>
          </View>

          <View style={styles.checks}>
            {['Licht', 'Schärfe', 'Position', 'Abstand'].map((label, i) => (
              <View
                key={label}
                style={[
                  styles.checkPill,
                  {
                    backgroundColor:
                      qualityTick > i + 1 || qualityOk
                        ? 'rgba(52,211,153,0.25)'
                        : 'rgba(255,255,255,0.1)',
                  },
                ]}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottom: {
    backgroundColor: 'rgba(7,8,10,0.72)',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  checks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.md,
  },
  checkPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },
});
