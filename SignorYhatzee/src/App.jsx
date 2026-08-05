import { useState } from "react";
import HomeCarousel from "./components/HomeCarousel";
import YahtzeeGame from "./games/signor-yahtzee/YahtzeeGame";
import DragoScreen from "./games/signor-drago/DragoScreen";
import LudoGame from "./games/signor-ludo/LudoGame";
import WheelGame from "./games/signor-wheel/WheelGame";
import "./App.css";

export default function App() {
  const [activeGame, setActiveGame] = useState(null); // null (home) | 'yahtzee' | 'drago' | 'ludo'

  const goHome = () => setActiveGame(null);

  if (activeGame === "yahtzee") {
    return <YahtzeeGame onExit={goHome} />;
  }
  if (activeGame === "drago") {
    return <DragoScreen onExit={goHome} />;
  }
  if (activeGame === "ludo") {
    return <LudoGame onExit={goHome} />;
  }
  if (activeGame === "wheel") {
    return <WheelGame onExit={goHome} />;
  }
  return <HomeCarousel onSelectGame={setActiveGame} />;
}
