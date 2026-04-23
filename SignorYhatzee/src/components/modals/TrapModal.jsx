import { CATEGORIES } from "../../constants";

export default function TrapModal({ state }) {
  const { showTrapModal, isMyTurn, players, player, selectTrap } = state;

  if (!showTrapModal) return null;

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
              {CATEGORIES.filter(c => !["ones", "twos", "threes", "fours", "fives", "sixes"].includes(c.key)).map((cat) => (
                <button
                  key={cat.key}
                  className="cat-btn"
                  onClick={() => selectTrap(cat.key)}
                >
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
            <button
              className="btn btn-outline"
              style={{ marginTop: '20px', width: '100%' }}
              onClick={() => selectTrap(null)}
            >
              Nessuna Trappola
            </button>
          </>
        )}
      </div>
    </div>
  );
}
