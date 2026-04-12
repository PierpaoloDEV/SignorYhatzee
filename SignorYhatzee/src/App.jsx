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
    case "ones": return counts[0] * 1;
    case "twos": return counts[1] * 2;
    case "threes": return counts[2] * 3;
    case "fours": return counts[3] * 4;
    case "fives": return counts[4] * 5;
    case "sixes": return counts[5] * 6;
    case "threeKind": return hasOfAKind(counts, 3) ? sum : 0;
    case "fourKind": return hasOfAKind(counts, 4) ? sum : 0;
    case "fullHouse": return counts.includes(3) && counts.includes(2) ? 25 : 0;
    case "smallStraight": return hasStraight(counts, 4) ? 30 : 0;
    case "largeStraight": return hasStraight(counts, 5) ? 40 : 0;
    case "yahtzee": return hasOfAKind(counts, 5) ? 50 : 0;
    case "chance": return sum;
    default: return 0;
  }
}

const CATEGORIES = [
  { key: "ones", label: "1 (Assi)" },
  { key: "twos", label: "2 (Due)" },
  { key: "threes", label: "3 (Tre)" },
  { key: "fours", label: "4 (Quattro)" },
  { key: "fives", label: "5 (Cinque)" },
  { key: "sixes", label: "6 (Sei)" },
  { key: "threeKind", label: "Tris" },
  { key: "fourKind", label: "Poker" },
  { key: "fullHouse", label: "Full" },
  { key: "smallStraight", label: "Scala Piccola" },
  { key: "largeStraight", label: "Scala Grande" },
  { key: "yahtzee", label: "Yahtzee" },
  { key: "chance", label: "Chance" },
];

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const BET_OPTS = [
  { v: "NO", l: "NO" },
  { v: "SCELTA", l: "A SCELTA" },
  { v: "OBBLIGATORIA", l: "OBBLIGATORIA" }
];

const TRAP_OPTS = [
  { v: "NO", l: "NO" },
  { v: "VISIBILE", l: "VISIBILE" },
  { v: "NASCOSTA", l: "NASCOSTA" }
];

function cycleOption(val, opts, dir) {
  const i = opts.findIndex(o => o.v === val);
  let n = i + dir;
  if (n < 0) n = opts.length - 1;
  if (n >= opts.length) n = 0;
  return opts[n].v;
}

const SPECIAL_RULES = [
  { key: "minguccio", title: "Regola Minguccio", desc: "Se lanci 5 dadi insieme e ne escono almeno 3 uguali bevi." },
  { key: "mirsi", title: "Regola Mirsi", desc: "Se al terzo lancio la somma dei tuoi dadi è superiore a 22 bevi." },
  { key: "giandu", title: "Regola Giandu", desc: "Sostituisci i 'Beve quello con il punteggio più basso/alto' con 'Bevono tutti quelli con il punteggio più basso/alto di te'." },
];

const CUSTOM_PART_1 = ["Bevono tutti", "Bevi tu", "Scegli chi beve"];
const CUSTOM_PART_2 = ["quando fai punti su", "quando NON fai punti su (0 pt)"];

/* ── Component ──────────────────────────────────────────────── */

