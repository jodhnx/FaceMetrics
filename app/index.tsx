import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isOnboardingDone } from '@/services/storage';
import { useTheme } from '@/context/ThemeContext';

export default function Index() {
  const { colors } = useTheme();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    isOnboardingDone().then((v) => {
      setDone(v);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return <Redirect href={done ? '/(tabs)' : '/onboarding'} />;
}
