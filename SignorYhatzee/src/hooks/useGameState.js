import { useState } from "react";
import { CATEGORIES } from "../constants";
import { calculateScore, rollRandom, getCounts, hasOfAKind } from "../utils/gameHelpers";

export function useGameState() {
  const [setup, setSetup] = useState(true);
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);
  const [players, setPlayers] = useState([]);
  const [betMode, setBetMode] = useState("SCELTA");
  const [trapMode, setTrapMode] = useState("VISIBILE");
  
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
  const [pendingTrap, setPendingTrap] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [midTurnPopup, setMidTurnPopup] = useState(false);

  // Calcolo dadi alti giocatore p
  const getUpperScore = (p) => {
    if (!scores[p]) return 0;
    const k = ["ones", "twos", "threes", "fours", "fives", "sixes"];
    return k.reduce((acc, curr) => acc + (scores[p][curr] || 0), 0);
  };

  // Totale punti giocatore p
  const totalScore = (p, currentScores = scores) => {
    if (!currentScores[p]) return 0;
    return Object.values(currentScores[p]).reduce((a, b) => a + b, 0);
  };

  // Regola da bere
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
          return winners.length > 0 ? "Bevono (punteggio totale superiore al tuo): " + winners.map(i => players[i]).join(", ") : "Nessuno beve (sei il migliore)";
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
          return losers.length > 0 ? "Bevono (meno di te in Chance): " + losers.map(i => players[i]).join(", ") : "Nessuno ha un Chance più basso del tuo.";
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

  const startGame = () => {
    const valid = playerNames.filter((n) => n.trim() !== "");
    if (valid.length < 2) return;
    setPlayers(valid);
    setScores(valid.map(() => ({  })));
    setSetup(false);
  };

  const rollDice = () => {
    if (rollsLeft === 0 || rolling) return;
    setRolling(true);
    setTimeout(() => {
      const rolledCount = held.filter(h => !h).length;
      const newDice = dice.map((d, i) => (held[i] ? d : rollRandom()));
      setDice(newDice);
      
      let extraPopup = null;
      if (activeRules.some(r => r.key === "minguccio") && rolledCount === 5 && rollsLeft < 3) {
        const counts = getCounts(newDice);
        if (hasOfAKind(counts, 3)) extraPopup = "Regola Minguccio: Hai rilanciato 5 dadi insieme e hai fatto almeno Tris! BEVI! 🍺";
      }

      if (activeRules.some(r => r.key === "mirsi") && rollsLeft === 1) {
        const sum = newDice.reduce((acc, v) => acc + v, 0);
        if (sum > 22) {
          if (extraPopup) extraPopup += `\n\nRegola Mirsi: La somma al 3° lancio è > 22 (${sum})! BEVI! 🍺`;
          else extraPopup = `Regola Mirsi: La somma al 3° lancio è > 22 (${sum})! BEVI! 🍺`;
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
    if (rollsLeft === 3) return;
    setHeld((prev) => prev.map((h, idx) => (idx === i ? !h : h)));
  };

  const selectCategory = (cat) => {
    if (rollsLeft === 3) return;
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

  const resetGame = () => {
    setSetup(true);
    setPlayerNames(["", "", "", ""]);
  };

  return {
    setup, playerNames, setPlayerNames, players, betMode, setBetMode, trapMode, setTrapMode,
    dice, held, rollsLeft, player, scores, rolling, popup, bet, setBet, showBetModal, setShowBetModal,
    traps, setTraps, showTrapModal, setShowTrapModal, showYahtzeeAnim, activeRules, setActiveRules, showRuleModal, setShowRuleModal,
    getUpperScore, totalScore, startGame, rollDice, toggleHold, selectCategory, handleClosePopup, nextTurn, isGameOver, getWinner, resetGame
  };
}
