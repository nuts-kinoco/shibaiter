import { useState, useEffect } from 'react';

export interface RunRecord {
  id: string;
  timestamp: number;
  goldenEggs: number;
  powerEggs: number;
  bronzeScale: number;
  silverScale: number;
  goldScale: number;
  bossDefeated: string | null; // null, 'yokozuna', 'tatsu', 'joe'
  clearWave: number; // 1, 2, 3, 4 (EX Wave)
}

const STORAGE_KEY = 'shibaiter_scores';

export function useScores() {
  const [records, setRecords] = useState<RunRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved records', e);
      }
    }
  }, []);

  const addRecord = (record: Omit<RunRecord, 'id' | 'timestamp'>) => {
    const newRecord: RunRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    if (confirm('すべての記録を削除しますか？')) {
      setRecords([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const stats = {
    totalRuns: records.length,
    totalGolden: records.reduce((acc, r) => acc + r.goldenEggs, 0),
    maxGolden: records.length > 0 ? Math.max(...records.map(r => r.goldenEggs)) : 0,
    totalBronze: records.reduce((acc, r) => acc + r.bronzeScale, 0),
    totalSilver: records.reduce((acc, r) => acc + r.silverScale, 0),
    totalGold: records.reduce((acc, r) => acc + r.goldScale, 0),
  };

  return { records, addRecord, deleteRecord, clearAll, stats };
}
