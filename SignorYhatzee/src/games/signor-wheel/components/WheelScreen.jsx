import EventModal from './EventModal';
import RulesModal from './RulesModal';

export default function WheelScreen({ state, onExit }) {
  const {
    players, currentPlayerIndex, spinning, rotation,
    activeResult, eventModalOpen, currentWheelOptions, 
    snakeEyesPlayerIndex, thumbKingPlayerIndex, 
    spinWheel, closeEventModal
  } = state;

  const currentPlayer = players[currentPlayerIndex];

  // Calculate conic gradient for the wheel
  const segmentAngle = 360 / currentWheelOptions.length;
  const conicGradient = currentWheelOptions.map((opt, i) => {
    const start = i * segmentAngle;
    const end = (i + 1) * segmentAngle;
    return `${opt.color} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="drago-board-shell wheel-board-shell">
      <button className="back-btn" onClick={onExit}>← Altri giochi</button>
      <h1 className="drago-title">🎡 Signor Wheel</h1>

      {currentPlayer && (
        <div className="drago-turn-banner glass-panel" style={{ borderColor: currentPlayer.color }}>
          <span className="drago-turn-dot" style={{ background: currentPlayer.color }} />
          Turno di <strong>{currentPlayer.name}</strong>
        </div>
      )}

      <RulesModal state={state} />

      <div className="wheel-container">
        <div className="wheel-pointer">▼</div>
        <div 
          className="wheel" 
          style={{ 
            background: `conic-gradient(${conicGradient})`,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          {currentWheelOptions.map((opt, i) => {
            const rotationAngle = (i * segmentAngle) + (segmentAngle / 2);
            return (
              <div 
                key={i} 
                className="wheel-segment-text"
                style={{
                  transform: `rotate(${rotationAngle}deg) translateY(-120px)` 
                }}
              >
                <div className="wheel-segment-content">
                  <span className="segment-label">{opt.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="drago-controls glass-panel">
        <button className="btn btn-primary" style={{ flex: 1, fontSize: '1.2rem', padding: '15px' }} onClick={spinWheel} disabled={eventModalOpen || spinning}>
          {spinning ? '⏳ Gira...' : '🎡 Gira la ruota'}
        </button>
      </div>

      {eventModalOpen && activeResult && <EventModal result={activeResult} onClose={closeEventModal} />}
    </div>
  );
}
