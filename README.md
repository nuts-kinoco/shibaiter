# シバイター 開発メモ

> 「夏の鮭祭り」タイカイサポート大会用スコア管理アプリ。  
> Vite + React + TypeScript / クライアントオンリー / サーバー不要

---

## イベント概要（夏の鮭祭り）

| 項目 | 内容 |
|---|---|
| 開催日時 | 2026年7月4日(土) 17:00〜19:15（APAC地域） |
| 形式 | 4人1チーム / タイカイサポート公式 |
| ステージ | どんぴこ闘技場 |
| 支給ブキ | オールランダム |
| オカシラ | オカシラ連合 |

### ⏳ 未発表（発表されたらアプリに反映する）

- [ ] **集計方式** → `src/App.tsx` の `大会設定` パネルで選択できるようにしてある（①②③の3方式）
- [ ] **上位N件・M件（③を採用した場合）** → `大会設定` パネルで数値入力できる
- [ ] 賞品
- [ ] 詳細レギュレーション

---

## スコア計算ルール（実装済み）

### 1回のバイトのスコア
```
スコア = 金イクラ納品数 + ウロコポイント
ウロコポイント = 銅ウロコ×4 + 銀ウロコ×5 + 金ウロコ×6
```

### 失敗ペナルティ
| Wave | ペナルティ |
|---|---|
| Wave 1 失敗 | -30pt |
| Wave 2 失敗 | -10pt |
| Wave 3 失敗 | -5pt |

### 集計方式

#### ① 指定回数のスコアの合計
- 成功/失敗問わず全バイトが対象
- 金イクラ：N回分すべて合算
- ウロコポイント：最初に獲得した **1回分のみ**（時系列で最古のウロコ取得バイト）
- ペナルティ：N回分すべてを合算

#### ② 全バイトのスコアの合計
- **成功バイトのみ対象**（オカシラ倒せなくても成功扱い）
- 全成功バイトの（金イクラ＋ウロコポイント）を合算

#### ③ 上位スコアの合計
- **成功バイトのみ**から選出
- 金イクラ上位N回の金イクラ合計
- ウロコポイント上位M回のウロコポイント合計
- **失敗バイト全件のペナルティを合算して減算**（選出されなくてもペナルティは引かれる）

例: 金イクラ上位2回・ウロコ上位1回の場合
```
A: 金x45  / Wave1失敗(-30p)  ← 選出対象外（失敗）
B: 金x140 / ウロコ21p        ← 金イクラ1位 ✓
C: 金x130 / Wave3失敗(-5p)  ← 選出対象外（失敗）
D: 金x123 / ウロコ0p         ← 金イクラ2位 ✓
E: 金x120 / ウロコ23p        ← ウロコ1位 ✓

合計 = 140 + 123 + 23 - 30 - 5 = 251pt
```

---

## データモデル

### `clearWave` の値（スキーマ v2）

| 値 | 意味 | ペナルティ | 成功扱い |
|---|---|---|---|
| `1` | Wave1 失敗 | -30pt | ✗ |
| `2` | Wave2 失敗 | -10pt | ✗ |
| `3` | Wave3 失敗（**v2で新規追加**） | -5pt | ✗ |
| `4` | Wave3 クリア | なし | ✓ |
| `5` | EX Wave（オカシラ戦） | なし | ✓ |

> **マイグレーション**: 旧スキーマ(v1)は 3=Wave3クリア, 4=EXWave だった。  
> アプリ起動時に自動検出・変換する処理を `useScores.ts` に実装済み。

### `localStorage` キー一覧

| キー | 内容 |
|---|---|
| `shibaiter_scores` | バイト記録の配列（JSON） |
| `shibaiter_schema_version` | データスキーマのバージョン（現在: `2`） |
| `shibaiter_members` | メンバー名4件の配列（JSON） |
| `shibaiter_teamname` | チーム名（文字列） |
| `shibaiter_tournament` | 大会設定（集計方式・N件・M件） |
| `shibaiter_theme` | テーマ（`dark` or `light`） |

---

## ファイル構成

```
src/
├── App.tsx                  メインUI（全コンポーネント）
├── index.css                スタイル（CSS変数・全クラス定義）
├── main.tsx                 エントリポイント
└── hooks/
    ├── useScores.ts         スコア記録管理＋スコア計算関数
    ├── useMembers.ts        メンバー・チーム名管理
    └── useTournament.ts     大会設定管理
```

### `useScores.ts` のエクスポート一覧

```ts
// 型
export interface RunRecord { ... }
export interface ScoreBreakdown { golden, scale, penalty, total }

// ヘルパー
export function calcScalePoint(r: RunRecord): number
export function calcPenalty(r: RunRecord): number
export function isSuccess(r: RunRecord): boolean

// 集計（方式①②③）
export function calcCountScore(records, n): ScoreBreakdown
export function calcAllScore(records): ScoreBreakdown
export function calcTopScore(records, topGolden, topScale): ScoreBreakdown

// Hook
export function useScores()
```

---

## 開発コマンド

```bash
# 起動
npm run dev

# 型チェック＋ビルド確認
npm run build

# GitHub へ push（PowerShell は && が使えないので1行ずつ）
git add -A
git commit -m "コミットメッセージ"
git push
```

> ⚠️ PowerShell では `&&` が使えない。コマンドは必ず1行ずつ実行する。

---

## 現在の UI 構成（ダッシュボードの表示順）

1. **夏の鮭祭り** カード（▼詳細でイベント情報展開）
2. **チームメンバー** パネル（チーム名 ＋ メンバー4名）
3. **大会設定** パネル（集計方式セレクタ ＋ 回数入力）
4. **大会スコア** パネル（合計スコア大表示 ＋ 内訳 ＋ Xシェアボタン）
5. **バイト統計** パネル（総納品数 / 最高 / バイト回数 / ウロコ総数）

---

## 残タスク・TODO

- [ ] 夏の鮭祭りの集計方式・N件・M件が発表されたら `大会設定` を更新
- [ ] イベント名が発表されたら `EventInfoCard` の「夏の鮭祭り」テキストを更新
- [ ] 賞品・詳細レギュレーションが発表されたら `EventInfoCard` の未発表欄に追記
- [ ] 大会後：結果の最終集計を確認・共有機能の追加（任意）

---

## リポジトリ

`https://github.com/nuts-kinoco/shibaiter.git` （branch: `main`）
