export default function GameOverScreen({ state }) {
  const { isGameOver, getWinner, players, totalScore, resetGame } = state;

  if (!isGameOver()) return null;

  return (
    <div className="app game-over-screen">
      <h1 className="title">🏆 Partita finita!</h1>
      <p className="winner-label">Vince...</p>
      <p className="winner-name">{getWinner()}</p>
      <p className="winner-sub">sei il Signor Yahtzee 🎉</p>
      
      <div className="scoreboard" style={{ marginTop: '30px' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '15px' }}>🏆 Classifica & Penitenze</h3>
        {players
          .map((name, i) => ({ name, score: totalScore(i) }))
          .sort((a, b) => b.score - a.score)
          .map((p, position) => (
            <div key={position} className="score-row" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              background: position === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--gold)', minWidth: '30px' }}>
                  {position + 1}°
                </span>
                <span className="score-name">{p.name}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="score-pts">{p.score} pt</span>
                <span style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--accent)', 
                  fontWeight: 'bold',
                  marginTop: '4px'
                }}>
                  🍺 BEVI {position + 1}
                </span>
              </div>
            </div>
          ))}
      </div>

      <button
        className="btn btn-outline"
        onClick={resetGame}
        style={{ marginTop: '40px', width: '100%' }}
      >
        🔄 Nuova partita
      </button>
    </div>
  );
}
