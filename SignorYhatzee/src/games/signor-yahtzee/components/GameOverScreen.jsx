import { useEffect, useState } from "react";

export default function GameOverScreen({ state }) {
  const { isGameOver, getWinner, players, totalScore, resetGame, drinkStats } = state;
  const [confetti, setConfetti] = useState([]);
  const gameOver = isGameOver();

  useEffect(() => {
    if (gameOver) {
      const pieces = [];
      const colors = ['#f59e0b', '#fbbf24', '#fef3c7', '#ffffff', '#ef4444'];
      for (let i = 0; i < 100; i++) {
        pieces.push({
          id: i,
          left: Math.random() * 100 + '%',
          delay: Math.random() * 3 + 's',
          duration: (Math.random() * 2 + 2) + 's',
          color: colors[Math.floor(Math.random() * colors.length)],
          size: (Math.random() * 10 + 5) + 'px'
        });
      }
      setConfetti(pieces);
    }
  }, [isGameOver]);

  if (!isGameOver()) return null;

  return (
    <div className="app game-over-screen">
      <div className="confetti-container">
        {confetti.map(p => (
          <div 
            key={p.id} 
            className="confetti-piece" 
            style={{ 
              left: p.left, 
              animationDelay: p.delay, 
              animationDuration: p.duration,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              animationName: 'confetti-fall',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear'
            }} 
          />
        ))}
      </div>

      <div className="glass-panel winner-card">
        <p className="winner-label" style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted)' }}>🏆 IL VINCITORE È</p>
        <p className="winner-name">{getWinner()}</p>
        <p className="winner-sub" style={{ fontSize: '1.2rem' }}>Sei il nuovo Signor Yahtzee! 🎉</p>
      </div>
      
      <div className="glass-panel scoreboard" style={{ marginTop: '20px', width: '100%' }}>
        <h3 style={{ color: 'var(--gold)', marginBottom: '20px', textAlign: 'center' }}>📊 Classifica Finale</h3>
        {players
          .map((name, i) => ({ name, score: totalScore(i) }))
          .sort((a, b) => b.score - a.score)
          .map((p, position) => (
            <div key={position} className="score-row" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              marginBottom: '8px',
              borderRadius: '12px',
              background: position === 0 ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: position === 0 ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ 
                  fontWeight: '900', 
                  fontSize: '1.2rem',
                  color: position === 0 ? 'var(--gold)' : 'var(--muted)', 
                  minWidth: '35px' 
                }}>
                  {position === 0 ? '🥇' : position === 1 ? '🥈' : position === 2 ? '🥉' : `${position + 1}°`}
                </span>
                <span className="score-name" style={{ fontWeight: position === 0 ? '900' : 'normal' }}>{p.name}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span className="score-pts" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.score} pt</span>
                
                {/* Visualizzazione bevute durante la partita */}
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--accent)',
                  fontWeight: 'bold',
                  background: 'rgba(245, 158, 11, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap'
                }}>
                  🍻 Bevuti: {drinkStats?.[p.name] || 0} sorsi
                </span>

                {/* Penalità di fine partita */}
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--red)', 
                  fontWeight: 'bold',
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap'
                }}>
                  🔴 PENALITÀ: bevi {position + 1} sorsi
                </span>
              </div>
            </div>
          ))}

        <button
          className="btn btn-primary"
          onClick={resetGame}
          style={{ marginTop: '24px', width: '100%', padding: '16px' }}
        >
          🔄 Torna al Menu Principale
        </button>
      </div>
    </div>
  );
}
