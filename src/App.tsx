import { useState, useEffect } from 'react';
import { useScores } from './hooks/useScores';
import { useMembers } from './hooks/useMembers';
import type { RunRecord } from './hooks/useScores';
import html2canvas from 'html2canvas';
import './index.css';

function App() {
  const { records, addRecord, deleteRecord, clearAll, stats } = useScores();
  const { members, updateMember } = useMembers();
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

      <h1 className="title-header animate-pop">SHIBAITER<br /><span style={{fontSize: '1.2rem', color: 'var(--text-main)'}}>for 夏の鮭祭り</span></h1>
      
      <div className="glass-panel switch-group animate-pop delay-1">
        <button className={`btn ${view === 'dashboard' ? '' : 'btn-secondary'}`} onClick={() => setView('dashboard')}>スコア</button>
        <button className={`btn ${view === 'input' ? '' : 'btn-secondary'}`} onClick={() => setView('input')}>記録入力</button>
        <button className={`btn ${view === 'history' ? '' : 'btn-secondary'}`} onClick={() => setView('history')}>履歴</button>
      </div>

      {view === 'dashboard' && <Dashboard stats={stats} members={members} updateMember={updateMember} />}
      {view === 'input' && <InputForm onSave={(record) => { addRecord(record); setView('dashboard'); }} />}
      {view === 'history' && <HistoryList records={records} onDelete={deleteRecord} onClearAll={clearAll} />}
      
      {/* 隠しシェア画像用DOM */}
      <div className="share-capture-wrapper">
        <ShareImageCard stats={stats} members={members} id="share-capture" />
      </div>
    </div>
  );
}

