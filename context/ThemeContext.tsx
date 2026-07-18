import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { getSettings, saveSettings } from '@/services/storage';
import type { AppSettings } from '@/types/analysis';

type ThemeColors = typeof Colors.light;

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    autoDeletePhotos: false,
    saveHistory: true,
    language: 'de',
  });

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const isDark =
    settings.theme === 'dark' || (settings.theme === 'system' && system === 'dark');

  const value = useMemo(
    () => ({
      isDark,
      colors: isDark ? Colors.dark : Colors.light,
      settings,
      updateSettings: async (patch: Partial<AppSettings>) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        await saveSettings(next);
      },
    }),
    [isDark, settings]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
