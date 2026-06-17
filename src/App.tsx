import { useState, useEffect } from 'react';
import { useScores, calcCountScore, calcAllScore, calcTopScore, calcScalePoint, calcPenalty } from './hooks/useScores';
import type { RunRecord } from './hooks/useScores';
import { useMembers } from './hooks/useMembers';
import { useTournament } from './hooks/useTournament';
import type { TournamentSettings, TournamentMode } from './hooks/useTournament';
import html2canvas from 'html2canvas';
import './index.css';

function App() {
  const { records, addRecord, deleteRecord, clearAll, stats } = useScores();
  const { members, updateMember, teamName, setTeamName } = useMembers();
  const { settings, updateSettings } = useTournament();
  const [view, setView] = useState<'dashboard' | 'input' | 'history'>('dashboard');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('shibaiter_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shibaiter_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app-container">
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
          borderRadius: '50%', width: 40, height: 40,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', zIndex: 100, color: 'var(--text-main)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        title="テーマ切り替え"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <h1 className="title-header animate-pop">シバイター<br /><span style={{fontSize: '1.2rem', color: 'var(--text-main)'}}>for 夏の鮭祭り</span></h1>

      <div className="glass-panel switch-group animate-pop delay-1">
        <button className={`btn ${view === 'dashboard' ? '' : 'btn-secondary'}`} onClick={() => setView('dashboard')}>スコア</button>
        <button className={`btn ${view === 'input' ? '' : 'btn-secondary'}`} onClick={() => setView('input')}>記録入力</button>
        <button className={`btn ${view === 'history' ? '' : 'btn-secondary'}`} onClick={() => setView('history')}>履歴</button>
      </div>

      {view === 'dashboard' && <Dashboard stats={stats} members={members} updateMember={updateMember} teamName={teamName} setTeamName={setTeamName} records={records} settings={settings} updateSettings={updateSettings} />}
      {view === 'input' && <InputForm onSave={(record) => { addRecord(record); setView('dashboard'); }} />}
      {view === 'history' && <HistoryList records={records} onDelete={deleteRecord} onClearAll={clearAll} />}

      {/* 隠しシェア画像用DOM */}
      <div className="share-capture-wrapper">
        <ShareImageCard stats={stats} members={members} teamName={teamName} settings={settings} records={records} id="share-capture" />
      </div>
    </div>
  );
}

