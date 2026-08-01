import { CELL_TYPES, EVENT_TITLES } from '../constants/cellTypes';

export default function EventModal({ cell, onClose }) {
  const meta = CELL_TYPES[cell.tipo] || CELL_TYPES.special;
  const isAngry = cell.tipo === 'drago' || cell.tipo === 'sfortuna';
  const title = EVENT_TITLES[cell.tipo] || meta.label.toUpperCase();

  return (
    <div
      className={'drago-event-overlay' + (isAngry ? ' drago-event-angry' : '')}
      style={{ '--event-color': meta.color }}
      onClick={onClose}
    >
      <div className="drago-event-content">
        <div className={'drago-event-icon' + (isAngry ? ' drago-event-icon-shake' : '')}>{meta.icon}</div>
        <span className="drago-event-label">{meta.label} · Casella {cell.numero}</span>
        <h2 className="drago-event-title">{title}</h2>
        <p className="drago-event-text">{cell.testo}</p>
        <p className="drago-event-hint">Tocca ovunque per continuare</p>
      </div>
    </div>
  );
}
