export default function DrinkPopup({ state }) {
  const { popup, popupDrinkers, handleClosePopup, isMyTurn, players, player } = state;

  if (!popup) return null;

  // Build the "Beve:" / "Bevono:" header from popupDrinkers
  const drinkersHeader = (() => {
    if (!popupDrinkers || Object.keys(popupDrinkers).length === 0) return null;

    const entries = Object.entries(popupDrinkers)
      .map(([name, count]) => count > 1 ? `${name} x${count}` : name);

    if (entries.length === 0) return null;

    const prefix = entries.length === 1 && !entries[0].includes('x') ? '🍻 Beve:' : '🍻 Bevono:';
    return `${prefix} ${entries.join(', ')}`;
  })();

  return (
    <div
      className="popup-overlay"
      style={{ cursor: 'default' }}
    >
      <div className="popup" onClick={(e) => e.stopPropagation()}>
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
        {isMyTurn ? (
          <button
            onClick={handleClosePopup}
            style={{
              marginTop: '20px',
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 700,
              background: 'var(--gold)',
              color: '#111',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              transition: 'opacity 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ✅ Continua
          </button>
        ) : (
          <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.8, textAlign: 'center' }}>
            ⏳ In attesa di {players?.[player] ?? '...'} per continuare...
          </p>
        )}
      </div>
    </div>
  );
}