// --- Share Image Component (Hidden) ---
function ShareImageCard({ stats, members, teamName, settings, records, id }: {
  stats: ReturnType<typeof useScores>['stats'],
  members: string[],
  teamName: string,
  settings: TournamentSettings,
  records: RunRecord[],
  id: string
}) {
  const activeMembers = members.filter(m => m.trim() !== '');
  const scoreBreakdown = (() => {
    if (settings.mode === 'count') return calcCountScore(records, settings.countN);
    if (settings.mode === 'all') return calcAllScore(records);
    return calcTopScore(records, settings.topGolden, settings.topScale);
  })();

  return (
    <div id={id} className="share-card">
      <h2 className="share-card-title">シバイター<br/><span style={{fontSize: '1.2rem'}}>夏の鮭祭り</span></h2>

      {(activeMembers.length > 0 || teamName) && (
        <div className="share-members">
          <div className="share-members-title">TEAM MEMBERS</div>
          {teamName && <div className="share-team-name">{teamName}</div>}
          {activeMembers.length > 0 && (
            <div className="share-members-grid">
              {activeMembers.map((m, i) => (
                <div key={i} className="share-member-item">{m}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 大会スコア */}
      <div style={{background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: '20px', border: '1px solid rgba(255,106,0,0.3)'}}>
        <div style={{textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#FF6A00', marginBottom: 8}}>大会スコア</div>
        <div style={{textAlign: 'center', fontSize: '3.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #FFD700, #FF6A00)', WebkitBackgroundClip: 'text', color: 'transparent', lineHeight: 1.1}}>
          {scoreBreakdown.total}<span style={{fontSize: '1.5rem'}}>pt</span>
        </div>
        <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.9rem', fontWeight: 700}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}><span>🥚 金イクラ</span><span>+{scoreBreakdown.golden}</span></div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}><span>🐠 ウロコ</span><span>+{scoreBreakdown.scale}</span></div>
          {scoreBreakdown.penalty !== 0 && (
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#FF6666'}}><span>💀 ペナルティ</span><span>{scoreBreakdown.penalty}</span></div>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{marginBottom: 0}}>
        <div className="stats-grid" style={{marginTop: 0}}>
          <div className="stat-card" style={{gridColumn: 'span 2'}}>
            <div className="stat-label">総納品数</div>
            <div className="item-row" style={{justifyContent: 'center'}}>
              <img src="/images/golden_egg.png" alt="金イクラ" className="item-icon" />
              <div className="stat-value">{stats.totalGolden}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">最高納品</div>
            <div className="stat-value" style={{fontSize: '2rem'}}>{stats.maxGolden}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">バイト数</div>
            <div className="stat-value" style={{fontSize: '2rem'}}>{stats.totalRuns}</div>
          </div>
        </div>

        <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
          <div className="stat-card" style={{borderColor: '#8b4513', padding: '12px'}}>
            <img src="/images/scale_bronze.png" alt="銅" className="item-icon" style={{width: 32, height: 32}} />
            <div className="stat-value" style={{color: '#cd7f32', fontSize: '1.8rem'}}>{stats.totalBronze}</div>
          </div>
          <div className="stat-card" style={{borderColor: '#808080', padding: '12px'}}>
            <img src="/images/scale_silver.png" alt="銀" className="item-icon" style={{width: 32, height: 32}} />
            <div className="stat-value" style={{color: '#C0C0C0', fontSize: '1.8rem'}}>{stats.totalSilver}</div>
          </div>
          <div className="stat-card" style={{borderColor: '#DAA520', padding: '12px'}}>
            <img src="/images/scale_gold.png" alt="金" className="item-icon" style={{width: 32, height: 32}} />
            <div className="stat-value" style={{color: '#FFD700', fontSize: '1.8rem'}}>{stats.totalGold}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Event Info Card Component ---
function EventInfoCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-panel event-info-card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'}}>
        <div style={{minWidth: 0}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap'}}>
            <h2 style={{margin: 0}}>夏の鮭祭り</h2>
            <span className="event-badge">COMING SOON</span>
          </div>
          <div style={{color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 700}}>2026.7.4 (土) 17:00〜19:15 APAC</div>
        </div>
        <button type="button" className="btn-cancel-delete" style={{flexShrink: 0, whiteSpace: 'nowrap'}}
          onClick={() => setOpen(o => !o)}>
          {open ? '▲ 閉じる' : '▼ 詳細'}
        </button>
      </div>
      {open && (
        <div className="animate-pop" style={{marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '0'}}>
          <div className="event-row"><span className="event-key">🎯 形式</span><span>4人1チーム / タイカイサポート</span></div>
          <div className="event-row"><span className="event-key">🗺️ ステージ</span><span>どんぴこ闘技場</span></div>
          <div className="event-row"><span className="event-key">🔫 支給ブキ</span><span>オールランダム</span></div>
          <div className="event-row"><span className="event-key">🦈 オカシラ</span><span>オカシラ連合</span></div>
          <div style={{marginTop: '12px', padding: '12px', background: 'rgba(255,106,0,0.06)', borderRadius: '10px', border: '1px dashed rgba(255,106,0,0.25)'}}>
            <div style={{fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 900, marginBottom: '8px', letterSpacing: '1px'}}>⏳ 未発表</div>
            <div className="event-row"><span style={{color: 'var(--text-muted)'}}>集計方式</span><span className="tbd-badge">？</span></div>
            <div className="event-row"><span style={{color: 'var(--text-muted)'}}>上位N件・M件</span><span className="tbd-badge">？</span></div>
            <div className="event-row"><span style={{color: 'var(--text-muted)'}}>賞品</span><span className="tbd-badge">？</span></div>
            <div className="event-row"><span style={{color: 'var(--text-muted)'}}>詳細レギュレーション</span><span className="tbd-badge">？</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Dashboard Component ---
function Dashboard({ stats, members, updateMember, teamName, setTeamName, records, settings, updateSettings }: {
  stats: ReturnType<typeof useScores>['stats'],
  members: string[],
  updateMember: (index: number, name: string) => void,
  teamName: string,
  setTeamName: (name: string) => void,
  records: RunRecord[],
  settings: TournamentSettings,
  updateSettings: (updates: Partial<TournamentSettings>) => void,
}) {
  const [isSharing, setIsSharing] = useState(false);

  const scoreBreakdown = (() => {
    if (settings.mode === 'count') return calcCountScore(records, settings.countN);
    if (settings.mode === 'all') return calcAllScore(records);
    return calcTopScore(records, settings.topGolden, settings.topScale);
  })();

  const modeLabel = () => {
    if (settings.mode === 'count') return `① 指定${settings.countN}回分の合計`;
    if (settings.mode === 'all') return '② 全バイト合計（成功のみ）';
    return `③ 上位 (金イクラ${settings.topGolden}回 / ウロコ${settings.topScale}回)`;
  };

  const handleShare = async () => {
    const element = document.getElementById('share-capture');
    if (!element) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) { setIsSharing(false); return; }
        const file = new File([blob], 'shibaiter_score.png', { type: 'image/png' });
        const prefix = teamName ? `チーム【${teamName}】の` : '私の';
        const text = `夏の鮭祭り、現在の${prefix}結果！\n🏆大会スコア: ${scoreBreakdown.total}pt\n🐟総納品数: ${stats.totalGolden}個\n👑最高納品: ${stats.maxGolden}個\n#スプラトゥーン3 #サーモンラン #夏の鮭祭り\n`;
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ text, files: [file] });
            setIsSharing(false);
            return;
          } catch (e) { console.log('Share canceled or failed', e); }
        }
        try {
          await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
          alert('スコア画像をクリップボードにコピーしました！\n次にX(Twitter)の投稿画面が開くので、画像を貼り付けて投稿してください🦑');
        } catch (e) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'shibaiter_score.png';
          a.click();
          URL.revokeObjectURL(url);
          alert('スコア画像をダウンロードしました！\n次にX(Twitter)の投稿画面が開くので、ダウンロードした画像を添付して投稿してください🦑');
        }
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
        setIsSharing(false);
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image', error);
      alert('画像の生成に失敗しました...');
      setIsSharing(false);
    }
  };

  return (
    <div className="animate-pop delay-2">
      <EventInfoCard />

      {/* チームメンバー */}
      <div className="glass-panel" style={{paddingBottom: '24px'}}>
        <h2 style={{marginBottom: '16px'}}>チームメンバー</h2>
        <div style={{marginBottom: '16px'}}>
          <input type="text" className="styled-input" placeholder="チーム名（任意）" value={teamName}
            onChange={e => setTeamName(e.target.value)} style={{fontSize: '1.1rem', padding: '10px'}} />
        </div>
        <div className="stats-grid" style={{gridTemplateColumns: '1fr 1fr', marginTop: 0}}>
          {members.map((name, i) => (
            <input key={i} type="text" className="styled-input" placeholder={`メンバー ${i + 1}`}
              value={name} onChange={e => updateMember(i, e.target.value)} style={{fontSize: '1rem', padding: '8px'}} />
          ))}
        </div>
      </div>

      {/* 大会設定 */}
      <div className="glass-panel">
        <h2 style={{marginBottom: '20px'}}>大会設定</h2>
        <div className="input-group">
          <label>集計方式</label>
          <select className="styled-input" value={settings.mode}
            onChange={e => updateSettings({ mode: e.target.value as TournamentMode })}>
            <option value="count">① 指定回数のスコアの合計</option>
            <option value="all">② 全バイトのスコアの合計</option>
            <option value="top">③ 上位スコアの合計</option>
          </select>
        </div>
        {settings.mode === 'count' && (
          <div className="setting-row">
            <span>集計回数</span>
            <input type="number" min="1" className="inline-num-input" value={settings.countN}
              onChange={e => updateSettings({ countN: Math.max(1, parseInt(e.target.value) || 1) })} />
            <span>回</span>
          </div>
        )}
        {settings.mode === 'top' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px'}}>
            <div className="setting-row">
              <span>金イクラ上位</span>
              <input type="number" min="1" className="inline-num-input" value={settings.topGolden}
                onChange={e => updateSettings({ topGolden: Math.max(1, parseInt(e.target.value) || 1) })} />
              <span>回分</span>
            </div>
            <div className="setting-row">
              <span>ウロコポイント上位</span>
              <input type="number" min="1" className="inline-num-input" value={settings.topScale}
                onChange={e => updateSettings({ topScale: Math.max(1, parseInt(e.target.value) || 1) })} />
              <span>回分</span>
            </div>
          </div>
        )}
        {settings.mode === 'all' && (
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px'}}>
            制限時間内に成功した全バイトのスコアを合計します。
          </p>
        )}
      </div>

      {/* 大会スコア */}
      <div className="glass-panel score-result-panel">
        <h2 style={{marginBottom: '8px'}}>大会スコア</h2>
        <div className="mode-badge">{modeLabel()}</div>
        <div className="big-score">{scoreBreakdown.total}<span className="score-unit">pt</span></div>
        <div className="score-breakdown">
          <div className="score-row">
            <span>🥚 金イクラ</span>
            <span className="score-plus">+{scoreBreakdown.golden}</span>
          </div>
          <div className="score-row">
            <span>🐠 ウロコポイント</span>
            <span className="score-plus">+{scoreBreakdown.scale}</span>
          </div>
          {scoreBreakdown.penalty !== 0 && (
            <div className="score-row penalty-row">
              <span>💀 失敗ペナルティ</span>
              <span>{scoreBreakdown.penalty}</span>
            </div>
          )}
          <div className="score-divider" />
          <div className="score-row total-score-row">
            <span>合計スコア</span>
            <span>{scoreBreakdown.total} pt</span>
          </div>
        </div>
        <div style={{marginTop: '24px'}}>
          <button
            className="btn"
            style={{background: 'linear-gradient(45deg, #1DA1F2, #00C6FF)', color: '#FFF'}}
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? '画像生成中...' : '𝕏 で結果をシェアする'}
          </button>
        </div>
      </div>

      {/* バイト統計 */}
      <div className="glass-panel" style={{paddingBottom: '32px'}}>
        <h2>バイト統計</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">総納品数</div>
            <div className="item-row" style={{justifyContent: 'center'}}>
              <img src="/images/golden_egg.png" alt="金イクラ" className="item-icon" />
              <div className="stat-value">{stats.totalGolden}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">最高納品数</div>
            <div className="stat-value">{stats.maxGolden}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">バイト回数</div>
            <div className="stat-value">{stats.totalRuns}</div>
          </div>
        </div>

        <h3 style={{marginTop: '24px', marginBottom: '16px', color: 'var(--secondary)'}}>獲得ウロコ総数</h3>
        <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
          <div className="stat-card" style={{borderColor: '#8b4513'}}>
            <img src="/images/scale_bronze.png" alt="銅" className="item-icon" />
            <div className="stat-value" style={{color: '#cd7f32'}}>{stats.totalBronze}</div>
          </div>
          <div className="stat-card" style={{borderColor: '#808080'}}>
            <img src="/images/scale_silver.png" alt="銀" className="item-icon" />
            <div className="stat-value" style={{color: '#C0C0C0'}}>{stats.totalSilver}</div>
          </div>
          <div className="stat-card" style={{borderColor: '#DAA520'}}>
            <img src="/images/scale_gold.png" alt="金" className="item-icon" />
            <div className="stat-value" style={{color: '#FFD700'}}>{stats.totalGold}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Input Form Component ---
function InputForm({ onSave }: { onSave: (r: Omit<RunRecord, 'id' | 'timestamp'>) => void }) {
  const [goldenEggs, setGoldenEggs] = useState('');
  const [powerEggs, setPowerEggs] = useState('');
  const [bronze, setBronze] = useState('0');
  const [silver, setSilver] = useState('0');
  const [gold, setGold] = useState('0');
  const [boss, setBoss] = useState<string | null>(null);
  const [clearWave, setClearWave] = useState('4'); // デフォルト: Wave3クリア

  const handleReset = () => {
    setGoldenEggs('');
    setPowerEggs('');
    setBronze('0');
    setSilver('0');
    setGold('0');
    setBoss(null);
    setClearWave('4');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const golden = parseInt(goldenEggs);
    const power = parseInt(powerEggs);
    if (isNaN(golden) || isNaN(power) || golden < 0 || power < 0) {
      alert('納品数とイクラの数を正しく入力してください！');
      return;
    }
    onSave({
      goldenEggs: golden,
      powerEggs: power,
      bronzeScale: parseInt(bronze) || 0,
      silverScale: parseInt(silver) || 0,
      goldScale: parseInt(gold) || 0,
      bossDefeated: boss,
      clearWave: parseInt(clearWave),
    });
  };

  return (
    <form className="glass-panel animate-pop delay-2" onSubmit={handleSubmit}>
      <h2>バイト記録入力</h2>

      <div className="stats-grid" style={{marginBottom: '16px'}}>
        <div className="input-group">
          <label><img src="/images/golden_egg.png" style={{width: 20, marginRight: 6}}/>納品数</label>
          <div className="input-wrapper">
            <input type="number" min="0" className="styled-input" value={goldenEggs}
              onChange={e => setGoldenEggs(e.target.value)} required placeholder="例: 120" />
            {goldenEggs && <button type="button" className="clear-input-btn" onClick={() => setGoldenEggs('')}>×</button>}
          </div>
        </div>
        <div className="input-group">
          <label><img src="/images/power_egg.svg" style={{width: 20, marginRight: 6}}/>イクラ</label>
          <div className="input-wrapper">
            <input type="number" min="0" className="styled-input" value={powerEggs}
              onChange={e => setPowerEggs(e.target.value)} required placeholder="例: 3500" />
            {powerEggs && <button type="button" className="clear-input-btn" onClick={() => setPowerEggs('')}>×</button>}
          </div>
        </div>
      </div>

      <div className="input-group">
        <label>クリア Wave</label>
        <select className="styled-input" value={clearWave} onChange={e => setClearWave(e.target.value)}>
          <option value="1">Wave 1 失敗 (-30pt)</option>
          <option value="2">Wave 2 失敗 (-10pt)</option>
          <option value="3">Wave 3 失敗 (-5pt)</option>
          <option value="4">Wave 3 クリア！</option>
          <option value="5">EX Wave（オカシラ戦）</option>
        </select>
      </div>

      {clearWave === '5' && (
        <div className="glass-panel" style={{background: 'rgba(255,255,255,0.05)', padding: '16px'}}>
          <h3 style={{marginBottom: '12px'}}>オカシラシャケ討伐</h3>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '16px'}}>
            <div role="button" tabIndex={0}
              className={`stat-card ${boss === 'yokozuna' ? 'selected' : ''}`}
              onClick={() => setBoss(boss === 'yokozuna' ? null : 'yokozuna')}
              onKeyDown={e => e.key === 'Enter' && setBoss(boss === 'yokozuna' ? null : 'yokozuna')}
              style={{cursor: 'pointer', border: boss === 'yokozuna' ? '2px solid var(--primary)' : ''}}>
              <img src="/images/boss_yokozuna.svg" alt="ヨコヅナ" className="item-icon"/>
            </div>
            <div role="button" tabIndex={0}
              className={`stat-card ${boss === 'tatsu' ? 'selected' : ''}`}
              onClick={() => setBoss(boss === 'tatsu' ? null : 'tatsu')}
              onKeyDown={e => e.key === 'Enter' && setBoss(boss === 'tatsu' ? null : 'tatsu')}
              style={{cursor: 'pointer', border: boss === 'tatsu' ? '2px solid var(--primary)' : ''}}>
              <img src="/images/boss_tatsu.svg" alt="テッパン" className="item-icon"/>
            </div>
            <div role="button" tabIndex={0}
              className={`stat-card ${boss === 'joe' ? 'selected' : ''}`}
              onClick={() => setBoss(boss === 'joe' ? null : 'joe')}
              onKeyDown={e => e.key === 'Enter' && setBoss(boss === 'joe' ? null : 'joe')}
              style={{cursor: 'pointer', border: boss === 'joe' ? '2px solid var(--primary)' : ''}}>
              <img src="/images/boss_joe.svg" alt="ジョー" className="item-icon"/>
            </div>
          </div>

          <h3 style={{marginBottom: '12px'}}>獲得ウロコ</h3>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div className="input-group">
              <label style={{color: '#cd7f32', fontSize: '0.9rem'}}>銅ウロコ</label>
              <input type="number" min="0" className="styled-input" value={bronze} onChange={e => setBronze(e.target.value)} />
            </div>
            <div className="input-group">
              <label style={{color: '#C0C0C0', fontSize: '0.9rem'}}>銀ウロコ</label>
              <input type="number" min="0" className="styled-input" value={silver} onChange={e => setSilver(e.target.value)} />
            </div>
            <div className="input-group">
              <label style={{color: '#FFD700', fontSize: '0.9rem'}}>金ウロコ</label>
              <input type="number" min="0" className="styled-input" value={gold} onChange={e => setGold(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
        <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={handleReset}>リセット</button>
        <button type="submit" className="btn" style={{flex: 2}}>記録を保存する</button>
      </div>
    </form>
  );
}

// --- History List Component ---
function clearWaveLabel(cw: number): { text: string; color: string } {
  switch (cw) {
    case 1: return { text: 'Wave1 失敗', color: '#FF4444' };
    case 2: return { text: 'Wave2 失敗', color: '#FF8C00' };
    case 3: return { text: 'Wave3 失敗', color: '#FFD700' };
    case 4: return { text: 'Wave3 クリア', color: '#14E814' };
    case 5: return { text: 'EX Wave', color: '#FF6A00' };
    default: return { text: '-', color: '#AAA' };
  }
}

function HistoryList({ records, onDelete, onClearAll }: { records: RunRecord[], onDelete: (id: string) => void, onClearAll: () => void }) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (records.length === 0) {
    return <div className="glass-panel animate-pop delay-2"><p style={{textAlign: 'center'}}>記録がありません。</p></div>;
  }

  return (
    <div className="glass-panel animate-pop delay-2">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2>バイト履歴</h2>
        <button className="btn btn-secondary" style={{width: 'auto', padding: '8px 16px', fontSize: '0.9rem', background: '#8B0000'}} onClick={onClearAll}>全削除</button>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {records.map(record => {
          const waveInfo = clearWaveLabel(record.clearWave);
          const scale = calcScalePoint(record);
          const penalty = calcPenalty(record);
          const runScore = record.goldenEggs + scale + penalty;
          return (
            <div key={record.id} className="glass-panel" style={{padding: '16px', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)'}}>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>{new Date(record.timestamp).toLocaleString()}</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                  <span style={{fontWeight: 700, fontSize: '1.2rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <img src="/images/golden_egg.png" style={{width: 22}}/>{record.goldenEggs}個
                  </span>
                  <span style={{fontSize: '0.78rem', padding: '2px 10px', borderRadius: '12px', fontWeight: 700,
                    background: waveInfo.color + '22', color: waveInfo.color, border: `1px solid ${waveInfo.color}66`}}>
                    {waveInfo.text}
                  </span>
                  {record.bossDefeated && (
                    <span style={{fontSize: '0.78rem', background: 'var(--primary)', color: '#000', padding: '2px 8px', borderRadius: '12px'}}>オカシラ討伐</span>
                  )}
                </div>
                <div style={{fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                  {scale > 0 && <span>🐠 +{scale}pt</span>}
                  {penalty < 0 && <span style={{color: '#FF6666'}}>💀 {penalty}pt</span>}
                  <span style={{color: 'var(--primary)', fontWeight: 700}}>計 {runScore}pt</span>
                </div>
              </div>
              {confirmingId === record.id ? (
                <div className="delete-confirm-group animate-pop">
                  <span style={{fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700}}>本当に削除？</span>
                  <button type="button" className="btn-confirm-delete" onClick={() => { onDelete(record.id); setConfirmingId(null); }}>削除</button>
                  <button type="button" className="btn-cancel-delete" onClick={() => setConfirmingId(null)}>戻る</button>
                </div>
              ) : (
                <button type="button" className="btn btn-secondary" style={{width: 'auto', padding: '8px', background: 'transparent', border: '1px solid var(--text-muted)', flexShrink: 0, marginLeft: '8px'}} onClick={() => setConfirmingId(record.id)}>🗑️</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
