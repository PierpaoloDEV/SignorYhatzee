export default function DrinkPopup({ state }) {
  const { popup, handleClosePopup, isMyTurn, players, player } = state;

  if (!popup) return null;

  return (
    <div
      className="popup-overlay"
      onClick={isMyTurn ? handleClosePopup : undefined}
      style={{ cursor: isMyTurn ? 'pointer' : 'default' }}
    >
      <div className="popup">
        <p className="popup-text" style={{ whiteSpace: 'pre-wrap' }}>🍻 {popup}</p>
        <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.8, textAlign: 'center' }}>
          {isMyTurn
            ? '(Tocca ovunque per continuare)'
            : `⏳ In attesa di ${players?.[player] ?? '...'} per continuare...`}
        </p>
      </div>
    </div>
  );
}
