import { BOARD_SIZE } from '../constants';

const clamp = (pos) => Math.max(0, Math.min(BOARD_SIZE - 1, pos));

// Applica l'atterraggio del giocatore corrente sulla casella `landedIndex`
// (0-based) e, se quella casella ha un `effect` di spostamento, lo esegue.
export function applyLanding(players, currentIdx, landedIndex, cell) {
  const next = players.map((p, i) => (i === currentIdx ? { ...p, position: landedIndex } : { ...p }));
  const effect = cell?.effect;
  if (!effect) return next;

  switch (effect.type) {
    case 'moveTo':
      next[currentIdx] = { ...next[currentIdx], position: clamp(effect.value - 1) };
      return next;

    case 'moveBy':
      next[currentIdx] = { ...next[currentIdx], position: clamp(next[currentIdx].position + effect.value) };
      return next;

    case 'swapWithLast': {
      const others = next.map((p, i) => ({ p, i })).filter((o) => o.i !== currentIdx);
      if (others.length === 0) return next;
      const lowest = others.reduce((min, o) => (o.p.position < min.p.position ? o : min), others[0]);
      const selfPos = next[currentIdx].position;
      next[lowest.i] = { ...next[lowest.i], position: selfPos };
      next[currentIdx] = { ...next[currentIdx], position: lowest.p.position };
      return next;
    }

    case 'stealFromLeader': {
      const others = next.map((p, i) => ({ p, i })).filter((o) => o.i !== currentIdx);
      if (others.length === 0) return next;
      const leader = others.reduce((max, o) => (o.p.position > max.p.position ? o : max), others[0]);
      next[leader.i] = { ...next[leader.i], position: clamp(next[leader.i].position - effect.value) };
      next[currentIdx] = { ...next[currentIdx], position: clamp(next[currentIdx].position + effect.value) };
      return next;
    }

    case 'allMoveBy':
      return next.map((p) => ({ ...p, position: clamp(p.position + effect.value) }));

    default:
      return next;
  }
}
