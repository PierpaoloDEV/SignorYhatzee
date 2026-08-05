export default function DrinkPopup({ state }) {
  const { popup, handleClosePopup } = state;

  if (!popup) return null;

  return (
    <div
      className="popup-overlay"
      style={{ cursor: 'default' }}
    >
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <p className="popup-text" style={{ whiteSpace: 'pre-wrap' }}>🍻 {popup}</p>
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
      </div>
    </div>
  );
}
