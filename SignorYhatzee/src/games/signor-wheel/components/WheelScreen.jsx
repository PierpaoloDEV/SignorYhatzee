import EventModal from './EventModal';
import RulesModal from './RulesModal';
import { useRef } from 'react';

export default function WheelScreen({ state, onExit }) {
  const {
    players, currentPlayerIndex, spinning, rotation,
    activeResult, eventModalOpen, stripItems, 
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
        className="cs-slider-container glass-panel"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="cs-slider-pointer"></div>
        
        <div 
          className="cs-slider-strip-wrapper"
          style={{ 
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            transform: `translateX(-${rotation}px)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none'
          }}
        >
          <div className="cs-slider-strip">
            {stripItems.map((opt, i) => (
              <div 
                key={i} 
                className="cs-card"
                style={{
                  borderColor: opt.color,
                  boxShadow: `0 4px 15px ${opt.color}40`,
                  background: `linear-gradient(135deg, rgba(255,255,255,0.05), ${opt.color}30)`
                }}
              >
                <span className="cs-card-icon">{opt.icon}</span>
                <span className="cs-card-label" style={{ color: opt.color }}>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          className="btn btn-primary" 
          onClick={spinWheel} 
          disabled={eventModalOpen || spinning}
          style={{ fontSize: '1.2rem', padding: '15px 40px' }}
        >
          {spinning ? 'Apertura in corso...' : 'Apri Cassa'}
        </button>
      </div>

      {eventModalOpen && activeResult && <EventModal result={activeResult} onClose={closeEventModal} />}
    </div>
  );
}
