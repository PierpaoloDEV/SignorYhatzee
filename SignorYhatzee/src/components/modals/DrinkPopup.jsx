export default function DrinkPopup({ state }) {
  const { popup, handleClosePopup } = state;

  if (!popup) return null;

  return (
    <div className="popup-overlay" onClick={handleClosePopup} style={{ cursor: 'pointer' }}>
      <div className="popup">
        <p className="popup-text" style={{ whiteSpace: 'pre-wrap' }}>🍻 {popup}</p>
        <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.8, textAlign: 'center' }}>(Tocca ovunque per continuare)</p>
      </div>
    </div>
  );
}
