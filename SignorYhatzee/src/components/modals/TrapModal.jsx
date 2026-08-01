import { useState, useEffect } from "react";
import { CATEGORIES } from "../../constants";

export default function TrapModal({ state }) {
  const { showTrapModal, isMyTurn, players, player, scores, selectTrap } = state;
  const [minimized, setMinimized] = useState(false);

  // Reset minimized state whenever the trap modal opens
  useEffect(() => {
    if (showTrapModal) setMinimized(false);
  }, [showTrapModal]);

  if (!showTrapModal) return null;

  // Filter: exclude upper section + categories where ALL players already scored
  const trapCategories = CATEGORIES
    .filter(c => !["ones", "twos", "threes", "fours", "fives", "sixes"].includes(c.key))
    .filter(c => {
      // Keep only categories where at least one player hasn't scored yet
      return scores.some(s => s[c.key] === undefined);
    });

  if (minimized) {
    return (
      <button
        className="btn btn-primary"
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 101,
          padding: '14px 28px',
          fontSize: '1rem',
          boxShadow: '0 4px 24px rgba(239,68,68,0.4)',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          animation: 'pulse-animation 2s infinite'
        }}
      >
        🚨 Piazza Trappola
      </button>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup bet-popup">
        <h2 style={{ marginBottom: '15px', color: 'var(--red)' }}>🚨 TRAPPOLA!</h2>

        {!isMyTurn ? (
          <p style={{ textAlign: 'center', margin: '30px 0', color: 'var(--muted)', fontSize: '0.95rem' }}>
            ⏳ In attesa di <b>{players?.[player] ?? '...'}</b> per scegliere la trappola...
          </p>
        ) : (
          <>
            <p style={{ marginBottom: '15px', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Hai fatto Poker! Scegli una combinazione. Il prossimo che ci farà punti berrà!
            </p>
            <div className="cat-grid" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '5px' }}>
              {trapCategories.map((cat) => (
                <button
                  key={cat.key}
                  className="cat-btn"
                  onClick={() => selectTrap(cat.key)}
                >
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setMinimized(true)}
              >
                👀 Vedi Tabellone
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => selectTrap(null)}
              >
                Nessuna Trappola
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
