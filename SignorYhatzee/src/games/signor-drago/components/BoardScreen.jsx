import { useMemo } from 'react';
import { BOARD_COLS, BOARD_ROWS, DICE_FACES, GAME_TITLE } from '../constants';
import { CELLS } from '../constants/cells';
import { CELL_TYPES } from '../constants/cellTypes';
import { buildCellWalls, buildRectSpiral } from '../utils/boardHelpers';
import EventModal from './EventModal';

const WALL_WIDTH = { thin: '1.5px', thick: '4px' };

export default function BoardScreen({ state, onExit }) {
  const {
    players, currentPlayerIndex, lastRoll, rolling,
    activeCell, eventModalOpen, rollDice, closeEventModal, resetGame,
  } = state;

  const positions = useMemo(() => buildRectSpiral(BOARD_ROWS, BOARD_COLS), []);
  const walls = useMemo(() => buildCellWalls(BOARD_ROWS, BOARD_COLS, positions), [positions]);
  const currentPlayer = players[currentPlayerIndex];
  const lastCellIndex = CELLS.length - 1;

  const pawnsOnCell = (cellIndex) => players.filter((p) => p.position === cellIndex);

  return (
    <div className="drago-board-shell">
      <button className="back-btn" onClick={onExit}>← Altri giochi</button>
      <h1 className="drago-title">🐉 {GAME_TITLE}</h1>

      {currentPlayer && (
        <div className="drago-turn-banner glass-panel" style={{ borderColor: currentPlayer.color }}>
          <span className="drago-turn-dot" style={{ background: currentPlayer.color }} />
          Turno di <strong>{currentPlayer.name}</strong>
        </div>
      )}

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
            }

            return (
              <div
                key={cell.numero}
                className={'drago-grid-cell' + (isCenter ? ' drago-grid-cell-center' : '')}
                style={cellStyle}
                title={`${cell.numero} · ${cell.nome}`}
              >
                <span className="drago-grid-icon">{isCenter ? '🐉' : meta.icon}</span>
                <span className="drago-grid-number">{cell.numero}</span>
                <span className="drago-grid-name">{cell.nome}</span>
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

      <div className="drago-controls glass-panel">
        <div className={'drago-die' + (rolling ? ' rolling' : '')}>
          {lastRoll ? DICE_FACES[lastRoll] : '🎲'}
        </div>
        <button className="btn btn-primary" onClick={rollDice} disabled={eventModalOpen || rolling}>
          {rolling ? '⏳ Lancio...' : '🎲 Tira il dado'}
        </button>
        <button className="btn btn-outline" onClick={resetGame}>Nuova partita</button>
      </div>

      {eventModalOpen && activeCell && <EventModal cell={activeCell} onClose={closeEventModal} />}
    </div>
  );
}
