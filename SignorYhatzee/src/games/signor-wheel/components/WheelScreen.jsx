import EventModal from './EventModal';
import RulesModal from './RulesModal';
import { useRef } from 'react';

export default function WheelScreen({ state, onExit }) {
  const {
    players, currentPlayerIndex, spinning, rotation,
    activeResult, eventModalOpen, currentWheelOptions, 
    snakeEyesPlayerIndex, thumbKingPlayerIndex, 
    spinWheel, closeEventModal
  } = state;

  const currentPlayer = players[currentPlayerIndex];
  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30) {
      spinWheel();
    }
  };

  const handleMouseDown = (e) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e) => {
    if (!touchStartRef.current) return;
    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30) {
      spinWheel();
    }
  };

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

      <div 
        className="wheel-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="wheel-pointer">▼</div>
        
        <button 
          className="wheel-center-btn" 
          onClick={spinWheel} 
          disabled={eventModalOpen || spinning}
        >
          {spinning ? '...' : 'Gira'}
        </button>

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
                  transform: `rotate(${rotationAngle}deg)`
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

      {eventModalOpen && activeResult && <EventModal result={activeResult} onClose={closeEventModal} />}
    </div>
  );
}
