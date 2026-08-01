export default function DrinkPopup({ state }) {
  const { popup, popupDrinkers, handleClosePopup, isMyTurn, players, player } = state;

  if (!popup) return null;

  // Build the "Bevono:" header from popupDrinkers
  const drinkersHeader = (() => {
    if (!popupDrinkers || Object.keys(popupDrinkers).length === 0) return null;

    const totalSips = Object.values(popupDrinkers).reduce((a, b) => a + b, 0);
    if (totalSips < 2) return null;

    const entries = Object.entries(popupDrinkers)
      .map(([name, count]) => count > 1 ? `${name} x${count}` : name);

    return `🍻 Bevono: ${entries.join(', ')}`;
  })();

  return (
    <div
      className="popup-overlay"
      onClick={isMyTurn ? handleClosePopup : undefined}
      style={{ cursor: isMyTurn ? 'pointer' : 'default' }}
    >
      <div className="popup">
        {drinkersHeader && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid var(--gold)',
            borderRadius: '10px',
            padding: '10px 16px',
            marginBottom: '16px',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--gold)',
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            {drinkersHeader}
          </div>
        )}
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
