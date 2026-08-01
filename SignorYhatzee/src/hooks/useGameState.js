import { useState, useEffect } from "react";
import { CATEGORIES, SPECIAL_RULES } from "../constants";
import { calculateScore, rollRandom, getCounts, hasOfAKind } from "../utils/gameHelpers";
import { triggerHaptic, triggerSuccess } from "../utils/haptics";

export function useGameState(multiplayer = null) {
  const {
    isHost = false,
    isConnected = false,
    syncState = () => { },
    sendAction = () => { },
    socketId = null
  } = multiplayer || {};

  const [setup, setSetup] = useState(true);
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);
  const [players, setPlayers] = useState([]);
  const [betMode, setBetMode] = useState("SCELTA");
  const [trapMode, setTrapMode] = useState("VISIBILE");
  const [rulesMode, setRulesMode] = useState("SOLO_YAHTZEE");
  const [roundCount, setRoundCount] = useState(0);

  const [dice, setDice] = useState([1, 1, 1, 1, 1]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [player, setPlayer] = useState(0);
  const [scores, setScores] = useState([]);
  const [playerIds, setPlayerIds] = useState([]);
  const [rolling, setRolling] = useState(false);

  const [popup, setPopup] = useState(null);
  const [bet, setBet] = useState(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [traps, setTraps] = useState([]);
  const [showTrapModal, setShowTrapModal] = useState(false);
  const [showYahtzeeAnim, setShowYahtzeeAnim] = useState(false);
    const [nicoPenaltyApplied, setNicoPenaltyApplied] = useState(false);

  const [activeRules, setActiveRules] = useState([]);
  const [pendingYahtzee, setPendingYahtzee] = useState(false);
  const [pendingTrap, setPendingTrap] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [midTurnPopup, setMidTurnPopup] = useState(false);

  // --- MULTIPLAYER SYNC (GUEST): reagisce a lastReceivedState come dep React stabile ---
  useEffect(() => {
    if (!isHost && multiplayer?.lastReceivedState) {
      const remoteState = multiplayer.lastReceivedState;
      console.log('[GS GUEST] Applying remote state | setup:', remoteState.setup, '| player:', remoteState.player, '| playerIds:', remoteState.playerIds);
      setSetup(remoteState.setup);
      setPlayers(remoteState.players);
      setDice(remoteState.dice);
      setHeld(remoteState.held);
      setRollsLeft(remoteState.rollsLeft);
      setPlayer(remoteState.player);
      setScores(remoteState.scores);
      setPlayerIds(remoteState.playerIds || []);
      setRolling(remoteState.rolling);
      setPopup(remoteState.popup);
      setBet(remoteState.bet);
      setTraps(remoteState.traps);
      setActiveRules(remoteState.activeRules);
      setShowBetModal(remoteState.showBetModal);
      setShowTrapModal(remoteState.showTrapModal);
      setShowRuleModal(remoteState.showRuleModal);
      if (remoteState.betMode) setBetMode(remoteState.betMode);
      if (remoteState.trapMode) setTrapMode(remoteState.trapMode);
      if (remoteState.rulesMode) setRulesMode(remoteState.rulesMode);
      if (remoteState.roundCount !== undefined) setRoundCount(remoteState.roundCount);
    }
  }, [multiplayer?.lastReceivedState, isHost]);

  useEffect(() => {
    if (multiplayer && isHost && syncState) {
      syncState({
        setup, players, dice, held, rollsLeft, player, scores, rolling, playerIds,
        popup, bet, traps, activeRules, showBetModal, showTrapModal, showRuleModal,
        betMode, trapMode, rulesMode, roundCount
      });
    }
  }, [setup, players, dice, held, rollsLeft, player, scores, rolling, playerIds, popup, bet, traps, activeRules, showBetModal, showTrapModal, showRuleModal, betMode, trapMode, rulesMode, roundCount, isHost, syncState]);


  // AUTO-REMOVE DISCONNECTED PLAYERS (Host only)
  useEffect(() => {
    if (isHost && !setup && multiplayer?.players) {
      const currentSocketIds = multiplayer.players.map(p => p.id);
      playerIds.forEach((id, index) => {
        if (!currentSocketIds.includes(id)) {
          console.log(`Auto-removing disconnected player at index ${index} (ID: ${id})`);
          removePlayer(index);
        }
      });
    }
  }, [multiplayer?.players, isHost, setup, playerIds]);


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
        if (activeRules.some(r => r.key === "social_envy")) {
          const myScore = totalScore(player, currentScores);
          const unlucky = players.filter((_, i) => i !== player && totalScore(i, currentScores) < myScore);
          if (unlucky.length > 0) return "👑 Invidia Sociale – Bevono tutti quelli con meno punti di te: " + unlucky.join(", ");
          return "👑 Invidia Sociale – Nessuno ha meno punti di te: BEVI TU! 🍺";
        }
        const min = Math.min(...players.map((_, i) => totalScore(i, currentScores)));
        const losers = players.filter((_, i) => totalScore(i, currentScores) === min);
        return "Bevono (punteggio più basso): " + losers.join(", ");
      }
      case "largeStraight": {
        if (activeRules.some(r => r.key === "social_envy")) {
          const myScore = totalScore(player, currentScores);
          const envious = players.filter((_, i) => i !== player && totalScore(i, currentScores) > myScore);
          if (envious.length > 0) return "🎯 Invidia Sociale – Bevono tutti quelli con più punti di te: " + envious.join(", ");
          return "🎯 Invidia Sociale – Nessuno ha più punti di te: BEVI TU! 🍺";
        }
        const max = Math.max(...players.map((_, i) => totalScore(i, currentScores)));
        const winners = players.filter((_, i) => totalScore(i, currentScores) === max);
        return "Bevono (punteggio più alto): " + winners.join(", ");
      }
      case "yahtzee": return "🔥 BEVONO TUTTI GLI ALTRI + Crea una nuova regola!";
      case "chance": {
        const currentChance = currentScores[player]?.chance || 0;
        // Raccoglie i punteggi chance degli ALTRI che hanno già segnato e > 0
        const othersWithChance = players
          .map((name, i) => ({ name, i, v: currentScores[i]?.chance }))
          .filter(({ i, v }) => i !== player && v !== undefined && v > 0);

        const losers = othersWithChance.filter(({ v }) => v < currentChance).map(({ name }) => name);

        if (losers.length > 0) {
          return "Bevono tutti quelli con Chance inferiore alla tua: " + losers.join(", ");
        } else {
          return "Nessuno ha una Chance inferiore alla tua: BEVI TU! 🍺";
        }
      }
      default: return "";
    }
  };

  const triggerChaosRule = (currentActiveRules = activeRules) => {
    const inactiveRules = SPECIAL_RULES.filter(sr => !currentActiveRules.some(ar => ar.key === sr.key));
    if (inactiveRules.length > 0) {
      const randomRule = inactiveRules[Math.floor(Math.random() * inactiveRules.length)];
      setActiveRules(prev => [...prev, { type: "special", ...randomRule }]);
      setPopup(`💥 MODALITÀ CAOS! 💥\n\nIl gioco ha attivato automaticamente una regola speciale:\n\n✨ ${randomRule.title} ✨\n${randomRule.desc}`);
      setMidTurnPopup(true);
    } else {
      setPopup("💥 MODALITÀ CAOS! 💥\n\nIl caos ha raggiunto il suo apice! Tutte le regole speciali sono già attive! 🍻");
      setMidTurnPopup(true);
    }
  };

  const startGame = (overrideNames = null, overrideIds = null) => {
    const namesSource = overrideNames || playerNames;
    const idsSource = overrideIds || [];

    // Pulisci e deduplica nomi
    const validNames = [];
    const validIds = [];

    namesSource.forEach((n, i) => {
      if (n && n.trim() !== "") {
        validNames.push(n.trim());
        if (idsSource[i]) validIds.push(idsSource[i]);
      }
    });

    if (validNames.length < 2) return;

    // Shuffle player order to ensure random starting positions
    const shuffled = validNames.map((name, i) => ({ name, id: validIds[i] })).sort(() => Math.random() - 0.5);
    const shuffledNames = shuffled.map(p => p.name);
    const shuffledIds = shuffled.map(p => p.id);
    setPlayers(shuffledNames);
    setScores(shuffledNames.map(() => ({})));
    setPlayerIds(shuffledIds);
    setRoundCount(0);
    setSetup(false);

    if (rulesMode === "CAOS") {
      triggerChaosRule([]);
    }
  };

  const rollDice = (bypassTurnCheck = false) => {
    if (!bypassTurnCheck && multiplayer && playerIds.length > 0) {
      if (socketId !== playerIds[player]) {
        console.warn('[GS] rollDice BLOCKED: not your turn');
        return;
      }
    }

    if (!bypassTurnCheck && multiplayer && !isHost) {
      sendAction('ROLL_DICE');
      return;
    }
    if (rollsLeft === 0 || rolling) return;

    setRolling(true);
    triggerHaptic();
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

      if (activeRules.some(r => r.key === "parity_rule")) {
        const allEven = newDice.every(d => d % 2 === 0);
        const allOdd = newDice.every(d => d % 2 !== 0);
        if (allEven || allOdd) {
          const typeStr = allEven ? "Pari" : "Dispari";
          if (extraPopup) extraPopup += `\n\nRegola Pari o Dispari: I dadi sono tutti ${typeStr}! BEVI! 🍺`;
          else extraPopup = `Regola Pari o Dispari: I dadi sono tutti ${typeStr}! BEVI! 🍺`;
        }
      }
        if (activeRules.some(r => r.key === "nico_rule") && !nicoPenaltyApplied && rolledCount >= 4 && rollsLeft < 3) {
          const nicoMsg = "⚡ Regola Nico: Hai rilanciato 4 o più dadi – BEVI! 🍺";
          extraPopup = extraPopup ? `${extraPopup}\n\n${nicoMsg}` : nicoMsg;
          setNicoPenaltyApplied(true);
        }

      if (extraPopup) {
        setPopup(extraPopup);
        setMidTurnPopup(true);
      }

      setRollsLeft((r) => r - 1);
      setRolling(false);
    }, 400);
  };

  const toggleHold = (i, bypassTurnCheck = false) => {
    // Protezione Turno Multiplayer
    if (!bypassTurnCheck && multiplayer && playerIds.length > 0) {
      if (socketId !== playerIds[player]) return; // Non è il tuo turno
    }

    if (!bypassTurnCheck && multiplayer && !isHost) {
      sendAction('TOGGLE_HOLD', { index: i });
      return;
    }
    if (rollsLeft === 3) return;

    setHeld((prev) => prev.map((h, idx) => (idx === i ? !h : h)));
  };

  const selectCategory = (cat, bypassTurnCheck = false) => {
    // Protezione Turno Multiplayer
    if (!bypassTurnCheck && multiplayer && playerIds.length > 0) {
      if (socketId !== playerIds[player]) return; // Non è il tuo turno
    }

    if (!bypassTurnCheck && multiplayer && !isHost) {
      sendAction('SELECT_CATEGORY', { cat });
      return;
    }
    if (rollsLeft === 3) return;

    if (!scores[player] || scores[player][cat] !== undefined) return;

    const value = calculateScore(dice, cat);
    triggerHaptic();
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

    if (value === 0) {
      popupParts.push("💀 HAI SEGNATO 0: BEVI 2! 🍺🍺");
    }

    if (bonusAchieved) {
      popupParts.push("🎉 BONUS SBLOCCATO! (+35 pt)\nScegli 3 persone (o la stessa 3 volte) da far bere! 🍻");
    }

      // Gestione scommessa con possibile regola Inversione
      if (bet) {
        const inverted = activeRules.some(r => r.key === "inverted_bet");
        if (cat === bet && value > 0) {
          if (inverted) {
            popupParts.push("🎯 SCOMMESSA VINTA! (Inversione) – BEVI TU! 🍺");
          } else {
            popupParts.push("🎯 SCOMMESSA VINTA!\nScegli chi beve un sorso extra!");
          }
        } else {
          if (inverted) {
            popupParts.push("❌ SCOMMESSA PERSA! (Inversione) – BEVI UN SORSO EXTRA!");
          } else {
            popupParts.push("❌ SCOMMESSA PERSA!\nBevi tu un sorso extra!");
          }
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
    if (value > 0 || isExtraYahtzee || cat === "chance") {
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
    if (multiplayer && !isHost) {
      sendAction('CLOSE_POPUP');
      return;
    }
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
    const nextP = (player + 1) % players.length;
    const completedRound = nextP === 0;
    const nextRound = completedRound ? roundCount + 1 : roundCount;

    setPlayer(nextP);
    if (completedRound) setRoundCount(nextRound);
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    setNicoPenaltyApplied(false);

    // Caos: attiva una regola casuale dopo 4, 8, 12 giri completi (tutti i giocatori hanno giocato)
    if (completedRound && rulesMode === "CAOS" && (nextRound === 4 || nextRound === 8 || nextRound === 12)) {
      triggerChaosRule();
    }
  };

  // --- AZIONI MODAL MULTIPLAYER ---
  // Queste funzioni sostituiscono le chiamate dirette ai setter nei modal,
  // garantendo che il guest invii l'azione all'host invece di agire in locale.

  const selectTrap = (trapKey, bypass = false) => {
    if (!bypass && multiplayer && !isHost) {
      sendAction('SELECT_TRAP', { trapKey: trapKey ?? null });
      return;
    }
    if (trapKey) setTraps(prev => [...prev, trapKey]);
    setShowTrapModal(false);
    nextTurn();
  };

  const placeBet = (betKey, bypass = false) => {
    if (!bypass && multiplayer && !isHost) {
      sendAction('PLACE_BET', { betKey: betKey ?? null });
      return;
    }
    setBet(betKey ?? null);
    setShowBetModal(false);
  };

  const applyRule = (rule, bypass = false) => {
    if (!bypass && multiplayer && !isHost) {
      sendAction('APPLY_RULE', { rule: rule ?? null });
      return;
    }
    if (rule) setActiveRules(prev => [...prev, rule]);
    setShowRuleModal(false);
    nextTurn();
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

  const removePlayer = (idx) => {
    // Gestione Multiplayer Kick
    if (multiplayer && isHost) {
      const targetSocketId = playerIds[idx]; // Usa l'ID salvato nello stato gioco
      if (targetSocketId && targetSocketId !== socketId) {
        multiplayer.kickPlayer(targetSocketId);
      }
    }

    if (players.length < 2) {
      resetGame();
      return;
    }

    const newPlayers = players.filter((_, i) => i !== idx);
    const newScores = scores.filter((_, i) => i !== idx);
    const newIds = playerIds.filter((_, i) => i !== idx);

    let nextPlayer = player;

    // Se il giocatore rimosso viene prima di quello attuale, scala l'indice
    if (idx < player) {
      nextPlayer = player - 1;
    }
    // Se era il turno di chi è stato rimosso, nextPlayer rimane lo stesso (che ora punta al prossimo)
    // ma dobbiamo assicurarci che non vada fuori range
    if (nextPlayer >= newPlayers.length) {
      nextPlayer = 0;
    }

    setPlayers(newPlayers);
    setScores(newScores);
    setPlayerIds(newIds);
    setPlayer(nextPlayer);

    // Reset turn state
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    setBet(null);
  };

  const restartGame = () => {
    setScores(players.map(() => ({})));
    setPlayer(0);
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    setTraps([]);
    setActiveRules([]);
    setPopup(null);
    setBet(null);
    setRoundCount(0);
    if (rulesMode === "CAOS") {
      triggerChaosRule([]);
    }
  };

  const resetGame = () => {
    // Gestione Multiplayer Close
    if (multiplayer && isHost) {
      multiplayer.closeRoom();
    }
    // Reset all game state to its initial defaults
    setSetup(true);
    setPlayerNames(["", "", "", ""]);
    setPlayers([]);
    setScores([]);
    setActiveRules([]);
    setTraps([]);
    setRoundCount(0);
    setPlayer(0);
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    setBet(null);
    setPopup(null);
  };

  return {
    setup, playerNames, setPlayerNames, players, betMode, setBetMode, trapMode, setTrapMode, rulesMode, setRulesMode,
    dice, held, rollsLeft, player, scores, rolling, popup, bet, setBet, showBetModal, setShowBetModal,
    traps, setTraps, showTrapModal, setShowTrapModal, showYahtzeeAnim, activeRules, setActiveRules, showRuleModal, setShowRuleModal,
    showManagementModal, setShowManagementModal, isHost, socketId,
    multiplayerPlayers: multiplayer?.players || [],
    isMultiplayer: !!multiplayer,
    isMyTurn: multiplayer
      ? (playerIds.length > 0 ? socketId === playerIds[player] : false)
      : true,
    getUpperScore, totalScore, startGame, rollDice, toggleHold, selectCategory, handleClosePopup, nextTurn,
    selectTrap, placeBet, applyRule,
    isGameOver, getWinner, resetGame, removePlayer, restartGame
  };
}
