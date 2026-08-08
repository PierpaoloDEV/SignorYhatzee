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
  { label: 'Bomba', color: '#ff0000', icon: '💣', text: 'Tieni gli occhi chiusi mentre gli altri partecipanti si passano la bomba l\'un l\'altro. Urla \'BOMBA\' in qualsiasi momento per far esplodere la bomba. chi la stava tenendo in quel momento beve.' },
  { label: 'Cambio Nome', color: '#8a2be2', icon: '📛', text: 'Scegli un nuovo nome. D\'ora in poi chiunque ti chiami col tuo vecchio nome deve bere (segnalo nelle regole extra, questo rimane attivo per tutta la partita e per tutti i giocatori a cui esce).', type: 'nameChange' },
  { label: 'Categorie', color: '#ff1493', icon: '📝', text: 'Scegli una categoria, iniziando da te scegli un elemento di quella categoria e a turno continuate. il primo che sbaglia o ripete beve.' },
  { label: 'Chi è più', color: '#00ff7f', icon: '👆', text: 'Di qualcosa che inizi con "chi è più". tutti i partecipanti devono indicare la persona che corrisponde di più alla domanda. chi ha più dita puntate beve.' },
  { label: 'Gemelli', color: '#ff8c00', icon: '👯', text: 'Devi diventare il gemello del giocatore dopo di te fino al tuo prossimo turno. Devi ripetere ogni singolo movimento che sta facendo. Bevi ogni volta che non ripeti un movimento (segnalo nel riepilogo e ricorda dura fino al prossimo turno del giocatore a cui è uscito).', type: 'twin' },
  { label: 'Non ho mai', color: '#4b0082', icon: '🙅‍♂️', text: 'Di qualcosa che non hai mai fatto. Chi l\'ha fatto deve bere.' },
  { label: 'Social', color: '#ff69b4', icon: '🥂', text: 'Brindisi collettivo! Bevono tutti.' },
  { label: 'Vero o Falso', color: '#1e90ff', icon: '🎭', text: 'Di qualcosa, gli altri partecipanti devono indovinare se è vero o falso. Chi sbaglia beve.' },
  { label: 'Zen', color: '#2e8b57', icon: '🧘', text: 'Tieni gli occhi chiusi fino al tuo prossimo turno. Devi bere ogni volta che li apri (segnalo nel riepilogo e ricorda: dura fino al tuo prossimo turno).', type: 'zen' },
  { label: 'Testa o Croce', color: '#ffd700', icon: '💰', text: 'Lancia una moneta (o usa un\'app) e chiama testa o croce. Se sbagli bevi tu, se indovini bevono tutti gli altri!' },
  { label: 'Swing', color: '#ff4500', icon: '💃', text: 'Fai un passo di danza o un gesto. A turno bisogna ripetere tutti i movimenti fatti dai giocatori precedenti e aggiungerne uno nuovo. Il primo che sbaglia o dimentica un movimento beve!' },
  { label: 'Straniero', color: '#8b4513', icon: '🌎', text: 'Cambia lingua o accento fino al tuo prossimo turno. Se sbagli a parlare o te ne dimentichi, bevi!', type: 'foreigner' },
  { label: 'Karaoke', color: '#ff69b4', icon: '🎤', text: 'Inizia a cantare una canzone. Gli altri devono cantare con te la stessa canzone. Chi non canta o non la conosce beve!' },
  { label: 'Frase', color: '#00ced1', icon: '💬', text: 'Dì una parola. Il prossimo deve aggiungere una parola per formare una frase, e così via. Il primo che non trova una parola valida beve!' },
  { label: 'Buzz', color: '#ffff00', icon: '🐝', text: 'Scegli un numero e inizia a contare. Invece di dire il numero 4 (o numeri che lo contengono) bisogna dire "BUZZ". Chi sbaglia beve!' },
  { label: 'Pasta', color: '#f4a460', icon: '🍝', text: 'Fino al tuo prossimo turno devi inserire almeno un formato di pasta in ogni tua frase. Se sbagli o te ne dimentichi, bevi!', type: 'pasta' },
  { label: 'Regola', color: '#dc143c', icon: '📜', text: 'Crea una nuova regola! Chi non la rispetta deve bere. Scrivi la tua regola nel box qui sotto.', type: 'customRule' },
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
  const [nameChangedPlayers, setNameChangedPlayers] = useState([]);
  const [twinPlayerIndex, setTwinPlayerIndex] = useState(null);
  const [zenPlayerIndex, setZenPlayerIndex] = useState(null);
  const [foreignerPlayerIndex, setForeignerPlayerIndex] = useState(null);
  const [pastaPlayerIndex, setPastaPlayerIndex] = useState(null);
  const [customRules, setCustomRules] = useState([]);

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
    const initialItemCount = 30;
    const initialCenterIndex = 15;
    const itemWidth = 150;
    
    setRotation((initialCenterIndex * itemWidth) + (itemWidth / 2));
    
    // Inizializza la striscia con un po' di oggetti casuali
    setStripItems(Array.from({ length: initialItemCount }, () => BASE_WHEEL_OPTIONS[Math.floor(Math.random() * BASE_WHEEL_OPTIONS.length)]));
    
    setSnakeEyesPlayerIndex(null);
    setThumbKingPlayerIndex(null);
    setNameChangedPlayers([]);
    setTwinPlayerIndex(null);
    setZenPlayerIndex(null);
    setForeignerPlayerIndex(null);
    setPastaPlayerIndex(null);
    setCustomRules([]);
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
      if (result.type === 'nameChange') {
        setNameChangedPlayers(prev => Array.from(new Set([...prev, currentPlayerIndex])));
      }
      if (result.type === 'twin') {
        setTwinPlayerIndex(currentPlayerIndex);
      }
      if (result.type === 'zen') {
        setZenPlayerIndex(currentPlayerIndex);
      }
      if (result.type === 'foreigner') {
        setForeignerPlayerIndex(currentPlayerIndex);
      }
      if (result.type === 'pasta') {
        setPastaPlayerIndex(currentPlayerIndex);
      }
    }, ROLL_ANIM_MS);
  }, [players.length, currentPlayerIndex, eventModalOpen, spinning, currentWheelOptions]);

  const closeEventModal = useCallback((eventData = null) => {
    setEventModalOpen(false);
    
    if (eventData && eventData.customRule) {
      setCustomRules(prev => [...prev, { rule: eventData.customRule, author: players[currentPlayerIndex].name, color: players[currentPlayerIndex].color }]);
    }
    
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    if (nextIndex === twinPlayerIndex) {
      setTwinPlayerIndex(null);
    }
    if (nextIndex === zenPlayerIndex) {
      setZenPlayerIndex(null);
    }
    if (nextIndex === foreignerPlayerIndex) {
      setForeignerPlayerIndex(null);
    }
    if (nextIndex === pastaPlayerIndex) {
      setPastaPlayerIndex(null);
    }
    
    setCurrentPlayerIndex(nextIndex);
  }, [players.length, currentPlayerIndex, twinPlayerIndex, zenPlayerIndex, foreignerPlayerIndex, pastaPlayerIndex]);

  const resetGame = useCallback(() => {
    setPhase('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setSpinning(false);
    setActiveResult(null);
    setEventModalOpen(false);
    
    const initialItemCount = 30;
    const initialCenterIndex = 15;
    const itemWidth = 150;
    
    setRotation((initialCenterIndex * itemWidth) + (itemWidth / 2));
    setSnakeEyesPlayerIndex(null);
    setThumbKingPlayerIndex(null);
    setNameChangedPlayers([]);
    setTwinPlayerIndex(null);
    setZenPlayerIndex(null);
    setForeignerPlayerIndex(null);
    setPastaPlayerIndex(null);
    setCustomRules([]);
  }, []);

  return {
    phase, playerNames, setPlayerNames, players, currentPlayerIndex,
    spinning, rotation, activeResult, eventModalOpen, currentWheelOptions,
    snakeEyesPlayerIndex, thumbKingPlayerIndex, stripItems, nameChangedPlayers,
    twinPlayerIndex, zenPlayerIndex, foreignerPlayerIndex, pastaPlayerIndex,
    customRules,
    startGame, spinWheel, closeEventModal, resetGame,
    MAX_PLAYERS, MIN_PLAYERS
  };
}
