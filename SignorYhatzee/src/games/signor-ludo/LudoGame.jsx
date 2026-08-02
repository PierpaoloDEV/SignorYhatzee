import { useLudoState } from "./hooks/useLudoState";
import SetupScreen from "./components/SetupScreen";
import BoardScreen from "./components/BoardScreen";
import GameOverScreen from "./components/GameOverScreen";
import "./ludo.css";

export default function LudoGame({ onExit }) {
  const state = useLudoState();
  const { 
    screen, setScreen, 
    playerNames, setPlayerNames, 
    tokens, finishOrder, startGame, resetGame,
    pawnsCount, setPawnsCount,
    diceCount, setDiceCount
  } = state;

  if (screen === "setup") {
    return (
      <SetupScreen
        playerNames={playerNames}
        setPlayerNames={setPlayerNames}
        pawnsCount={pawnsCount}
        setPawnsCount={setPawnsCount}
        diceCount={diceCount}
        setDiceCount={setDiceCount}
        onStart={startGame}
        onExit={onExit}
      />
    );
  }

  if (screen === "over") {
    return (
      <GameOverScreen
        finishOrder={finishOrder}
        playerNames={playerNames}
        tokens={tokens}
        onRestart={() => {
          resetGame();
          // Keep names, restart immediately
          setTimeout(() => state.startGame(), 50);
        }}
        onExit={onExit}
      />
    );
  }

  return <BoardScreen state={state} onExit={onExit} />;
}
