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
  const [rotation, setRotation] = useState(0); // This will now represent the translate offset
  const [currentWheelOptions, setCurrentWheelOptions] = useState(BASE_WHEEL_OPTIONS);
  const [stripItems, setStripItems] = useState([]);
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
    
    // Inizializza la striscia con un po' di oggetti casuali
    setStripItems(Array.from({ length: 15 }, () => BASE_WHEEL_OPTIONS[Math.floor(Math.random() * BASE_WHEEL_OPTIONS.length)]));
    
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
    
    const itemWidth = 150; // La larghezza in pixel di ogni carta
    const winningIndex = 65; // L'oggetto vincente sarà 65 carte più avanti
    const totalStripLength = 80;
    
    // Crea la nuova striscia da appendere
    const newStrip = Array.from({ length: totalStripLength }, (_, i) => {
      if (i === winningIndex) return result;
      return currentWheelOptions[Math.floor(Math.random() * currentWheelOptions.length)];
    });
    
    // Calcoliamo l'indice assoluto nella striscia cumulativa
    const currentLength = stripItems.length;
    const absoluteWinningIndex = currentLength + winningIndex;

    // Aggiungiamo alla striscia esistente (così l'offset precedente resta valido e l'animazione parte fluida)
    setStripItems(prev => [...prev, ...newStrip]);

    const randomPixelOffset = Math.floor(Math.random() * (itemWidth - 10)) - (itemWidth / 2 - 5);
    const targetOffset = (absoluteWinningIndex * itemWidth) + (itemWidth / 2) + randomPixelOffset;

    setRotation(targetOffset);

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
    snakeEyesPlayerIndex, thumbKingPlayerIndex, stripItems,
    startGame, spinWheel, closeEventModal, resetGame,
    MAX_PLAYERS, MIN_PLAYERS
  };
}
