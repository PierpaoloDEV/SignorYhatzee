import { useState } from "react";
import HomeCarousel from "./components/HomeCarousel";
import YahtzeeGame from "./games/signor-yahtzee/YahtzeeGame";
import DragoScreen from "./games/signor-drago/DragoScreen";
import "./App.css";

export default function App() {
  const [activeGame, setActiveGame] = useState(null); // null (home) | 'yahtzee' | 'drago'

  const goHome = () => setActiveGame(null);

  if (activeGame === "yahtzee") {
    return <YahtzeeGame onExit={goHome} />;
  }
  if (activeGame === "drago") {
    return <DragoScreen onExit={goHome} />;
  }
  return <HomeCarousel onSelectGame={setActiveGame} />;
}