// --- Share Image Component (Hidden) ---
function ShareImageCard({ stats, members, id }: { stats: ReturnType<typeof useScores>['stats'], members: string[], id: string }) {
  const activeMembers = members.filter(m => m.trim() !== '');
  return (
    <div id={id} className="share-card">
      <h2 className="share-card-title">SHIBAITER<br/><span style={{fontSize: '1.2rem'}}>夏の鮭祭り</span></h2>
      
      {activeMembers.length > 0 && (
        <div className="share-members">
          <div className="share-members-title">TEAM MEMBERS</div>
          <div className="share-members-grid">
            {activeMembers.map((m, i) => (
              <div key={i} className="share-member-item">{m}</div>
            ))}
          </div>
        </div>
      )}

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

// --- Dashboard Component ---
function Dashboard({ stats, members, updateMember }: { stats: ReturnType<typeof useScores>['stats'], members: string[], updateMember: (index: number, name: string) => void }) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    // 画面のダッシュボードではなく、隠しコンポーネントをキャプチャする
    const element = document.getElementById('share-capture');
    if (!element) return;
    
    setIsSharing(true);
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null, // 背景はshare-cardに設定済み
        scale: 2,
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }
        
        const file = new File([blob], 'shibaiter_score.png', { type: 'image/png' });
        const text = `夏の鮭祭り、現在の私の結果！\n🐟総納品数: ${stats.totalGolden}個\n👑最高納品: ${stats.maxGolden}個\n#スプラトゥーン3 #サーモンラン #夏の鮭祭り\n`;
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              text: text,
              files: [file]
            });
            setIsSharing(false);
            return;
          } catch (e) {
            console.log('Share canceled or failed', e);
          }
        }
        
        try {
          await navigator.clipboard.write([
            new window.ClipboardItem({ 'image/png': blob })
          ]);
          alert('スコア画像をクリップボードにコピーしました！\\n次にX(Twitter)の投稿画面が開くので、画像を貼り付けて投稿してください🦑');
        } catch (e) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'shibaiter_score.png';
          a.click();
          URL.revokeObjectURL(url);
          alert('スコア画像をダウンロードしました！\\n次にX(Twitter)の投稿画面が開くので、ダウンロードした画像を添付して投稿してください🦑');
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
      <div className="glass-panel" style={{paddingBottom: '24px'}}>
        <h2 style={{marginBottom: '16px'}}>チームメンバー (任意)</h2>
        <div className="stats-grid" style={{gridTemplateColumns: '1fr 1fr', marginTop: 0}}>
          {members.map((name, i) => (
            <input 
              key={i}
              type="text" 
              className="styled-input" 
              placeholder={`メンバー ${i + 1}`} 
              value={name}
              onChange={e => updateMember(i, e.target.value)}
              style={{fontSize: '1rem', padding: '8px'}}
            />
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{paddingBottom: '32px'}}>
        <h2>大会スコアボード</h2>
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

        <div style={{marginTop: '32px'}}>
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
  const [clearWave, setClearWave] = useState('3');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goldenEggs || !powerEggs) {
      alert('金イクラとイクラの数は必須です！');
      return;
    }
    onSave({
      goldenEggs: parseInt(goldenEggs),
      powerEggs: parseInt(powerEggs),
      bronzeScale: parseInt(bronze),
      silverScale: parseInt(silver),
      goldScale: parseInt(gold),
      bossDefeated: boss,
      clearWave: parseInt(clearWave)
    });
  };

  return (
    <form className="glass-panel animate-pop delay-2" onSubmit={handleSubmit}>
      <h2>バイト記録入力</h2>
      
      <div className="stats-grid" style={{marginBottom: '16px'}}>
        <div className="input-group">
          <label><img src="/images/golden_egg.png" style={{width: 20, verticalAlign: 'middle', marginRight: 8}}/>金イクラ納品数</label>
          <input type="number" min="0" className="styled-input" value={goldenEggs} onChange={e => setGoldenEggs(e.target.value)} required placeholder="例: 120" />
        </div>
        <div className="input-group">
          <label><img src="/images/power_egg.svg" style={{width: 20, verticalAlign: 'middle', marginRight: 8}}/>イクラ獲得数</label>
          <input type="number" min="0" className="styled-input" value={powerEggs} onChange={e => setPowerEggs(e.target.value)} required placeholder="例: 3500" />
        </div>
      </div>

      <div className="input-group">
        <label>クリアWave</label>
        <select className="styled-input" value={clearWave} onChange={e => setClearWave(e.target.value)}>
          <option value="1">Wave 1 失敗</option>
          <option value="2">Wave 2 失敗</option>
          <option value="3">Wave 3 クリア！</option>
          <option value="4">EX Wave (オカシラ戦)</option>
        </select>
      </div>

      {clearWave === '4' && (
        <div className="glass-panel" style={{background: 'rgba(255,255,255,0.05)', padding: '16px'}}>
          <h3 style={{marginBottom: '12px'}}>オカシラシャケ討伐</h3>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '16px'}}>
             <div className={`stat-card ${boss === 'yokozuna' ? 'selected' : ''}`} onClick={() => setBoss(boss === 'yokozuna' ? null : 'yokozuna')} style={{cursor: 'pointer', border: boss === 'yokozuna' ? '2px solid var(--primary)' : ''}}>
               <img src="/images/boss_yokozuna.svg" className="item-icon"/>
             </div>
             <div className={`stat-card ${boss === 'tatsu' ? 'selected' : ''}`} onClick={() => setBoss(boss === 'tatsu' ? null : 'tatsu')} style={{cursor: 'pointer', border: boss === 'tatsu' ? '2px solid var(--primary)' : ''}}>
               <img src="/images/boss_tatsu.svg" className="item-icon"/>
             </div>
             <div className={`stat-card ${boss === 'joe' ? 'selected' : ''}`} onClick={() => setBoss(boss === 'joe' ? null : 'joe')} style={{cursor: 'pointer', border: boss === 'joe' ? '2px solid var(--primary)' : ''}}>
               <img src="/images/boss_joe.svg" className="item-icon"/>
             </div>
          </div>

          <h3 style={{marginBottom: '12px'}}>獲得ウロコ</h3>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div className="input-group">
              <label style={{color: '#cd7f32', fontSize:'0.9rem'}}>銅ウロコ</label>
              <input type="number" min="0" className="styled-input" value={bronze} onChange={e => setBronze(e.target.value)} />
            </div>
            <div className="input-group">
              <label style={{color: '#C0C0C0', fontSize:'0.9rem'}}>銀ウロコ</label>
              <input type="number" min="0" className="styled-input" value={silver} onChange={e => setSilver(e.target.value)} />
            </div>
            <div className="input-group">
              <label style={{color: '#FFD700', fontSize:'0.9rem'}}>金ウロコ</label>
              <input type="number" min="0" className="styled-input" value={gold} onChange={e => setGold(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="btn" style={{marginTop: '20px'}}>記録を保存する</button>
    </form>
  );
}

// --- History List Component ---
function HistoryList({ records, onDelete, onClearAll }: { records: RunRecord[], onDelete: (id: string) => void, onClearAll: () => void }) {
  if (records.length === 0) {
    return <div className="glass-panel animate-pop delay-2"><p style={{textAlign:'center'}}>記録がありません。</p></div>;
  }

  return (
    <div className="glass-panel animate-pop delay-2">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2>バイト履歴</h2>
        <button className="btn btn-secondary" style={{width: 'auto', padding: '8px 16px', fontSize: '0.9rem', background: '#8B0000'}} onClick={onClearAll}>全削除</button>
      </div>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {records.map(record => (
          <div key={record.id} className="glass-panel" style={{padding: '16px', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)'}}>
            <div>
              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{new Date(record.timestamp).toLocaleString()}</div>
              <div style={{fontWeight: 700, fontSize: '1.2rem', color: 'var(--secondary)', display:'flex', alignItems:'center', gap:'8px'}}>
                <img src="/images/golden_egg.png" style={{width: 24}}/> {record.goldenEggs} 個
                {record.bossDefeated && <span style={{fontSize: '0.9rem', background: 'var(--primary)', color: '#000', padding: '2px 8px', borderRadius: '12px', marginLeft: '12px'}}>オカシラ討伐</span>}
              </div>
            </div>
            <button className="btn btn-secondary" style={{width: 'auto', padding: '8px', background: 'transparent', border: '1px solid var(--text-muted)'}} onClick={() => onDelete(record.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
