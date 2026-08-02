import { useState, useEffect, useRef } from "react";
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
  const [betWithTrap, setBetWithTrap] = useState(false);
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
  const [popupDrinkers, setPopupDrinkers] = useState(null);
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
  const [triggeredRulesThisTurn, setTriggeredRulesThisTurn] = useState([]);
  const [lastPlayedCategory, setLastPlayedCategory] = useState(null);
  const [popupPickerEvents, setPopupPickerEvents] = useState([]);
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [drinkStats, setDrinkStats] = useState({}); // { [playerName]: totalSips }

  // Refs per evitare stale closure in handleClosePopup (critico per multiplayer)
  const midTurnPopupRef = useRef(false);
  const pendingTrapRef = useRef(false);
  const pendingYahtzeeRef = useRef(false);
  const popupPickerEventsRef = useRef([]);
  const pendingAfterPickerRef = useRef({ trap: false, yahtzee: false });

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
      setPopupDrinkers(remoteState.popupDrinkers ?? null);
      setBet(remoteState.bet);
      setTraps(remoteState.traps);
      setActiveRules(remoteState.activeRules);
      setShowBetModal(remoteState.showBetModal);
      setShowTrapModal(remoteState.showTrapModal);
      setShowRuleModal(remoteState.showRuleModal);
      if (remoteState.betMode) setBetMode(remoteState.betMode);
      if (remoteState.trapMode) setTrapMode(remoteState.trapMode);
      if (remoteState.betWithTrap !== undefined) setBetWithTrap(remoteState.betWithTrap);
      if (remoteState.rulesMode) setRulesMode(remoteState.rulesMode);
      if (remoteState.roundCount !== undefined) setRoundCount(remoteState.roundCount);
      if (remoteState.lastPlayedCategory !== undefined) setLastPlayedCategory(remoteState.lastPlayedCategory ?? null);
      setPopupPickerEvents(remoteState.popupPickerEvents || []);
      setShowPlayerPicker(remoteState.showPlayerPicker || false);
      if (remoteState.drinkStats) setDrinkStats(remoteState.drinkStats);
    }
  }, [multiplayer?.lastReceivedState, isHost]);

  useEffect(() => {
    if (multiplayer && isHost && syncState) {
      syncState({
        setup, players, dice, held, rollsLeft, player, scores, rolling, playerIds,
        popup, popupDrinkers, bet, traps, activeRules, showBetModal, showTrapModal, showRuleModal,
        betMode, trapMode, rulesMode, roundCount, betWithTrap, lastPlayedCategory,
        popupPickerEvents, showPlayerPicker, drinkStats
      });
    }
  }, [setup, players, dice, held, rollsLeft, player, scores, rolling, playerIds, popup, popupDrinkers, bet, traps, activeRules, showBetModal, showTrapModal, showRuleModal, betMode, trapMode, rulesMode, roundCount, betWithTrap, lastPlayedCategory, popupPickerEvents, showPlayerPicker, drinkStats, isHost, syncState]);


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

  // Helper: returns an object { name: sipCount } for a given drink rule category
  const getDrinkers = (cat, currentScores = scores) => {
    const addDrinker = (map, name, count = 1) => {
      map[name] = (map[name] || 0) + count;
    };
    const result = {};

    switch (cat) {
      case "threeKind":
        // "Scegli chi beve" - not determinable
        return null;
      case "fourKind":
        // "Scegli 2 che bevono" - not determinable
        return null;
      case "fullHouse":
        // Bevono tutti (compreso te)
        players.forEach(name => addDrinker(result, name));
        return result;
      case "smallStraight": {
        if (activeRules.some(r => r.key === "social_envy")) {
          const myScore = totalScore(player, currentScores);
          const unlucky = players.filter((_, i) => i !== player && totalScore(i, currentScores) < myScore);
          if (unlucky.length > 0) {
            unlucky.forEach(name => addDrinker(result, name));
          } else {
            addDrinker(result, players[player]);
          }
          return result;
        }
        const min = Math.min(...players.map((_, i) => totalScore(i, currentScores)));
        const losers = players.filter((_, i) => totalScore(i, currentScores) === min);
        losers.forEach(name => addDrinker(result, name));
        return result;
      }
      case "largeStraight": {
        if (activeRules.some(r => r.key === "social_envy")) {
          const myScore = totalScore(player, currentScores);
          const envious = players.filter((_, i) => i !== player && totalScore(i, currentScores) > myScore);
          if (envious.length > 0) {
            envious.forEach(name => addDrinker(result, name));
          } else {
            addDrinker(result, players[player]);
          }
          return result;
        }
        const max = Math.max(...players.map((_, i) => totalScore(i, currentScores)));
        const winners = players.filter((_, i) => totalScore(i, currentScores) === max);
        winners.forEach(name => addDrinker(result, name));
        return result;
      }
      case "yahtzee":
        // Bevono tutti gli altri
        players.forEach((name, i) => { if (i !== player) addDrinker(result, name); });
        return result;
      case "chance": {
        const currentChance = currentScores[player]?.chance || 0;
        const othersWithChance = players
          .map((name, i) => ({ name, i, v: currentScores[i]?.chance }))
          .filter(({ i, v }) => i !== player && v !== undefined && v > 0);
        const losers = othersWithChance.filter(({ v }) => v < currentChance).map(({ name }) => name);
        if (losers.length > 0) {
          losers.forEach(name => addDrinker(result, name));
        } else {
          addDrinker(result, players[player]);
        }
        return result;
      }
      default: return null;
    }
  };

  // Wrapper che aggiorna sia lo stato che il ref corrispondente
  const setMidTurnPopupSafe = (val) => { midTurnPopupRef.current = val; setMidTurnPopup(val); };
  const setPendingTrapSafe = (val) => { pendingTrapRef.current = val; setPendingTrap(val); };
  const setPendingYahtzeeSafe = (val) => { pendingYahtzeeRef.current = val; setPendingYahtzee(val); };
  const setPopupPickerEventsSafe = (val) => { popupPickerEventsRef.current = val; setPopupPickerEvents(val); };

  const triggerChaosRule = (currentActiveRules = activeRules) => {
    const inactiveRules = SPECIAL_RULES.filter(sr => !currentActiveRules.some(ar => ar.key === sr.key));
    if (inactiveRules.length > 0) {
      const randomRule = inactiveRules[Math.floor(Math.random() * inactiveRules.length)];
      setActiveRules(prev => [...prev, { type: "special", ...randomRule }]);
      setPopup(`💥 MODALITÀ CAOS! 💥\n\nIl gioco ha attivato automaticamente una regola speciale:\n\n✨ ${randomRule.title} ✨\n${randomRule.desc}`);
      setMidTurnPopupSafe(true);
    } else {
      setPopup("💥 MODALITÀ CAOS! 💥\n\nIl caos ha raggiunto il suo apice! Tutte le regole speciali sono già attive! 🍻");
      setMidTurnPopupSafe(true);
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
    setDrinkStats({});
    setSetup(false);

    if (rulesMode.startsWith("CAOS")) {
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
      let midTurnEventCount = 0;
      const midTurnDrinkers = {};
      const addMidDrinker = (name, count = 1) => { midTurnDrinkers[name] = (midTurnDrinkers[name] || 0) + count; };
      const newlyTriggered = [];

      if (activeRules.some(r => r.key === "minguccio") && rolledCount === 5 && !triggeredRulesThisTurn.includes("minguccio")) {
        if (hasOfAKind(newCounts, 3)) {
          extraPopup = "Regola Minguccio: Hai lanciato 5 dadi insieme e hai fatto almeno Tris! BEVI! 🍺";
          addMidDrinker(players[player]);
          midTurnEventCount++;
          newlyTriggered.push("minguccio");
        }
      }

      if (activeRules.some(r => r.key === "simo_rule") && rolledCount === 5 && !triggeredRulesThisTurn.includes("simo_rule")) {
        const unique = [...new Set(newDice)].sort((a, b) => a - b);
        let hasConsecutive = false;
        for (let ci = 0; ci < unique.length - 2; ci++) {
          if (unique[ci + 1] === unique[ci] + 1 && unique[ci + 2] === unique[ci] + 2) {
            hasConsecutive = true;
            break;
          }
        }
        if (hasConsecutive) {
          const simoMsg = "Regola Simo: Ti è uscito un \"Tris\" (tre numeri consecutivi)! Scegli chi beve! 🍺";
          extraPopup = extraPopup ? `${extraPopup}\n\n${simoMsg}` : simoMsg;
          midTurnEventCount++;
          newlyTriggered.push("simo_rule");
        }
      }

      if (activeRules.some(r => r.key === "mirsi") && rollsLeft === 1 && !triggeredRulesThisTurn.includes("mirsi")) {
        const sum = newDice.reduce((acc, v) => acc + v, 0);
        if (sum > 22) {
          if (extraPopup) extraPopup += `\n\nRegola Mirsi: La somma al 3° lancio è > 22 (${sum})! BEVI! 🍺`;
          else extraPopup = `Regola Mirsi: La somma al 3° lancio è > 22 (${sum})! BEVI! 🍺`;
          addMidDrinker(players[player]);
          midTurnEventCount++;
          newlyTriggered.push("mirsi");
        }
      }

      if (activeRules.some(r => r.key === "parity_rule") && !triggeredRulesThisTurn.includes("parity_rule")) {
        const allEven = newDice.every(d => d % 2 === 0);
        const allOdd = newDice.every(d => d % 2 !== 0);
        if (allEven || allOdd) {
          const typeStr = allEven ? "Pari" : "Dispari";
          if (extraPopup) extraPopup += `\n\nRegola Pari o Dispari: I dadi sono tutti ${typeStr}! BEVI! 🍺`;
          else extraPopup = `Regola Pari o Dispari: I dadi sono tutti ${typeStr}! BEVI! 🍺`;
          addMidDrinker(players[player]);
          midTurnEventCount++;
          newlyTriggered.push("parity_rule");
        }
      }

      if (activeRules.some(r => r.key === "seven_devils") && !triggeredRulesThisTurn.includes("seven_devils")) {
        const diceSum = newDice.reduce((acc, v) => acc + v, 0);
        if (diceSum % 7 === 0) {
          const sevenMsg = `😈 Sette Diavoli: La somma dei dadi è ${diceSum} (multiplo di 7)! BEVONO TUTTI! 🍺`;
          extraPopup = extraPopup ? `${extraPopup}\n\n${sevenMsg}` : sevenMsg;
          players.forEach(name => addMidDrinker(name));
          midTurnEventCount++;
          newlyTriggered.push("seven_devils");
        }
      }
        if (activeRules.some(r => r.key === "nico_rule") && !nicoPenaltyApplied && rolledCount >= 4 && rollsLeft < 3 && !triggeredRulesThisTurn.includes("nico_rule")) {
          const nicoMsg = "⚡ Regola Nico: Hai rilanciato 4 o più dadi – BEVI! 🍺";
          extraPopup = extraPopup ? `${extraPopup}\n\n${nicoMsg}` : nicoMsg;
          addMidDrinker(players[player]);
          midTurnEventCount++;
          setNicoPenaltyApplied(true);
          newlyTriggered.push("nico_rule");
        }

      if (extraPopup) {
        setPopup(extraPopup);
        setPopupDrinkers(Object.keys(midTurnDrinkers).length > 0 ? midTurnDrinkers : null);
        setMidTurnPopupSafe(true);
        if (newlyTriggered.length > 0) {
          setTriggeredRulesThisTurn(prev => [...prev, ...newlyTriggered]);
        }
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
    if (rolling) return;
    if (showTrapModal || showRuleModal || showBetModal) return;

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

    // Build drinkers map for popup header
    const drinkers = {};
    const addDrinkerToMap = (name, count = 1) => { 
      drinkers[name] = (drinkers[name] || 0) + count; 
      setDrinkStats(prev => ({ ...prev, [name]: (prev[name] || 0) + count }));
    };

    let popupParts = [];
    const pickerEvents = []; // eventi "scegli chi beve" → apriranno il PlayerPickerModal

    // Regola Copycat: stessa categoria dell'ultimo giocatore
    if (activeRules.some(r => r.key === "copycat") && lastPlayedCategory && cat === lastPlayedCategory) {
      popupParts.push("🐱 Copycat! Hai scelto la stessa categoria dell'ultimo giocatore! BEVI! 🍺");
      addDrinkerToMap(players[player]);
    }

    if (value === 0) {
      popupParts.push("💀 HAI SEGNATO 0: BEVI 2! 🍺🍺");
      addDrinkerToMap(players[player], 2);
    }

    if (bonusAchieved) {
      popupParts.push("🎉 BONUS SBLOCCATO! (+35 pt)\nScegli 3 persone (o la stessa 3 volte) da far bere! 🍻");
      pickerEvents.push({ sips: 3, label: '🎉 Bonus – Distribuisci 3 sorsi (puoi ripetere lo stesso giocatore)' });
    }

      // Gestione scommessa con possibile regola Inversione
      if (bet) {
        const inverted = activeRules.some(r => r.key === "inverted_bet");
        const betWon = (cat === bet && value > 0);
        
        if (betWon) {
          if (inverted) {
            popupParts.push("🎯 SCOMMESSA VINTA! (Inversione) – BEVI TU! 🍺");
            addDrinkerToMap(players[player]);
          } else {
            popupParts.push("🎯 SCOMMESSA VINTA!\nScegli chi beve un sorso extra!");
            pickerEvents.push({ sips: 1, label: '🎯 Scommessa vinta – Scegli chi beve un sorso extra' });
          }
          
          // Scommessa con Trappola: si attiva solo se la scommessa è vinta E le trappole sono abilitate
          if (betWithTrap && trapMode !== "NO") {
            popupParts.push(`🚨 Scommessa con Trappola:\nÈ stata piazzata una trappola automatica su ${CATEGORIES.find(c => c.key === bet)?.label || bet}!`);
            setTraps(prev => [...prev, bet]);
          }
        } else {
          if (inverted) {
            popupParts.push("❌ SCOMMESSA PERSA! (Inversione) – Scegli chi beve un sorso extra!");
            pickerEvents.push({ sips: 1, label: '❌ Scommessa persa (Inversione) – Scegli chi beve un sorso extra' });
          } else {
            popupParts.push("❌ SCOMMESSA PERSA!\nBevi tu un sorso extra!");
            addDrinkerToMap(players[player]);
          }
        }
      }

    const matchingTrapsCount = traps.filter(t => t === cat).length;
    if (matchingTrapsCount > 0 && value > 0) {
      const isCounterTrap = activeRules.some(r => r.key === "counter_trap");
      if (isCounterTrap) {
        if (matchingTrapsCount === 1) {
          popupParts.push("🚨 TRAPPOLA! (Controtrappola) 🚨\nScegli TU chi beve 1 sorso!");
        } else {
          popupParts.push(`🚨 ${matchingTrapsCount} TRAPPOLE! (Controtrappola) 🚨\nScegli TU chi beve ${matchingTrapsCount} sorsi!`);
        }
        pickerEvents.push({ sips: matchingTrapsCount, label: `🚨 Controtrappola – Scegli TU chi beve (${matchingTrapsCount} sorso/i)` });
        // Con controtrappola non aggiungiamo il current player ai drinkers
      } else {
        if (matchingTrapsCount === 1) {
          popupParts.push("🚨 SEI CADUTO NELLA TRAPPOLA! 🚨\nBevi 1 sorso extra!");
        } else {
          popupParts.push(`🚨 SEI CADUTO IN ${matchingTrapsCount} TRAPPOLE! 🚨\nBevi ${matchingTrapsCount} sorsi extra!`);
        }
        addDrinkerToMap(players[player], matchingTrapsCount);
      }
      setTraps(prev => prev.filter(t => t !== cat));
    }

    // Regola Trappola Automatica: piazza una trappola sulla categoria appena segnata (se punti > 0 E trappole abilitate)
    if (activeRules.some(r => r.key === "auto_trap") && value > 0 && trapMode !== "NO") {
      const catLabel = CATEGORIES.find(c => c.key === cat)?.label || cat;
      popupParts.push(`🔫 Trappola Automatica: hai segnato su ${catLabel}! Una trappola è stata piazzata per gli altri!`);
      setTraps(prev => [...prev, cat]);
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

        const ruleTriggered = (r.part2 === "quando fai punti su" && value > 0) || (r.part2 === "quando NON fai punti su (0 pt)" && value === 0);
        if (ruleTriggered) {
          if (r.part2 === "quando fai punti su" && value > 0) {
            popupParts.push(`📜 Regola Custom attivata:\n${dynamicPart1}`);
          } else {
            popupParts.push(`📜 Regola Custom attivata (0 punti):\n${dynamicPart1}`);
          }
          // Extract drinkers from custom rules
          const p1Lower = r.part1.toLowerCase();
          if (p1Lower.includes("bevono tutti tranne te")) {
            players.forEach((name, i) => { if (i !== player) addDrinkerToMap(name); });
          } else if (p1Lower.includes("bevono tutti")) {
            players.forEach(name => addDrinkerToMap(name));
          } else if (p1Lower.includes("bevi tu il doppio")) {
            addDrinkerToMap(players[player], 2);
          } else if (p1Lower.includes("bevi tu")) {
            addDrinkerToMap(players[player]);
          } else if (p1Lower.includes("più punti")) {
            const max = Math.max(...players.map((_, i) => totalScore(i, newScores)));
            players.filter((_, i) => totalScore(i, newScores) === max).forEach(name => addDrinkerToMap(name));
          } else if (p1Lower.includes("meno punti")) {
            const min = Math.min(...players.map((_, i) => totalScore(i, newScores)));
            players.filter((_, i) => totalScore(i, newScores) === min).forEach(name => addDrinkerToMap(name));
          }
          // Se la regola custom dice "scegli chi beve", apriamo il picker
          if (p1Lower.includes('scegli chi beve')) {
            pickerEvents.push({ sips: 1, label: `📜 Regola Custom – Scegli chi beve` });
          }
        }
      }
    });


    // Per extra yahtzee usa sempre la drink rule dello yahtzee normale
    const ruleKey = isExtraYahtzee ? "yahtzee" : cat;
    let rule = "";
    if (value > 0 || isExtraYahtzee || cat === "chance") {
      rule = getDrinkRule(ruleKey, newScores);
      // Merge drink rule drinkers
      const ruleDrinkers = getDrinkers(ruleKey, newScores);
      if (ruleDrinkers) {
        Object.entries(ruleDrinkers).forEach(([name, count]) => addDrinkerToMap(name, count));
      }
      // Picker per le categorie che richiedono "scegli chi beve"
      if (ruleKey === 'threeKind' && value > 0) {
        pickerEvents.push({ sips: 1, label: '🥂 Tris – Scegli chi beve' });
      } else if (ruleKey === 'fourKind' && value > 0) {
        pickerEvents.push({ sips: 2, label: '🥂 Poker – Scegli 2 che bevono' });
      }
    }
    if (rule) popupParts.push("Regola Turno:\n" + rule);

    setLastPlayedCategory(cat);

    const triggeredTrapSet = (trapMode !== "NO" && cat === "fourKind" && value >= 18);

    if (popupParts.length > 0) {
      setPopup(popupParts.join("\n\n"));
      setPopupDrinkers(Object.keys(drinkers).length > 0 ? drinkers : null);
      setPendingTrapSafe(triggeredTrapSet);
      setPendingYahtzeeSafe(isYahtzeeTriggered);
      setPopupPickerEventsSafe(pickerEvents);
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
    setPopupDrinkers(null);

    // Usiamo i ref per leggere sempre lo stato ATTUALE (evita stale closure in multiplayer)
    // Critico: quando l'host processa CLOSE_POPUP di un guest via gameStateRef,
    // le variabili di stato chiuse nel closure potrebbero essere stale.
    const isMidTurn = midTurnPopupRef.current;
    const hasPendingTrap = pendingTrapRef.current;
    const hasPendingYahtzee = pendingYahtzeeRef.current;

    const hasPickerEvents = popupPickerEventsRef.current.length > 0;

    if (isMidTurn) {
      setMidTurnPopupSafe(false);
      return;
    }

    // Fine turno effettivo: azzeriamo la scommessa
    setBet(null);

    if (hasPickerEvents) {
      // Memorizza il pending state e mostra il picker prima di avanzare il turno
      pendingAfterPickerRef.current = { trap: hasPendingTrap, yahtzee: hasPendingYahtzee };
      setPendingTrapSafe(false);
      setPendingYahtzeeSafe(false);
      setShowPlayerPicker(true);
    } else if (hasPendingTrap) {
      setShowTrapModal(true);
      setPendingTrapSafe(false);
    } else if (hasPendingYahtzee) {
      setShowRuleModal(true);
      setPendingYahtzeeSafe(false);
    } else {
      nextTurn();
    }
  };

  const handlePickerDone = (picksLog = [], bypass = false) => {
    if (!bypass && multiplayer && !isHost) {
      sendAction('PICKER_DONE', { picksLog });
      return;
    }
    
    if (picksLog && picksLog.length > 0) {
      setDrinkStats(prev => {
        const next = { ...prev };
        picksLog.forEach(name => {
          next[name] = (next[name] || 0) + 1;
        });
        return next;
      });
    }

    setShowPlayerPicker(false);
    setPopupPickerEventsSafe([]);
    const { trap, yahtzee } = pendingAfterPickerRef.current;
    pendingAfterPickerRef.current = { trap: false, yahtzee: false };
    if (trap) {
      setShowTrapModal(true);
    } else if (yahtzee) {
      setShowRuleModal(true);
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
    setTriggeredRulesThisTurn([]);
    // Assicura che i modal non rimangano aperti tra un turno e l'altro
    // (showBetModal aperto causa il blocco silenzioso di selectCategory)
    setShowBetModal(false);
    setShowTrapModal(false);
    setShowRuleModal(false);
    setShowPlayerPicker(false);
    setPopupPickerEventsSafe([]);
    pendingAfterPickerRef.current = { trap: false, yahtzee: false };

    // Caos: attiva una regola casuale in base all'intervallo scelto
    if (completedRound && rulesMode.startsWith("CAOS")) {
      const interval = parseInt(rulesMode.split("_")[1]) || 4; // fallback
      if (nextRound > 0 && nextRound % interval === 0) {
        triggerChaosRule();
      }
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
    setTriggeredRulesThisTurn([]);
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
    setTriggeredRulesThisTurn([]);
    setLastPlayedCategory(null);
    if (rulesMode.startsWith("CAOS")) {
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
    setTriggeredRulesThisTurn([]);
    setLastPlayedCategory(null);
  };

  return {
    setup, playerNames, setPlayerNames, players, betMode, setBetMode, trapMode, setTrapMode, rulesMode, setRulesMode, betWithTrap, setBetWithTrap,
    dice, held, rollsLeft, player, scores, rolling, popup, popupDrinkers, bet, setBet, showBetModal, setShowBetModal,
    traps, setTraps, showTrapModal, setShowTrapModal, showYahtzeeAnim, activeRules, setActiveRules, showRuleModal, setShowRuleModal,
    showManagementModal, setShowManagementModal, isHost, socketId, playerIds, roundCount,
    popupPickerEvents, showPlayerPicker, handlePickerDone, drinkStats,
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
