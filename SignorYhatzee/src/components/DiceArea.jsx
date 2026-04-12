import { DICE_FACES } from "../constants";

export default function DiceArea({ state }) {
  const { dice, held, rolling, toggleHold, rollsLeft, rollDice, betMode, bet } = state;

  return (
    <>
      <div className="dice-row">
        {dice.map((d, i) => (
          <button
            key={i}
            className={`die ${held[i] ? "held" : ""} ${rolling && !held[i] ? "rolling" : ""}`}
            onClick={() => toggleHold(i)}
            aria-label={`Dado ${i + 1}: ${d}${held[i] ? ", tenuto" : ""}`}
          >
            {DICE_FACES[d]}
          </button>
        ))}
      </div>

      <button
        className={`btn btn-primary roll-btn ${rollsLeft === 0 || (betMode === "OBBLIGATORIA" && rollsLeft === 3 && !bet) ? "disabled" : ""}`}
        onClick={rollDice}
        disabled={rollsLeft === 0 || rolling || (betMode === "OBBLIGATORIA" && rollsLeft === 3 && !bet)}
      >
        {rolling ? "⏳ Lancio..." : (betMode === "OBBLIGATORIA" && rollsLeft === 3 && !bet) ? "⚠️ Scommetti prima di lanciare" : "🎲 Lancia i dadi"}
      </button>
    </>
  );
}
