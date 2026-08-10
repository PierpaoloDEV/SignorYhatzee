import { useMemo, useState } from 'react';
import { BOARD_COLS, BOARD_ROWS, DICE_FACES, GAME_TITLE } from '../constants';
import { CELLS } from '../constants/cells';
import { CELL_TYPES } from '../constants/cellTypes';
import { buildCellWalls, buildRectSpiral } from '../utils/boardHelpers';
import ConfirmModal from './ConfirmModal';
import EventModal from './EventModal';
import RollPopup from './RollPopup';

// "thin" = confine tra due caselle consecutive del percorso (poco visibile,
// il corridoio prosegue). "thick" = il vero muro che disegna la spirale.
// Colori diversi per i due casi rendono subito leggibile la forma del percorso.
const WALL_WIDTH = { thin: '1px', thick: '2.5px' };
const WALL_COLOR = { thin: 'rgba(148, 163, 184, .16)', thick: '#fb923c' };

export default function BoardScreen({ state, onExit }) {
  const {
    players, currentPlayerIndex, lastRoll, rolling, resolving,
    activeCell, eventModalOpen, rollDice, closeEventModal, resetGame,
  } = state;

  const [rollPopupOpen, setRollPopupOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [inspectedCell, setInspectedCell] = useState(null);

  const modalOpen = eventModalOpen || rollPopupOpen || resetConfirmOpen || !!inspectedCell;

  const positions = useMemo(() => buildRectSpiral(BOARD_ROWS, BOARD_COLS), []);
  const walls = useMemo(() => buildCellWalls(BOARD_ROWS, BOARD_COLS, positions), [positions]);
  const currentPlayer = players[currentPlayerIndex];
  const lastCellIndex = CELLS.length - 1;

  const pawnsOnCell = (cellIndex) => players.filter((p) => p.position === cellIndex);

  const handleCloseEvent = () => {
    closeEventModal();
    setRollPopupOpen(false);
  };

  return (
    <div className="drago-board-shell">
      <button className="back-btn" onClick={onExit}>← Altri giochi</button>
      <button className="drago-reset-btn" onClick={() => setResetConfirmOpen(true)} aria-label="Nuova partita" title="Nuova partita">↺</button>
      <h1 className="drago-title">🐉 {GAME_TITLE}</h1>

      <div className="drago-grid-wrap">
        <div
          className="drago-grid"
          style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`, gridTemplateRows: `repeat(${BOARD_ROWS}, 1fr)` }}
        >
          {CELLS.map((cell, idx) => {
            const pos = positions[idx];
            const meta = CELL_TYPES[cell.tipo] || CELL_TYPES.special;
            const occupants = pawnsOnCell(idx);
            const isCenter = idx === lastCellIndex;
            const w = walls[idx];

            const cellStyle = { gridColumn: pos.col + 1, gridRow: pos.row + 1 };
            if (!isCenter) {
              cellStyle.borderTopWidth = WALL_WIDTH[w.top];
              cellStyle.borderRightWidth = WALL_WIDTH[w.right];
              cellStyle.borderBottomWidth = WALL_WIDTH[w.bottom];
              cellStyle.borderLeftWidth = WALL_WIDTH[w.left];
              cellStyle.borderTopColor = WALL_COLOR[w.top];
              cellStyle.borderRightColor = WALL_COLOR[w.right];
              cellStyle.borderBottomColor = WALL_COLOR[w.bottom];
              cellStyle.borderLeftColor = WALL_COLOR[w.left];
            }

            return (
              <div
                key={cell.numero}
                className={'drago-grid-cell' + (isCenter ? ' drago-grid-cell-center' : '')}
                style={cellStyle}
                title={`${cell.numero} · ${cell.nome}`}
                onClick={() => !modalOpen && setInspectedCell(cell)}
              >
                <span className="drago-grid-icon">{isCenter ? '🐉' : meta.icon}</span>
                <span className="drago-grid-number">{cell.numero}</span>
                {occupants.length > 0 && (
                  <div className="drago-grid-pawns">
                    {occupants.map((p) => (
                      <span key={p.name} className="drago-pawn" style={{ background: p.color }} title={p.name} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="drago-bottom-row">
        <div className="drago-controls glass-panel">
          <div className={'drago-die' + (rolling ? ' rolling' : '')}>
            {lastRoll ? DICE_FACES[lastRoll] : '🎲'}
          </div>
          <button className="btn btn-primary" onClick={rollDice} disabled={modalOpen || resolving}>
            {rolling ? '⏳ Lancio...' : '🎲 Tira il dado'}
          </button>
        </div>

        {currentPlayer && (
          <div className="drago-turn-banner glass-panel" style={{ borderColor: currentPlayer.color }}>
            <span className="drago-turn-dot" style={{ background: currentPlayer.color }} />
            Turno di <strong>{currentPlayer.name}</strong>
          </div>
        )}
      </div>

      {!modalOpen && currentPlayer && (
        <button
          className="drago-fab"
          style={{ background: currentPlayer.color }}
          onClick={() => setRollPopupOpen(true)}
          aria-label="Tira il dado"
        >
          🎲
        </button>
      )}

      {rollPopupOpen && !eventModalOpen && (
        <RollPopup
          player={currentPlayer}
          lastRoll={lastRoll}
          rolling={rolling}
          resolving={resolving}
          onRoll={rollDice}
          onClose={() => setRollPopupOpen(false)}
        />
      )}

      {eventModalOpen && activeCell && <EventModal cell={activeCell} onClose={handleCloseEvent} />}

      {!eventModalOpen && inspectedCell && (
        <EventModal cell={inspectedCell} onClose={() => setInspectedCell(null)} />
      )}

      {resetConfirmOpen && (
        <ConfirmModal
          title="Nuova partita?"
          text="La partita in corso andrà persa."
          confirmLabel="Sì, nuova partita"
          cancelLabel="Annulla"
          extraLabel="← Altri giochi"
          onConfirm={() => { setResetConfirmOpen(false); resetGame(); }}
          onCancel={() => setResetConfirmOpen(false)}
          onExtra={onExit}
        />
      )}
    </div>
  );
}