export default function App() {
  const [setup, setSetup] = useState(true);
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);
  const [players, setPlayers] = useState([]);
  const [betMode, setBetMode] = useState("SCELTA");
  const [trapMode, setTrapMode] = useState("VISIBILE");
  const [pendingTrap, setPendingTrap] = useState(false);
  const [dice, setDice] = useState([1, 1, 1, 1, 1]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [player, setPlayer] = useState(0);
  const [scores, setScores] = useState([]);
  const [rolling, setRolling] = useState(false);
  const [popup, setPopup] = useState(null);
  const [bet, setBet] = useState(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [traps, setTraps] = useState([]);
  const [showTrapModal, setShowTrapModal] = useState(false);
  const [showYahtzeeAnim, setShowYahtzeeAnim] = useState(false);

  const [activeRules, setActiveRules] = useState([]);
  const [pendingYahtzee, setPendingYahtzee] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleTab, setRuleTab] = useState("custom");
  const [customRuleDraft, setCustomRuleDraft] = useState({ part1: CUSTOM_PART_1[0], part2: CUSTOM_PART_2[0], part3: CATEGORIES[0].key });
  const [midTurnPopup, setMidTurnPopup] = useState(false);


  /* totale dadi alti giocatore p */
  const getUpperScore = (p) => {
    if (!scores[p]) return 0;
    const k = ["ones", "twos", "threes", "fours", "fives", "sixes"];
    return k.reduce((acc, curr) => acc + (scores[p][curr] || 0), 0);
  };

  /* totale punti giocatore p */
  const totalScore = (p, currentScores = scores) => {
    if (!currentScores[p]) return 0;
    return Object.values(currentScores[p]).reduce((a, b) => a + b, 0);
  };

  /* regola da bere */
  const getDrinkRule = (cat, currentScores = scores) => {
    const isGiandu = activeRules.some(r => r.key === "giandu");
    const myScore = totalScore(player, currentScores);

    switch (cat) {
      case "threeKind": return "Scegli chi beve 🍺";
      case "fourKind": return "Scegli 2 che bevono 🍻";
      case "fullHouse": return "Bevono tutti! (Compreso te) 🍻";
      case "smallStraight": {
        if (isGiandu) {
          const losers = players.map((_, i) => i).filter(i => i !== player && totalScore(i, currentScores) < myScore);
          return losers.length > 0 ? "Bevono (punteggio totale inferiore al tuo): " + losers.map(i => players[i]).join(", ") : "Nessuno beve (sei il peggiore)";
        }
        const min = Math.min(...players.map((_, i) => totalScore(i, currentScores)));
        const losers = players.filter((_, i) => totalScore(i, currentScores) === min);
        return "Bevono: " + losers.join(", ");
      }
      case "largeStraight": {
        if (isGiandu) {
          const winners = players.map((_, i) => i).filter(i => i !== player && totalScore(i, currentScores) > myScore);
          return winners.length > 0 ? "Bevono (punteggio totale superiore al tuo): " + winners.map(i => players[i]).join(", ") : "Bevi tu GET C";
        }
        const max = Math.max(...players.map((_, i) => totalScore(i, currentScores)));
        const winners = players.filter((_, i) => totalScore(i, currentScores) === max);
        return "Bevono: " + winners.join(", ");
      }
      case "yahtzee": return "🔥 BEVONO TUTTI GLI ALTRI + Crea una nuova regola!";
      case "chance": {
        if (isGiandu) {
          const myChance = currentScores[player]?.chance || 0;
          const losers = players.map((_, i) => i).filter(i => i !== player && currentScores[i]?.chance !== undefined && currentScores[i].chance < myChance);
          return losers.length > 0 ? "Bevono (meno di te in Chance): " + losers.map(i => players[i]).join(", ") : "Nessuno ha un Chance più basso del tuo bevi tu.";
        }
        const chanceScores = players.map((_, i) => {
          const v = currentScores[i]?.chance;
          return v !== undefined && v > 0 ? v : null;
        });
        if (chanceScores.every((v) => v === null)) return "Bevi tu 🍺 (nessun altro ha punti in chance!)";
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
    const valid = playerNames.filter((n) => n.trim() !== "");
    if (valid.length < 2) return;
    setPlayers(valid);
    setScores(valid.map(() => ({})));
    setSetup(false);
  };

  const rollDice = () => {
    if (rollsLeft === 0 || rolling) return;
    setRolling(true);
    setTimeout(() => {
      const rolledCount = held.filter(h => !h).length;
      const newDice = dice.map((d, i) => (held[i] ? d : rollRandom()));
      setDice([4, 4, 4, 4, 4]);
      //setDice(newDice);

      let extraPopup = null;
      if (activeRules.some(r => r.key === "minguccio") && rolledCount === 5) {
        const counts = getCounts(newDice);
        if (hasOfAKind(counts, 3)) extraPopup = "Regola Minguccio: Hai lanciato 5 dadi insieme e hai fatto almeno Tris! BEVI! 🍺";
      }

      if (activeRules.some(r => r.key === "mirsi") && rollsLeft === 1) {
        const sum = newDice.reduce((acc, v) => acc + v, 0);
        if (sum > 22) {
          if (extraPopup) extraPopup += "\n\nRegola Mirsi: La somma al 3° lancio è > 22 (" + sum + ")! BEVI! 🍺";
          else extraPopup = "Regola Mirsi: La somma al 3° lancio è > 22 (" + sum + ")! BEVI! 🍺";
        }
      }

      if (extraPopup) {
        setPopup(extraPopup);
        setMidTurnPopup(true);
      }

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

    const matchingTrapsCount = traps.filter(t => t === cat).length;
    if (matchingTrapsCount > 0 && value > 0) {
      if (matchingTrapsCount === 1) {
        popupParts.push("🚨 SEI CADUTO NELLA TRAPPOLA! 🚨\nBevi 1 sorso extra!");
      } else {
        popupParts.push(`🚨 SEI CADUTO IN ${matchingTrapsCount} TRAPPOLE! 🚨\nBevi ${matchingTrapsCount} sorsi extra!`);
      }
      setTraps(prev => prev.filter(t => t !== cat));
    }

    activeRules.forEach(r => {
      if (r.type === "custom" && r.part3 === cat) {
        if (r.part2 === "quando fai punti su" && value > 0) {
          popupParts.push(`📜 Regola Custom attivata:\n${r.part1}`);
        } else if (r.part2 === "quando NON fai punti su (0 pt)" && value === 0) {
          popupParts.push(`📜 Regola Custom attivata (0 punti):\n${r.part1}`);
        }
      }
    });

    let rule = "";
    if (value > 0) {
      rule = getDrinkRule(cat, newScores);
    }
    if (rule) popupParts.push("Regola Turno:\n" + rule);

    const triggeredTrapSet = (trapMode !== "NO" && cat === "fourKind" && value >= 18);

    if (popupParts.length > 0) {
      setPopup(popupParts.join("\n\n"));
      setPendingTrap(triggeredTrapSet);
      setPendingYahtzee(isYahtzeeTriggered);
    } else {
      setBet(null);
      if (triggeredTrapSet) {
        setShowTrapModal(true);
      } else if (isYahtzeeTriggered) {
        setShowRuleModal(true);
      } else {
        nextTurn();
      }
    }
  };

  const handleClosePopup = () => {
    setPopup(null);
    setBet(null);

    if (midTurnPopup) {
      setMidTurnPopup(false);
      return;
    }

    if (pendingTrap) {
      setShowTrapModal(true);
      setPendingTrap(false);
    } else if (pendingYahtzee) {
      setShowRuleModal(true);
      setPendingYahtzee(false);
    } else {
      nextTurn();
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

  const renderRow = (cat) => {
    const matchingTrapsCount = traps.filter(t => t === cat.key).length;
    const trapIcon = (trapMode === "VISIBILE" && matchingTrapsCount > 0)
      ? ` 💣${matchingTrapsCount > 1 ? `x${matchingTrapsCount}` : ""}`
      : "";

    return (
      <tr key={cat.key}>
        <td>
          {cat.label}
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{trapIcon}</span>
        </td>
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
  };

  /* ── SETUP SCREEN ───────────────────────────────────────────── */
  if (setup) {
    return (
      <div className="app setup-screen">
        <h1 className="title">🎲 SignorYhatzee</h1>
        <p className="subtitle">Inserisci i giocatori (min 2)</p>
        <div className="input-grid">
          {playerNames.map((name, i) => (
            <input
              key={i}
              className="player-input"
              placeholder={`Giocatore ${i + 1}`}
              value={name}
              onChange={(e) => {
                const arr = [...playerNames];
                arr[i] = e.target.value;
                if (arr.every((n) => n.trim() !== "")) {
                  arr.push("", "");
                }
                setPlayerNames(arr);
              }}
            />
          ))}
        </div>
        <div className="settings-panel" style={{ display: 'flex', gap: '30px', justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px' }}>🎰 Scommessa</label>
            <div className="custom-select" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: '30px', minWidth: '190px', justifyContent: 'space-between' }}>
              <button type="button" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'inherit', fontSize: '1rem', cursor: 'pointer', padding: '5px 10px', borderRadius: '50%' }} onClick={() => setBetMode(cycleOption(betMode, BET_OPTS, -1))}>◀</button>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{BET_OPTS.find(o => o.v === betMode)?.l}</span>
              <button type="button" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'inherit', fontSize: '1rem', cursor: 'pointer', padding: '5px 10px', borderRadius: '50%' }} onClick={() => setBetMode(cycleOption(betMode, BET_OPTS, 1))}>▶</button>
            </div>
          </div>
          <div className="setting-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px' }}>💣 Trappola</label>
            <div className="custom-select" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: '30px', minWidth: '190px', justifyContent: 'space-between' }}>
              <button type="button" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'inherit', fontSize: '1rem', cursor: 'pointer', padding: '5px 10px', borderRadius: '50%' }} onClick={() => setTrapMode(cycleOption(trapMode, TRAP_OPTS, -1))}>◀</button>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{TRAP_OPTS.find(o => o.v === trapMode)?.l}</span>
              <button type="button" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'inherit', fontSize: '1rem', cursor: 'pointer', padding: '5px 10px', borderRadius: '50%' }} onClick={() => setTrapMode(cycleOption(trapMode, TRAP_OPTS, 1))}>▶</button>
            </div>
          </div>
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
            setPlayerNames(["", "", "", ""]);
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
        className={`btn btn-primary roll-btn ${rollsLeft === 0 || (betMode === "OBBLIGATORIA" && rollsLeft === 3 && !bet) ? "disabled" : ""}`}
        onClick={rollDice}
        disabled={rollsLeft === 0 || rolling || (betMode === "OBBLIGATORIA" && rollsLeft === 3 && !bet)}
      >
        {rolling ? "⏳ Lancio..." : (betMode === "OBBLIGATORIA" && rollsLeft === 3 && !bet) ? "⚠️ Scommetti prima di lanciare" : "🎲 Lancia i dadi"}
      </button>

      {rollsLeft === 3 && !bet && betMode !== "NO" && (
        <button className="btn btn-bet" onClick={() => setShowBetModal(true)}>
          {betMode === "OBBLIGATORIA" ? "⚠️ Devi Puntare una Scommessa" : "🎰 Punta una Scommessa"}
        </button>
      )}

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
        <div className="popup-overlay" onClick={handleClosePopup} style={{ cursor: 'pointer' }}>
          <div className="popup">
            <p className="popup-text" style={{ whiteSpace: 'pre-wrap' }}>🍻 {popup}</p>
            <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.8, textAlign: 'center' }}>(Tocca ovunque per continuare)</p>
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
              {CATEGORIES.filter(c => !["ones", "twos", "threes", "fours", "fives", "sixes"].includes(c.key)).map((cat) => (
                <button
                  key={cat.key}
                  className="cat-btn"
                  onClick={() => {
                    setTraps(prev => [...prev, cat.key]);
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

      {/* Yahtzee Rule Modal */}
      {showRuleModal && (
        <div className="popup-overlay" style={{ zIndex: 3000 }}>
          <div className="popup bet-popup" style={{ width: '90%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '15px' }}>📜 Crea Nuova Regola</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button
                className={`btn ${ruleTab === "custom" ? "btn-primary" : "btn-outline"}`}
                style={{ flex: 1, padding: '8px' }}
                onClick={() => setRuleTab("custom")}
              >
                Custom
              </button>
              <button
                className={`btn ${ruleTab === "special" ? "btn-primary" : "btn-outline"}`}
                style={{ flex: 1, padding: '8px' }}
                onClick={() => setRuleTab("special")}
              >
                Speciali
              </button>
            </div>

            {ruleTab === "custom" ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'center' }}>
                  Componi la tua regola, verrà applicata in automatico.
                </p>
                <select
                  className="player-input"
                  value={customRuleDraft.part1}
                  onChange={e => setCustomRuleDraft({ ...customRuleDraft, part1: e.target.value })}
                >
                  {CUSTOM_PART_1.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  className="player-input"
                  value={customRuleDraft.part2}
                  onChange={e => setCustomRuleDraft({ ...customRuleDraft, part2: e.target.value })}
                >
                  {CUSTOM_PART_2.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  className="player-input"
                  value={customRuleDraft.part3}
                  onChange={e => setCustomRuleDraft({ ...customRuleDraft, part3: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                <button className="btn btn-primary" style={{ marginTop: '10px' }} onClick={() => {
                  const label = CATEGORIES.find(c => c.key === customRuleDraft.part3)?.label;
                  setActiveRules(prev => [...prev, {
                    type: "custom",
                    ...customRuleDraft,
                    label: `${customRuleDraft.part1} ${customRuleDraft.part2} ${label}`
                  }]);
                  setShowRuleModal(false);
                  nextTurn();
                }}>Applica Regola</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SPECIAL_RULES.map(sr => {
                  const isActive = activeRules.some(r => r.key === sr.key);
                  return (
                    <button
                      key={sr.key}
                      className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '10px', display: 'flex', flexDirection: 'column', textAlign: 'left', opacity: isActive ? 0.5 : 1 }}
                      disabled={isActive}
                      onClick={() => {
                        setActiveRules(prev => [...prev, { type: "special", ...sr }]);
                        setShowRuleModal(false);
                        nextTurn();
                      }}
                    >
                      <strong style={{ fontSize: '1rem' }}>{sr.title} {isActive && "✅"}</strong>
                      <span style={{ fontSize: '0.8rem', whiteSpace: 'normal', color: isActive ? '#fff' : 'var(--muted)' }}>{sr.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Rules Display */}
      {activeRules.length > 0 && (
        <div className="active-rules-container" style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: 'var(--gold)', textAlign: 'center' }}>📜 Leggi in Vigore</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeRules.map((r, i) => (
              <li key={i} style={{ fontSize: '0.9rem', padding: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', borderLeft: '4px solid var(--gold)' }}>
                {r.type === "custom" ? r.label : <span><strong>{r.title}</strong>: {r.desc}</span>}
              </li>
            ))}
          </ul>
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
