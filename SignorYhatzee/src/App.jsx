import { useState, useEffect } from "react";
import "./App.css";

/* ── Helpers ────────────────────────────────────────────────── */
function rollRandom() {
  return Math.floor(Math.random() * 6) + 1;
}

function getCounts(dice) {
  const counts = [0, 0, 0, 0, 0, 0];
  dice.forEach((d) => {
    if (d >= 1 && d <= 6) counts[d - 1]++;
  });
  return counts;
}

function hasOfAKind(counts, n) {
  return counts.some((c) => c >= n);
}

function hasStraight(counts, length) {
  let max = 0,
    current = 0;
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > 0) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max >= length;
}

function calculateScore(dice, category) {
  if (!dice || dice.length === 0) return 0;
  const counts = getCounts(dice);
  const sum = dice.reduce((a, b) => a + b, 0);
  switch (category) {
    case "threeKind":   return hasOfAKind(counts, 3) ? sum : 0;
    case "fourKind":    return hasOfAKind(counts, 4) ? sum : 0;
    case "fullHouse":   return counts.includes(3) && counts.includes(2) ? 25 : 0;
    case "smallStraight": return hasStraight(counts, 4) ? 30 : 0;
    case "largeStraight": return hasStraight(counts, 5) ? 40 : 0;
    case "yahtzee":     return hasOfAKind(counts, 5) ? 50 : 0;
    case "chance":      return sum;
    default:            return 0;
  }
}

const CATEGORIES = [
  { key: "threeKind",     label: "Tris" },
  { key: "fourKind",      label: "Poker" },
  { key: "fullHouse",     label: "Full" },
  { key: "smallStraight", label: "Scala Piccola" },
  { key: "largeStraight", label: "Scala Grande" },
  { key: "yahtzee",       label: "Yahtzee" },
  { key: "chance",        label: "Chance" },
];

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

