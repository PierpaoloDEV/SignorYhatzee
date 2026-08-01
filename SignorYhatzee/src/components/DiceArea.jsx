import { DICE_FACES } from "../constants";

export default function DiceArea({ state }) {
  const { dice, held, rolling, toggleHold, rollsLeft, rollDice, betMode, bet, setShowBetModal, activeRules, isMyTurn } = state;

  const isBetMandatory = betMode === "OBBLIGATORIA";


  return (
    <>
      <div className="dice-row">
        {dice.map((d, i) => (
          <button
            key={i}
            className={`die ${held[i] ? "held" : ""} ${rolling && !held[i] ? "rolling" : ""} ${!isMyTurn ? "disabled-die" : ""}`}
            onClick={() => isMyTurn && toggleHold(i)}
            aria-label={`Dado ${i + 1}: ${d}${held[i] ? ", tenuto" : ""}`}
          >
            {DICE_FACES[d]}
          </button>
        ))}
      </div>

      <button
        className={`btn btn-primary roll-btn ${rollsLeft === 0 || !isMyTurn || (isBetMandatory && rollsLeft === 3 && !bet) ? "disabled" : ""}`}
        onClick={() => rollDice()}
        disabled={rollsLeft === 0 || rolling || !isMyTurn || (isBetMandatory && rollsLeft === 3 && !bet)}
      >
        {rolling ? "⏳ Lancio..." : (isBetMandatory && rollsLeft === 3 && !bet) ? "⚠️ Scommetti" : "🎲 Lancia i dadi"}
      </button>

      {(betMode !== "NO" || isBetMandatory) && rollsLeft === 3 && !bet && isMyTurn && (
        <button className="btn btn-bet" onClick={() => setShowBetModal(true)}>
          🎰 Piazza Scommessa
        </button>
      )}
    </>
  );
}
