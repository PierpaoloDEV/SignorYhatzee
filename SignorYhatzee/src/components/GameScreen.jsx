import DiceArea from "./DiceArea";
import Scoreboard from "./Scoreboard";
import ActiveRulesBoard from "./ActiveRulesBoard";
import BetModal from "./modals/BetModal";
import TrapModal from "./modals/TrapModal";
import YahtzeeRuleModal from "./modals/YahtzeeRuleModal";
import DrinkPopup from "./modals/DrinkPopup";
import { CATEGORIES } from "../constants";

export default function GameScreen({ state }) {
  const { players, player, rollsLeft, bet, betMode, traps, trapMode, showYahtzeeAnim, activeRules } = state;

  return (
    <div className="app game-screen">
      <header className="game-header">
        <h1 className="title">🎲 SignorYhatzee</h1>
        <div className="turn-info">
          <span className="turn-player">{players[player]}</span>
          <span className="turn-rolls">Lanci rimasti: {rollsLeft}</span>
        </div>
      </header>

      <DiceArea state={state} />

      {bet && (
        <div className="active-bet">
          Scommessa attiva: <span className="cat-score">{CATEGORIES.find(c => c.key === bet)?.label}</span>
        </div>
      )}

      {traps.length > 0 && (
        <div className="active-trap" style={{ fontSize: '1.2rem' }}>
          🚨 Trappole {trapMode === "NASCOSTA" ? "segrete " : ""}attive: {Array(traps.length).fill("💣").join(" ")}
        </div>
      )}

      <Scoreboard state={state} />
      <ActiveRulesBoard state={state} />

      <DrinkPopup state={state} />
      <BetModal state={state} />
      <TrapModal state={state} />
      <YahtzeeRuleModal state={state} />

      {showYahtzeeAnim && (
        <div className="yahtzee-animation">
          <div className="yahtzee-text">Y A H T Z E E !</div>
        </div>
      )}
    </div>
  );
}
