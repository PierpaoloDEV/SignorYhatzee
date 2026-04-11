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
    case "ones":        return counts[0] * 1;
    case "twos":        return counts[1] * 2;
    case "threes":      return counts[2] * 3;
    case "fours":       return counts[3] * 4;
    case "fives":       return counts[4] * 5;
    case "sixes":       return counts[5] * 6;
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
  { key: "ones",          label: "1 (Assi)" },
  { key: "twos",          label: "2 (Due)" },
  { key: "threes",        label: "3 (Tre)" },
  { key: "fours",         label: "4 (Quattro)" },
  { key: "fives",         label: "5 (Cinque)" },
  { key: "sixes",         label: "6 (Sei)" },
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
  const [bet, setBet]               = useState(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [trap, setTrap]             = useState(null);
  const [showTrapModal, setShowTrapModal] = useState(false);
  const [showYahtzeeAnim, setShowYahtzeeAnim] = useState(false);

  /* totale dadi alti giocatore p */
  const getUpperScore = (p) => {
    if (!scores[p]) return 0;
    const k = ["ones", "twos", "threes", "fours", "fives", "sixes"];
    return k.reduce((acc, curr) => acc + (scores[p][curr] || 0), 0);
  };

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
      case "fullHouse":   return "Bevono tutti! (Compreso te) 🍻";
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
      case "yahtzee": return "🔥 BEVONO TUTTI GLI ALTRI + Crea una nuova regola!";
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
    if (rollsLeft === 3) return; // Devi lanciare i dadi almeno una volta
    if (!scores[player] || scores[player][cat] !== undefined) return;
    
    const value = calculateScore(dice, cat);
    let bonusAchieved = false;
    let isYahtzeeTriggered = (cat === "yahtzee" && value === 50);

    if (isYahtzeeTriggered) {
      setShowYahtzeeAnim(true);
      setTimeout(() => setShowYahtzeeAnim(false), 4000);
    }
    
    const newScores = scores.map((s, i) => {
      if (i === player) {
        let ns = { ...s, [cat]: value };
        const isUpper = ["ones", "twos", "threes", "fours", "fives", "sixes"].includes(cat);
        if (isUpper && s.bonus === undefined) {
          let curUpper = 0;
          ["ones", "twos", "threes", "fours", "fives", "sixes"].forEach(k => {
            if (ns[k] !== undefined) curUpper += ns[k];
          });
          if (curUpper >= 63) {
            ns.bonus = 35;
            bonusAchieved = true;
          }
        }
        return ns;
      }
      return s;
    });
    setScores(newScores);

    let popupParts = [];

    if (bonusAchieved) {
      popupParts.push("🎉 BONUS SBLOCCATO! (+35 pt)\nScegli 3 persone (o la stessa 3 volte) da far bere! 🍻");
    }

    if (bet) {
      if (cat === bet && value > 0) {
        popupParts.push("🎯 SCOMMESSA VINTA!\nScegli chi beve un sorso extra!");
      } else {
        popupParts.push("❌ SCOMMESSA PERSA!\nBevi tu un sorso extra!");
      }
    }

    if (trap === cat && value > 0) {
      popupParts.push("🚨 SEI CADUTO NELLA TRAPPOLA! 🚨\nBevi un sorso extra!");
      setTrap(null);
    }

    let rule = "";
    if (value > 0) {
      rule = getDrinkRule(cat);
    }
    if (rule) popupParts.push("Regola Turno:\n" + rule);
    
    const triggeredTrapSet = (cat === "fourKind" && value >= 18);
    
    if (popupParts.length > 0) {
      setPopup(popupParts.join("\n\n"));
      setTimeout(() => {
        setPopup(null);
        setBet(null);
        if (triggeredTrapSet) {
          setShowTrapModal(true);
        } else {
          nextTurn();
        }
      }, (bet || bonusAchieved || isYahtzeeTriggered) ? 4500 : 2500);
    } else {
      setBet(null);
      if (triggeredTrapSet) {
        setShowTrapModal(true);
      } else {
        nextTurn();
      }
    }
  };

  const nextTurn = () => {
    setPlayer((p) => (p + 1) % players.length);
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
  };

  const isGameOver = () =>
    scores.length > 0 && scores.every((s) => {
      const keys = Object.keys(s).filter(k => k !== 'bonus');
      return keys.length === CATEGORIES.length;
    });

  const getWinner = () => {
    const max = Math.max(...players.map((_, i) => totalScore(i)));
    return players.filter((_, i) => totalScore(i) === max).join(", ");
  };

  const renderRow = (cat) => (
    <tr key={cat.key}>
      <td>{cat.label}</td>
      {players.map((p, i) => {
        const used = scores[i]?.[cat.key] !== undefined;
        const isCurrent = i === player;
        const preview = isCurrent ? calculateScore(dice, cat.key) : "";
        const canSelect = rollsLeft < 3;
        
        if (isCurrent && !used) {
          return (
            <td key={i} className="active-cell">
              <button 
                className="score-btn" 
                onClick={() => canSelect && selectCategory(cat.key)}
                disabled={!canSelect}
                style={{ opacity: canSelect ? 1 : 0.4, cursor: canSelect ? 'pointer' : 'not-allowed' }}
              >
                +{preview}
              </button>
            </td>
          );
        }
        
        return (
          <td key={i} className={used ? "used-cell" : "empty-cell"}>
            {used ? scores[i][cat.key] : "-"}
          </td>
        );
      })}
    </tr>
  );

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

      {rollsLeft === 3 && !bet && (
        <button className="btn btn-bet" onClick={() => setShowBetModal(true)}>
          🎰 Punta una Scommessa
        </button>
      )}
      
      {bet && (
        <div className="active-bet">
          Scommessa attiva: <span className="cat-score">{CATEGORIES.find(c => c.key === bet)?.label}</span>
        </div>
      )}

      {trap && (
        <div className="active-trap">
          🚨 Trappola: se fai punti su <span className="cat-score">{CATEGORIES.find(c => c.key === trap)?.label}</span> BEVI!
        </div>
      )}

      {/* Main Scoreboard / Tabellario Ordinato */}
      <div className="scoreboard-container">
        <table className="main-scoreboard">
          <thead>
            <tr>
              <th>Combinazione</th>
              {players.map((p, i) => (
                <th key={i} className={i === player ? "active" : ""}>
                  {p}
                  <div className="table-pts">{totalScore(i)} pt</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.slice(0, 6).map(renderRow)}
            {/* RIGA BONUS */}
            <tr className="bonus-row" style={{ background: 'rgba(251,191,36,0.1)' }}>
              <td style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.8rem' }}>🎯 BONUS (63pt)</td>
              {players.map((p, i) => {
                const upperLimit = getUpperScore(i);
                const hasBonus = scores[i]?.bonus === 35;
                return (
                  <td key={i} style={{ color: hasBonus ? 'var(--gold)' : 'var(--muted)', fontWeight: hasBonus ? 800 : 500, fontSize: '0.8rem' }}>
                    {hasBonus ? "+35 pt" : `${upperLimit}/63`}
                  </td>
                );
              })}
            </tr>
            {CATEGORIES.slice(6).map(renderRow)}
          </tbody>
        </table>
      </div>

      {/* Drink popup */}
      {popup && (
        <div className="popup-overlay">
          <div className="popup">
            <p className="popup-text">🍻 {popup}</p>
          </div>
        </div>
      )}

      {/* Bet Modal */}
      {showBetModal && (
        <div className="popup-overlay">
          <div className="popup bet-popup">
            <h2 style={{ marginBottom: '15px' }}>Su cosa vuoi scommettere?</h2>
            <div className="cat-grid" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '5px' }}>
              {CATEGORIES.filter(c => scores[player]?.[c.key] === undefined).map((cat) => (
                <button
                  key={cat.key}
                  className="cat-btn"
                  onClick={() => {
                    setBet(cat.key);
                    setShowBetModal(false);
                  }}
                >
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }} onClick={() => setShowBetModal(false)}>
              Annulla Scommessa
            </button>
          </div>
        </div>
      )}

      {/* Trap Modal */}
      {showTrapModal && (
        <div className="popup-overlay">
          <div className="popup bet-popup">
            <h2 style={{ marginBottom: '15px', color: 'var(--red)' }}>🚨 TRAPPOLA!</h2>
            <p style={{ marginBottom: '15px', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Hai fatto Poker! Scegli una combinazione. Il prossimo che ci farà punti berrà!
            </p>
            <div className="cat-grid" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '5px' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className="cat-btn"
                  onClick={() => {
                    setTrap(cat.key);
                    setShowTrapModal(false);
                    nextTurn();
                  }}
                >
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }} onClick={() => { setShowTrapModal(false); nextTurn(); }}>
              Nessuna Trappola
            </button>
          </div>
        </div>
      )}

      {/* Yahtzee Animation */}
      {showYahtzeeAnim && (
        <div className="yahtzee-animation">
          <div className="yahtzee-text">Y A H T Z E E !</div>
        </div>
      )}
    </div>
  );
}
