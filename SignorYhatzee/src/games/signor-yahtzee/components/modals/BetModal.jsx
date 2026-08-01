import { CATEGORIES } from "../../constants";

export default function BetModal({ state }) {
  const { showBetModal, scores, player, betMode, activeRules, isMyTurn, players, placeBet } = state;

  if (!showBetModal) return null;

  const isBetMandatory = betMode === "OBBLIGATORIA";

  return (
    <div className="popup-overlay">
      <div className="popup bet-popup">
        <h2 style={{ marginBottom: '15px' }}>Su cosa vuoi scommettere?</h2>

        {!isMyTurn ? (
          <p style={{ textAlign: 'center', margin: '30px 0', color: 'var(--muted)', fontSize: '0.95rem' }}>
            ⏳ In attesa di <b>{players?.[player] ?? '...'}</b> per piazzare la scommessa...
          </p>
        ) : (
          <>
            <div className="cat-grid" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '5px' }}>
              {CATEGORIES.filter(c => scores[player]?.[c.key] === undefined).map((cat) => (
                <button
                  key={cat.key}
                  className="cat-btn"
                  onClick={() => placeBet(cat.key)}
                >
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>

            {!isBetMandatory && (
              <button
                className="btn btn-outline"
                style={{ marginTop: '20px', width: '100%' }}
                onClick={() => placeBet(null)}
              >
                Annulla Scommessa
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
