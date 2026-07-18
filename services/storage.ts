import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalysisResult, AppSettings, WeightEntry } from '@/types/analysis';

const HISTORY_KEY = '@facemetrics/history_v2';
const SETTINGS_KEY = '@facemetrics/settings_v2';
const ONBOARDING_KEY = '@facemetrics/onboarding_v2';
const WEIGHT_KEY = '@facemetrics/weight';

const defaultSettings: AppSettings = {
  theme: 'dark',
  autoDeletePhotos: false,
  saveHistory: true,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function getHistory(): Promise<AnalysisResult[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalysisResult[];
  } catch {
    return [];
  }
}

export async function saveAnalysis(result: AnalysisResult, settings?: AppSettings): Promise<void> {
  const cfg = settings ?? (await getSettings());
  if (!cfg.saveHistory) return;
  const history = await getHistory();
  const toStore: AnalysisResult = {
    ...result,
    imageUri: cfg.autoDeletePhotos ? '' : result.imageUri,
  };
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([toStore, ...history].slice(0, 60)));
}

export async function getAnalysisById(id: string): Promise<AnalysisResult | null> {
  const history = await getHistory();
  return history.find((h) => h.id === id) ?? null;
}

export async function deleteAnalysis(id: string): Promise<void> {
  const history = await getHistory();
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history.filter((h) => h.id !== id)));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

export async function isOnboardingDone(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === '1';
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, '1');
}

export async function getWeightLog(): Promise<WeightEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(WEIGHT_KEY);
    return raw ? (JSON.parse(raw) as WeightEntry[]) : [];
  } catch {
    return [];
  }
}

export async function addWeight(kg: number): Promise<WeightEntry[]> {
  const log = await getWeightLog();
  const next = [{ date: new Date().toISOString(), kg }, ...log].slice(0, 100);
  await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(next));
  return next;
}
