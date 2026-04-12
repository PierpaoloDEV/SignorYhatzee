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
    return Object.entries(currentScores[p])
      .filter(([k]) => !k.startsWith('_'))
      .reduce((a, [, b]) => a + b, 0);
  };

  // Regola da bere
  const getDrinkRule = (cat, currentScores = scores) => {
    switch (cat) {
      case "threeKind": return "Scegli chi beve 🍺";
      case "fourKind": return "Scegli 2 che bevono 🍻";
      case "fullHouse": return "Bevono tutti! (Compreso te) 🍻";
      case "smallStraight": {
        const min = Math.min(...players.map((_, i) => totalScore(i, currentScores)));
        const losers = players.filter((_, i) => totalScore(i, currentScores) === min);
        return "Bevono (punteggio più basso): " + losers.join(", ");
      }
      case "largeStraight": {
        const max = Math.max(...players.map((_, i) => totalScore(i, currentScores)));
        const winners = players.filter((_, i) => totalScore(i, currentScores) === max);
        return "Bevono (punteggio più alto): " + winners.join(", ");
      }
      case "yahtzee": return "🔥 BEVONO TUTTI GLI ALTRI + Crea una nuova regola!";
      case "chance": {
        // Raccoglie i punteggi chance di chi ha già segnato (incluso il giocatore attuale dopo newScores)
        const withChance = players
          .map((_, i) => ({ i, v: currentScores[i]?.chance }))
          .filter(({ v }) => v !== undefined);
        if (withChance.length === 0) return "";
        const min = Math.min(...withChance.map(({ v }) => v));
        const losers = withChance.filter(({ v }) => v === min).map(({ i }) => players[i]);
        return "Beve" + (losers.length > 1 ? "vono" : "") + " (Chance più bassa): " + losers.join(", ");
      }
      default: return "";
    }
  };

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
      //const newDice = [5, 5, 5, 5, 5]; // TEST

      setDice(newDice);


      // Animazione Yahtzee alla comparsa dei dadi
      const newCounts = getCounts(newDice);
      if (hasOfAKind(newCounts, 5)) {
        setShowYahtzeeAnim(true);
        setTimeout(() => setShowYahtzeeAnim(false), 4000);
      }

      let extraPopup = null;
      if (activeRules.some(r => r.key === "minguccio") && rolledCount === 5) {
        if (hasOfAKind(newCounts, 3)) extraPopup = "Regola Minguccio: Hai lanciato 5 dadi insieme e hai fatto almeno Tris! BEVI! 🍺";
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
    const counts = getCounts(dice);
    const isCurrentYahtzee = hasOfAKind(counts, 5);

    // Yahtzee bonus: il giocatore ha già segnato yahtzee > 0 e fa di nuovo yahtzee scegliendo un'altra casella
    const isExtraYahtzee = isCurrentYahtzee && cat !== "yahtzee" && scores[player]?.yahtzee !== undefined && scores[player].yahtzee > 0;

    let bonusAchieved = false;
    let isYahtzeeTriggered = (cat === "yahtzee" && value === 50) || isExtraYahtzee;

    // Animazione spostata al rollDice, qui la togliamo

    const newScores = scores.map((s, i) => {
      if (i === player) {
        let ns = { ...s, [cat]: value };

        // Gestione Yahtzee extra: +100 sul valore attuale della cella yahtzee
        if (isExtraYahtzee) {
          const prevCount = ns._yahtzeeCount || 1;
          const newCount = prevCount + 1;
          ns._yahtzeeCount = newCount;
          ns.yahtzee = (s.yahtzee || 0) + 100; // +100 ogni yahtzee aggiuntivo
        }

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
        let dynamicPart1 = r.part1;
        if (r.part1.toLowerCase().includes("più punti")) {
          const max = Math.max(...players.map((_, i) => totalScore(i, newScores)));
          const leaders = players.filter((_, i) => totalScore(i, newScores) === max);
          dynamicPart1 = dynamicPart1.replace(/Il giocatore con più punti/i, `Il giocatore con più punti (${leaders.join(", ")})`);
        } else if (r.part1.toLowerCase().includes("meno punti")) {
          const min = Math.min(...players.map((_, i) => totalScore(i, newScores)));
          const losers = players.filter((_, i) => totalScore(i, newScores) === min);
          dynamicPart1 = dynamicPart1.replace(/Il giocatore con meno punti/i, `Il giocatore con meno punti (${losers.join(", ")})`);
        }

        if (r.part2 === "quando fai punti su" && value > 0) {
          popupParts.push(`📜 Regola Custom attivata:\n${dynamicPart1}`);
        } else if (r.part2 === "quando NON fai punti su (0 pt)" && value === 0) {
          popupParts.push(`📜 Regola Custom attivata (0 punti):\n${dynamicPart1}`);
        }
      }
    });


    // Per extra yahtzee usa sempre la drink rule dello yahtzee normale
    const ruleKey = isExtraYahtzee ? "yahtzee" : cat;
    let rule = "";
    if (value > 0 || isExtraYahtzee) {
      rule = getDrinkRule(ruleKey, newScores);
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
