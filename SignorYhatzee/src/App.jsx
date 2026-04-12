import { useGameState } from "./hooks/useGameState";
import SetupScreen from "./components/SetupScreen";
import GameScreen from "./components/GameScreen";
import GameOverScreen from "./components/GameOverScreen";
import "./App.css";

export default function App() {
  const gameState = useGameState();

  if (gameState.setup) {
    return <SetupScreen state={gameState} />;
  }

  if (gameState.isGameOver()) {
    return <GameOverScreen state={gameState} />;
  }

  return <GameScreen state={gameState} />;
}
