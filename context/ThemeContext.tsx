import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { getSettings, saveSettings } from '@/services/storage';
import type { AppSettings } from '@/types/analysis';

type ThemeColors = typeof Colors.dark;

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
    theme: 'dark',
    autoDeletePhotos: false,
    saveHistory: true,
  });

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // Default dark: only light when explicitly light
  const resolvedDark =
    settings.theme === 'light' ? false : settings.theme === 'system' ? system !== 'light' : true;

  const value = useMemo(
    () => ({
      isDark: resolvedDark,
      colors: resolvedDark ? Colors.dark : Colors.light,
      settings,
      updateSettings: async (patch: Partial<AppSettings>) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        await saveSettings(next);
      },
    }),
    [resolvedDark, settings]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
