import { DICE_FACES } from '../constants';

export default function RollPopup({ player, lastRoll, rolling, resolving, onRoll, onClose }) {
  if (!player) return null;

  const handleClose = () => {
    if (resolving) return; // non si chiude mentre il lancio è in corso/mostra il risultato
    onClose();
  };

  return (
    <div className="drago-roll-overlay" onClick={handleClose}>
      <div
        className="drago-roll-content"
        style={{ '--event-color': player.color }}
        onClick={(e) => e.stopPropagation()}
      >
        {!resolving && (
          <button className="drago-roll-close" onClick={handleClose} aria-label="Chiudi">✕</button>
        )}

        <span className="drago-turn-dot drago-roll-dot" style={{ background: player.color }} />
        <p className="drago-roll-turn">Turno di <strong>{player.name}</strong></p>

        <div className={'drago-die drago-die-lg' + (rolling ? ' rolling' : '')}>
          {lastRoll ? DICE_FACES[lastRoll] : '🎲'}
        </div>

        <button className="btn btn-primary drago-roll-btn" onClick={onRoll} disabled={resolving}>
          {rolling ? '⏳ Lancio...' : '🎲 Tira il dado'}
        </button>
      </div>
    </div>
  );
}
