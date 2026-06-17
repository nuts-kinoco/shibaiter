import { useState, useEffect } from 'react';

export interface RunRecord {
  id: string;
  timestamp: number;
  goldenEggs: number;
  powerEggs: number;
  bronzeScale: number;
  silverScale: number;
  goldScale: number;
  bossDefeated: string | null;
  // clearWave: 1=Wave1失敗(-30p), 2=Wave2失敗(-10p), 3=Wave3失敗(-5p)
  //            4=Wave3クリア(成功),  5=EX Wave/オカシラ戦(成功)
  clearWave: number;
}

export interface ScoreBreakdown {
  golden: number;
  scale: number;
  penalty: number;
  total: number;
}

const STORAGE_KEY = 'shibaiter_scores';
const SCHEMA_VERSION_KEY = 'shibaiter_schema_version';
const CURRENT_SCHEMA = 2;

// v1→v2 マイグレーション: 旧 3=W3クリア,4=EXWave → 新 4=W3クリア,5=EXWave
function migrateV1Records(records: RunRecord[]): RunRecord[] {
  return records.map(r => {
    if (r.clearWave === 3) return { ...r, clearWave: 4 };
    if (r.clearWave === 4) return { ...r, clearWave: 5 };
    return r;
  });
}

// ---- スコア計算ヘルパー (export) ----

export function calcScalePoint(r: RunRecord): number {
  return r.bronzeScale * 4 + r.silverScale * 5 + r.goldScale * 6;
}

export function calcPenalty(r: RunRecord): number {
  if (r.clearWave === 1) return -30;
  if (r.clearWave === 2) return -10;
  if (r.clearWave === 3) return -5;
  return 0;
}

export function isSuccess(r: RunRecord): boolean {
  return r.clearWave >= 4; // 4=Wave3クリア, 5=EXWave
}

// 集計方式①: 指定回数のスコアの合計
// 全バイト対象（成功/失敗問わず）。ウロコは最初に獲得した1回分のみ。
export function calcCountScore(records: RunRecord[], n: number): ScoreBreakdown {
  const targets = records.slice(0, n); // records は新→古順なので先頭N件
  const golden = targets.reduce((acc, r) => acc + r.goldenEggs, 0);
  // 最初に獲得したウロコ = 時系列で最も古いウロコ取得バイト（配列末尾方向）
  const firstUroko = [...targets].reverse().find(r => calcScalePoint(r) > 0);
  const scale = firstUroko ? calcScalePoint(firstUroko) : 0;
  const penalty = targets.reduce((acc, r) => acc + calcPenalty(r), 0);
  return { golden, scale, penalty, total: golden + scale + penalty };
}

// 集計方式②: 全バイトのスコアの合計（成功のみ対象）
export function calcAllScore(records: RunRecord[]): ScoreBreakdown {
  const successful = records.filter(isSuccess);
  const golden = successful.reduce((acc, r) => acc + r.goldenEggs, 0);
  const scale = successful.reduce((acc, r) => acc + calcScalePoint(r), 0);
  return { golden, scale, penalty: 0, total: golden + scale };
}

// 集計方式③: 上位スコアの合計（成功のみ選出、失敗ペナルティは全件分）
export function calcTopScore(records: RunRecord[], topGolden: number, topScale: number): ScoreBreakdown {
  const successful = records.filter(isSuccess);
  const failed = records.filter(r => !isSuccess(r));

  // 金イクラ上位N回
  const byGolden = [...successful].sort((a, b) => b.goldenEggs - a.goldenEggs).slice(0, topGolden);
  const golden = byGolden.reduce((acc, r) => acc + r.goldenEggs, 0);

  // ウロコポイント上位M回
  const byScale = [...successful].sort((a, b) => calcScalePoint(b) - calcScalePoint(a)).slice(0, topScale);
  const scale = byScale.reduce((acc, r) => acc + calcScalePoint(r), 0);

  // 全失敗バイトのペナルティ（成否問わず全件から失敗分を合算）
  const penalty = failed.reduce((acc, r) => acc + calcPenalty(r), 0);

  return { golden, scale, penalty, total: golden + scale + penalty };
}

// ---- Hook ----

export function useScores() {
  const [records, setRecords] = useState<RunRecord[]>([]);

  useEffect(() => {
    const schemaVersion = parseInt(localStorage.getItem(SCHEMA_VERSION_KEY) || '1');
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        let parsed: RunRecord[] = JSON.parse(saved);
        if (schemaVersion < CURRENT_SCHEMA) {
          // マイグレーション実行
          parsed = migrateV1Records(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA));
          console.info('[shibaiter] Migrated records to schema v2');
        }
        setRecords(parsed);
      } catch (e) {
        console.error('Failed to parse saved records', e);
      }
    } else {
      localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA));
    }
  }, []);

  const addRecord = (record: Omit<RunRecord, 'id' | 'timestamp'>) => {
    const newRecord: RunRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setRecords(prev => {
      const updated = [newRecord, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
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
