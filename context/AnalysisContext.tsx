import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AnalysisResult, ScanCapture } from '@/types/analysis';
import { analyzeFace, checkImageQuality } from '@/services/analysisEngine';
import { getHistory, saveAnalysis } from '@/services/storage';
import { useTheme } from '@/context/ThemeContext';

interface RunOptions {
  scanType?: 'photo' | '360';
  captures?: ScanCapture[];
}

interface AnalysisContextValue {
  current: AnalysisResult | null;
  history: AnalysisResult[];
  isAnalyzing: boolean;
  error: string | null;
  setCurrent: (r: AnalysisResult | null) => void;
  refreshHistory: () => Promise<void>;
  runAnalysis: (imageUri: string, options?: RunOptions) => Promise<AnalysisResult | null>;
  clearError: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useTheme();
  const [current, setCurrent] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    setHistory(await getHistory());
  }, []);

  const runAnalysis = useCallback(
    async (imageUri: string, options?: RunOptions) => {
      setError(null);
      const quality = checkImageQuality(imageUri);
      if (!quality.passed) {
        setError(quality.message ?? 'Bitte neuen Scan starten.');
        return null;
      }
      setIsAnalyzing(true);
      try {
        const result = await analyzeFace(imageUri, options);
        const stored = settings.autoDeletePhotos
          ? { ...result, imageUri: '', captures: undefined }
          : result;
        await saveAnalysis(stored, settings);
        setCurrent(stored);
        await refreshHistory();
        return stored;
      } catch {
        setError('Analyse fehlgeschlagen. Bitte erneut versuchen.');
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [refreshHistory, settings]
  );

  const value = useMemo(
    () => ({
      current,
      history,
      isAnalyzing,
      error,
      setCurrent,
      refreshHistory,
      runAnalysis,
      clearError: () => setError(null),
    }),
    [current, history, isAnalyzing, error, refreshHistory, runAnalysis]
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider');
  return ctx;
}
