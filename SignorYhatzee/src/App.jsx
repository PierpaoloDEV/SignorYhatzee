import { useState, useEffect } from "react";
import { useGameState } from "./hooks/useGameState";
import { useMultiplayer } from "./hooks/useMultiplayer";
import SetupScreen from "./components/SetupScreen";
import GameScreen from "./components/GameScreen";
import GameOverScreen from "./components/GameOverScreen";
import LobbyScreen from "./components/LobbyScreen";
import "./App.css";

export default function App() {
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

  // 3. Effetto per sincronizzare appMode e ricezione azioni
  useEffect(() => {
    if (multiplayer.roomCode && !gameState.setup && appMode !== "online") {
      setAppMode("online");
    }

    if (appMode === "online" && multiplayer?.isHost && multiplayer?.setOnActionReceive) {
      multiplayer.setOnActionReceive(({ action, payload }) => {
        try {
          switch (action) {
            case 'ROLL_DICE':       gameState.rollDice(); break;
            case 'TOGGLE_HOLD':     gameState.toggleHold(payload.index); break;
            case 'SELECT_CATEGORY': gameState.selectCategory(payload.cat); break;
            case 'CLOSE_POPUP':     gameState.handleClosePopup(); break;
            default: break;
          }
        } catch (e) {
          console.error("Multiplayer action error:", e);
        }
      });
    }
  }, [appMode, multiplayer.roomCode, multiplayer.isHost, gameState.setup, gameState]);

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
