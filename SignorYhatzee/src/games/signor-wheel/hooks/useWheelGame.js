import { useCallback, useState } from 'react';

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;
const PAWN_COLORS = ['#ff4d4d', '#33cc33', '#3399ff', '#ffcc00', '#9933ff', '#ff9933', '#ff66b2', '#00cccc'];
const ROLL_ANIM_MS = 4000;

const BASE_WHEEL_OPTIONS = [
  { label: 'Bevi 1', color: '#ff4d4d', icon: '🍺', text: 'Bevi 1 sorso!' },
  { label: 'Bevi 2', color: '#ff9933', icon: '🍻', text: 'Bevi 2 sorsi!' },
  { label: 'Bevi 3', color: '#ffcc00', icon: '🥃', text: 'Bevi 3 sorsi!' },
  { label: 'Dai 1', color: '#33cc33', icon: '🎯', text: 'Distribuisci 1 sorso!' },
  { label: 'Dai 2', color: '#3399ff', icon: '🏹', text: 'Distribuisci 2 sorsi!' },
  { label: 'Dai 3', color: '#9933ff', icon: '🔫', text: 'Distribuisci 3 sorsi!' },
  { label: 'Sinistra', color: '#ff66b2', icon: '👈', text: 'Beve il giocatore alla tua sinistra!' },
  { label: 'Destra', color: '#00cccc', icon: '👉', text: 'Beve il giocatore alla tua destra!' },
  { label: 'Occhi Serpente', color: '#8b0000', icon: '🐍', text: 'Adesso hai gli occhi di serpente. Se incroci lo sguardo con un partecipante, lui/lei deve bere. Dura finché non li riceve un altro.', type: 'snake' },
  { label: 'Re del Pollice', color: '#b8860b', icon: '👍', text: 'Sei il re del pollice. Metti il pollice sul tavolo quando vuoi: l\'ultimo a farlo beve! Resti re finché non lo diventa un altro.', type: 'thumb' },
];

function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function useWheelGame() {
  const [phase, setPhase] = useState('setup');
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentWheelOptions, setCurrentWheelOptions] = useState(BASE_WHEEL_OPTIONS);
  const [snakeEyesPlayerIndex, setSnakeEyesPlayerIndex] = useState(null);
  const [thumbKingPlayerIndex, setThumbKingPlayerIndex] = useState(null);

  const startGame = useCallback(() => {
    const names = playerNames.map((n) => n.trim()).filter(Boolean).slice(0, MAX_PLAYERS);
    if (names.length < MIN_PLAYERS) return;

    setPlayers(names.map((name, i) => ({
      name,
      color: PAWN_COLORS[i % PAWN_COLORS.length],
    })));
    
    setCurrentWheelOptions(shuffleArray(BASE_WHEEL_OPTIONS));
    setCurrentPlayerIndex(0);
    setSpinning(false);
    setActiveResult(null);
    setEventModalOpen(false);
    setRotation(0);
    setSnakeEyesPlayerIndex(null);
    setThumbKingPlayerIndex(null);
    setPhase('playing');
  }, [playerNames]);

  const spinWheel = useCallback(() => {
    if (eventModalOpen || spinning || players.length === 0) return;

    setSpinning(true);
    
    // Assicura che non esca MAI lo stesso risultato due volte di fila
    let resultIndex;
    let result;
    do {
      resultIndex = Math.floor(Math.random() * currentWheelOptions.length);
      result = currentWheelOptions[resultIndex];
    } while (activeResult && result.label === activeResult.label && currentWheelOptions.length > 1);
    
    const segmentAngle = 360 / currentWheelOptions.length;
    
    // Più giri extra per far sembrare il lancio più "veloce/casuale"
    const extraSpins = 8 + Math.floor(Math.random() * 8); // 8 to 15 full spins
    
    const segmentCenter = (resultIndex * segmentAngle) + (segmentAngle / 2);
    const targetOffset = 360 - segmentCenter;
    
    const randomOffset = Math.floor(Math.random() * (segmentAngle * 0.8)) - (segmentAngle * 0.4); 
    
    const totalNewAngle = (extraSpins * 360) + targetOffset + randomOffset;

    
    console.log(`Spinning: resultIndex=${resultIndex}, label=${result.label}, totalNewAngle=${totalNewAngle}`);

    setRotation(prev => {
      const currentMod = prev % 360;
      // FIX: If prev is negative, % operator is negative. Use absolute modulo.
      const safeMod = ((prev % 360) + 360) % 360; 
      const baseRotation = prev - safeMod;
      const newRot = baseRotation + totalNewAngle;
      console.log(`Rotation: prev=${prev}, base=${baseRotation}, new=${newRot}`);
      return newRot;
    });

    setTimeout(() => {
      setActiveResult(result);
      setEventModalOpen(true);
      setSpinning(false);
      
      if (result.type === 'snake') {
        setSnakeEyesPlayerIndex(currentPlayerIndex);
      }
      if (result.type === 'thumb') {
        setThumbKingPlayerIndex(currentPlayerIndex);
      }
    }, ROLL_ANIM_MS);
  }, [players.length, currentPlayerIndex, eventModalOpen, spinning, currentWheelOptions]);

  const closeEventModal = useCallback(() => {
    setEventModalOpen(false);
    setCurrentPlayerIndex((i) => (i + 1) % players.length);
  }, [players.length]);

  const resetGame = useCallback(() => {
    setPhase('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setSpinning(false);
    setActiveResult(null);
    setEventModalOpen(false);
    setRotation(0);
    setSnakeEyesPlayerIndex(null);
    setThumbKingPlayerIndex(null);
  }, []);

  return {
    phase, playerNames, setPlayerNames, players, currentPlayerIndex,
    spinning, rotation, activeResult, eventModalOpen, currentWheelOptions,
    snakeEyesPlayerIndex, thumbKingPlayerIndex,
    startGame, spinWheel, closeEventModal, resetGame,
    MAX_PLAYERS, MIN_PLAYERS
  };
}
