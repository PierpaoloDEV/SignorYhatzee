import { CATEGORIES } from "../../constants";

export default function BetModal({ state }) {
  const { showBetModal, setShowBetModal, scores, player, setBet } = state;

  if (!showBetModal) return null;

  return (
    <div className="popup-overlay">
      <div className="popup bet-popup">
        <h2 style={{ marginBottom: '15px' }}>Su cosa vuoi scommettere?</h2>
        <div className="cat-grid" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '5px' }}>
          {CATEGORIES.filter(c => scores[player]?.[c.key] === undefined).map((cat) => (
            <button
              key={cat.key}
              className="cat-btn"
              onClick={() => {
                setBet(cat.key);
                setShowBetModal(false);
              }}
            >
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }} onClick={() => setShowBetModal(false)}>
          Annulla Scommessa
        </button>
      </div>
    </div>
  );
}
