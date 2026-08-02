import { useState, useEffect, useRef } from "react";
import { useGameState } from "./hooks/useGameState";
import { useMultiplayer } from "./hooks/useMultiplayer";
import SetupScreen from "./components/SetupScreen";
import GameScreen from "./components/GameScreen";
import GameOverScreen from "./components/GameOverScreen";
import LobbyScreen from "./components/LobbyScreen";
import "./yahtzee.css";

export default function YahtzeeGame({ onExit }) {
  // 1. Tutti gli Hook dichiarati per primi e INCONDIZIONATAMENTE
  const [appMode, setAppMode] = useState("lobby"); // lobby, local, online
  const multiplayer = useMultiplayer();
  const gameState = useGameState(appMode === "online" ? multiplayer : null);

  // 2. Logica di avvio partita Host
  const handleHostStart = () => {
    if (multiplayer?.isHost) {
      const names = multiplayer.players.map(p => p.name);
      const ids = multiplayer.players.map(p => p.id);
      gameState.setPlayerNames(names);
      gameState.startGame(names, ids);
    }
  };

  // Ref che punta sempre alle funzioni più recenti di gameState, senza causare re-render
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; });

  // 3a. Transizione appMode -> 'online' quando la partita inizia
  useEffect(() => {
    if (multiplayer.roomCode && !gameState.setup && appMode !== "online") {
      console.log('[APP] Transitioning appMode to online');
      setAppMode("online");
    }
  }, [appMode, multiplayer.roomCode, gameState.setup]);

  // 3b. Host: processa le azioni ricevute dai guest via lastReceivedAction (dep React stabile)
  useEffect(() => {
    if (!multiplayer.lastReceivedAction || !multiplayer.isHost) return;
    const { action, payload } = multiplayer.lastReceivedAction;
    console.log('[APP HOST] Processing received action:', action, payload);
    try {
      switch (action) {
        case 'ROLL_DICE':       gameStateRef.current.rollDice(true); break;
        case 'TOGGLE_HOLD':     gameStateRef.current.toggleHold(payload?.index, true); break;
        case 'SELECT_CATEGORY': gameStateRef.current.selectCategory(payload?.cat, true); break;
        case 'CLOSE_POPUP':     gameStateRef.current.handleClosePopup(); break;
        case 'SELECT_TRAP':     gameStateRef.current.selectTrap(payload?.trapKey, true); break;
        case 'PLACE_BET':       gameStateRef.current.placeBet(payload?.betKey, true); break;
        case 'APPLY_RULE':      gameStateRef.current.applyRule(payload?.rule, true); break;
        case 'PICKER_DONE':     gameStateRef.current.handlePickerDone(payload?.picksLog, true); break;
        default: break;
      }
    } catch (e) {
      console.error('[APP HOST] Multiplayer action error:', e);
    }
  }, [multiplayer.lastReceivedAction, multiplayer.isHost]);


  // 4. Reset automatico se si perde la stanza (es. Kick o Chiusura Host)
  useEffect(() => {
    if (appMode === "online" && !multiplayer.roomCode && !gameState.setup) {
      console.log("Room lost or Kicked: Resetting to lobby...");
      gameState.resetGame();
      setAppMode("lobby");
    }
  }, [appMode, multiplayer.roomCode, gameState.setup]);

  // 4. Funzioni per switchare modalità dalla Lobby
  const startLocal = () => setAppMode("local");
  const startOnline = () => setAppMode("online");

  // 5. Determinazione della schermata (UNICA istruzione return finale per stabilità Hook)
  let ScreenToRender = null;

  if (appMode === "lobby" || (appMode === "online" && gameState.setup)) {
    ScreenToRender = (
      <LobbyScreen
        multiplayer={{...multiplayer, startGame: handleHostStart}}
        onLocalPlay={startLocal}
        onOnlinePlay={startOnline}
        state={gameState}
        onExit={onExit}
      />
    );
  } else if (appMode === "local" && gameState.setup) {
    ScreenToRender = <SetupScreen state={gameState} onBack={() => setAppMode("lobby")} />;
  } else if (gameState.isGameOver()) {
    ScreenToRender = <GameOverScreen state={gameState} />;
  } else {
    ScreenToRender = <GameScreen state={gameState} onBack={() => setAppMode("lobby")} />;
  }

  return (
    <>
      {multiplayer.notification && (
        <div className="system-notification pulse">
          {multiplayer.notification}
        </div>
      )}
      {ScreenToRender}
    </>
  );
}
