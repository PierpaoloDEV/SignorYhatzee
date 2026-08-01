import DiceArea from "./DiceArea";
import Scoreboard from "./Scoreboard";
import ActiveRulesBoard from "./ActiveRulesBoard";
import BetModal from "./modals/BetModal";
import TrapModal from "./modals/TrapModal";
import YahtzeeRuleModal from "./modals/YahtzeeRuleModal";
import DrinkPopup from "./modals/DrinkPopup";
import RulesInfoModal from "./modals/RulesInfoModal";
import GameManagementModal from "./modals/GameManagementModal";
import { CATEGORIES } from "../constants";

export default function GameScreen({ state, onBack }) {
  const { players, player, rollsLeft, bet, betMode, traps, trapMode, showYahtzeeAnim, setShowManagementModal, isHost, resetGame } = state;

  return (
    <div className="app game-screen">
      <RulesInfoModal state={state} />

      {/* Layout landscape: left + right */}
      <div className="game-layout">

        {/* Pannello sinistro: header, dadi, pulsanti */}
        <div className="game-left">
          <header className="game-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '15px' }}>
              <button 
                className="back-btn" 
                style={{ position: 'static', margin: 0, padding: '8px 12px' }}
                onClick={() => {
                  if (window.confirm("Abbandonare la partita e tornare al menu?")) {
                    if (onBack) onBack();
                    resetGame();
                  }
                }}
              >
                ←
              </button>
              <h1 className="title" style={{ flex: 1, textAlign: 'left', margin: 0 }}>SignorYahtzee</h1>
              {(!state.isMultiplayer || isHost) && (
                <button 
                  className="btn btn-outline" 
                  style={{ minWidth: 'auto', padding: '8px 12px', fontSize: '1.2rem' }}
                  onClick={() => setShowManagementModal(true)}
                >
                  ⚙️
                </button>
              )}
            </div>
            <div className="turn-info">
              <span className="turn-player">{players[player]} {state.isMyTurn ? '(Tu)' : ''}</span>
              <span className="turn-rolls">Lanci rimasti: {rollsLeft}</span>
            </div>
            {!state.isMyTurn && (
              <div className="waiting-indicator" style={{ 
                background: 'rgba(255,255,255,0.05)', 
                padding: '10px', 
                borderRadius: '10px',
                textAlign: 'center',
                margin: '10px 0',
                fontSize: '0.9rem',
                color: 'var(--muted)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                ⏳ In attesa del turno di <b>{players[player]}</b>...
              </div>
            )}
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

          <ActiveRulesBoard state={state} />
        </div>

        {/* Pannello destro: tabellone */}
        <div className="game-right">
          <Scoreboard state={state} />
        </div>

      </div>

      <DrinkPopup state={state} />
      <BetModal state={state} />
      <TrapModal state={state} />
      <YahtzeeRuleModal state={state} />
      <GameManagementModal state={state} />

      {showYahtzeeAnim && (
        <div className="yahtzee-animation">
          <div className="yahtzee-text">Y A H T Z E E !</div>
        </div>
      )}
    </div>
  );
}
