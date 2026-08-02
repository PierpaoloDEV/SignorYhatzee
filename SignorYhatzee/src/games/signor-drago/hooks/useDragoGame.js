import { useCallback, useState } from 'react';
import { BOARD_SIZE, MAX_PLAYERS, MIN_PLAYERS, PAWN_COLORS, ROLL_ANIM_MS } from '../constants';
import { CELLS } from '../constants/cells';
import { applyLanding } from '../utils/effects';

export function useDragoGame() {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing'
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [players, setPlayers] = useState([]); // [{ name, color, position }]
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [lastRoll, setLastRoll] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [activeCell, setActiveCell] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const startGame = useCallback(() => {
    const names = playerNames.map((n) => n.trim()).filter(Boolean).slice(0, MAX_PLAYERS);
    if (names.length < MIN_PLAYERS) return;

    setPlayers(names.map((name, i) => ({
      name,
      color: PAWN_COLORS[i % PAWN_COLORS.length],
      position: 0,
    })));
    setCurrentPlayerIndex(0);
    setLastRoll(null);
    setRolling(false);
    setActiveCell(null);
    setEventModalOpen(false);
    setPhase('playing');
  }, [playerNames]);

  // L'animazione del dado gira per prima; solo al termine la pedina avanza
  // davvero e si scopre su cosa è atterrata.
  const rollDice = useCallback(() => {
    if (eventModalOpen || rolling || players.length === 0) return;

    setRolling(true);
    setTimeout(() => {
      const roll = 1 + Math.floor(Math.random() * 6);
      const landedIndex = Math.min(players[currentPlayerIndex].position + roll, BOARD_SIZE - 1);
      const landedCell = CELLS[landedIndex];

      setLastRoll(roll);
      setPlayers((prev) => applyLanding(prev, currentPlayerIndex, landedIndex, landedCell));
      setActiveCell(landedCell);
      setEventModalOpen(true);
      setRolling(false);
    }, ROLL_ANIM_MS);
  }, [currentPlayerIndex, players, eventModalOpen, rolling]);

  const closeEventModal = useCallback(() => {
    setEventModalOpen(false);
    setCurrentPlayerIndex((i) => (i + 1) % players.length);
  }, [players.length]);

  const resetGame = useCallback(() => {
    setPhase('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setLastRoll(null);
    setRolling(false);
    setActiveCell(null);
    setEventModalOpen(false);
  }, []);

  return {
    phase,
    playerNames,
    setPlayerNames,
    players,
    currentPlayerIndex,
    lastRoll,
    rolling,
    activeCell,
    eventModalOpen,
    startGame,
    rollDice,
    closeEventModal,
    resetGame,
  };
}