/* ── Component ──────────────────────────────────────────────── */
export default function App() {
  const [setup, setSetup]           = useState(true);
  const [playerNames, setPlayerNames] = useState(Array(10).fill(""));
  const [players, setPlayers]       = useState([]);
  const [dice, setDice]             = useState([1, 1, 1, 1, 1]);
  const [held, setHeld]             = useState([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft]   = useState(3);
  const [player, setPlayer]         = useState(0);
  const [scores, setScores]         = useState([]);
  const [rolling, setRolling]       = useState(false);
  const [popup, setPopup]           = useState(null);

  /* totale punti giocatore p */
  const totalScore = (p) => {
    if (!scores[p]) return 0;
    return Object.values(scores[p]).reduce((a, b) => a + b, 0);
  };

  /* regola da bere */
  const getDrinkRule = (cat) => {
    switch (cat) {
      case "threeKind":   return "Scegli chi beve 🍺";
      case "fourKind":    return "Scegli 2 che bevono 🍻";
      case "fullHouse":   return "Bevono tutti gli altri 😈";
      case "smallStraight": {
        const min = Math.min(...players.map((_, i) => totalScore(i)));
        const losers = players.filter((_, i) => totalScore(i) === min);
        return "Bevono: " + losers.join(", ");
      }
      case "largeStraight": {
        const max = Math.max(...players.map((_, i) => totalScore(i)));
        const winners = players.filter((_, i) => totalScore(i) === max);
        return "Bevono: " + winners.join(", ");
      }
      case "yahtzee": return "🔥 BEVONO TUTTI + doppio giro + shot extra!";
      case "chance": {
        const chanceScores = players.map((_, i) => {
          const v = scores[i]?.chance;
          return v !== undefined && v > 0 ? v : null;
        });
        if (chanceScores.every((v) => v === null)) return "Bevi tu 🍺 (prima chance!)";
        const valid = chanceScores.filter((v) => v !== null);
        const min = Math.min(...valid);
        const losers = players.filter((_, i) => chanceScores[i] === min);
        return "Beve: " + losers.join(", ");
      }
      default: return "";
    }
  };

  /* azioni */
  const startGame = () => {
    const valid = playerNames.filter((n) => n.trim() !== "").slice(0, 10);
    if (valid.length < 2) return;
    setPlayers(valid);
    setScores(valid.map(() => ({})));
    setSetup(false);
  };

  const rollDice = () => {
    if (rollsLeft === 0 || rolling) return;
    setRolling(true);
    setTimeout(() => {
      setDice((prev) => prev.map((d, i) => (held[i] ? d : rollRandom())));
      setRollsLeft((r) => r - 1);
      setRolling(false);
    }, 400);
  };

  const toggleHold = (i) => {
    if (rollsLeft === 3) return; // non si può tenere prima del primo lancio
    setHeld((prev) => prev.map((h, idx) => (idx === i ? !h : h)));
  };

  const selectCategory = (cat) => {
    if (!scores[player] || scores[player][cat] !== undefined) return;
    const value = calculateScore(dice, cat);
    const newScores = scores.map((s, i) =>
      i === player ? { ...s, [cat]: value } : s
    );
    setScores(newScores);
    setPopup(getDrinkRule(cat));
    setTimeout(() => {
      setPopup(null);
      nextTurn();
    }, 2500);
  };

  const nextTurn = () => {
    setPlayer((p) => (p + 1) % players.length);
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
  };

  const isGameOver = () =>
    scores.length > 0 && scores.every((s) => Object.keys(s).length === CATEGORIES.length);

  const getWinner = () => {
    const max = Math.max(...players.map((_, i) => totalScore(i)));
    return players.filter((_, i) => totalScore(i) === max).join(", ");
  };

  /* ── SETUP SCREEN ───────────────────────────────────────────── */
  if (setup) {
    return (
      <div className="app setup-screen">
        <h1 className="title">🎲 SignorYhatzee</h1>
        <p className="subtitle">Inserisci i giocatori (min 2, max 10)</p>
        <div className="input-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <input
              key={i}
              className="player-input"
              placeholder={`Giocatore ${i + 1}`}
              value={playerNames[i]}
              onChange={(e) => {
                const arr = [...playerNames];
                arr[i] = e.target.value;
                setPlayerNames(arr);
              }}
            />
          ))}
        </div>
        <button className="btn btn-primary" onClick={startGame}>
          🚀 Inizia la partita
        </button>
      </div>
    );
  }

  /* ── GAME OVER SCREEN ───────────────────────────────────────── */
  if (isGameOver()) {
    return (
      <div className="app game-over-screen">
        <h1 className="title">🏆 Partita finita!</h1>
        <p className="winner-label">Vince...</p>
        <p className="winner-name">{getWinner()}</p>
        <p className="winner-sub">sei il Signor Yahtzee 🎉</p>
        <div className="scoreboard">
          {players.map((name, i) => (
            <div key={i} className="score-row">
              <span className="score-name">{name}</span>
              <span className="score-pts">{totalScore(i)} pt</span>
            </div>
          ))}
        </div>
        <button
          className="btn btn-outline"
          onClick={() => {
            setSetup(true);
            setPlayerNames(Array(10).fill(""));
          }}
        >
          🔄 Nuova partita
        </button>
      </div>
    );
  }

  /* ── GAME SCREEN ────────────────────────────────────────────── */
  return (
    <div className="app game-screen">
      {/* Header */}
      <header className="game-header">
        <h1 className="title">🎲 SignorYhatzee</h1>
        <div className="turn-info">
          <span className="turn-player">{players[player]}</span>
          <span className="turn-rolls">Lanci rimasti: {rollsLeft}</span>
        </div>
      </header>

      {/* Scoreboard mini */}
      <div className="mini-scoreboard">
        {players.map((name, i) => (
          <div key={i} className={`mini-player ${i === player ? "active" : ""}`}>
            <span className="mini-name">{name}</span>
            <span className="mini-pts">{totalScore(i)}</span>
          </div>
        ))}
      </div>

      {/* Dice */}
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
        className={`btn btn-primary roll-btn ${rollsLeft === 0 ? "disabled" : ""}`}
        onClick={rollDice}
        disabled={rollsLeft === 0 || rolling}
      >
        {rolling ? "⏳ Lancio..." : "🎲 Lancia i dadi"}
      </button>

      {/* Categories */}
      <div className="categories">
        <h2 className="cat-title">Seleziona una categoria</h2>
        <div className="cat-grid">
          {CATEGORIES.map((cat) => {
            const used = scores[player]?.[cat.key] !== undefined;
            const preview = calculateScore(dice, cat.key);
            return (
              <button
                key={cat.key}
                className={`cat-btn ${used ? "used" : ""}`}
                onClick={() => !used && selectCategory(cat.key)}
                disabled={used}
              >
                <span className="cat-label">{cat.label}</span>
                <span className="cat-score">
                  {used ? scores[player][cat.key] : `+${preview}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drink popup */}
      {popup && (
        <div className="popup-overlay">
          <div className="popup">
            <p className="popup-text">🍻 {popup}</p>
          </div>
        </div>
      )}
    </div>
  );
}
