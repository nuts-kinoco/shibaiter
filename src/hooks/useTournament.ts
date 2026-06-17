import { useState, useEffect } from 'react';

export type TournamentMode = 'count' | 'all' | 'top';

export interface TournamentSettings {
  mode: TournamentMode;
  countN: number;     // 集計方式①: 集計回数
  topGolden: number;  // 集計方式③: 金イクラ上位N回
  topScale: number;   // 集計方式③: ウロコポイント上位M回
}

const DEFAULT_SETTINGS: TournamentSettings = {
  mode: 'count',
  countN: 5,
  topGolden: 2,
  topScale: 1,
};

const STORAGE_KEY = 'shibaiter_tournament';

export function useTournament() {
  const [settings, setSettings] = useState<TournamentSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<TournamentSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}
