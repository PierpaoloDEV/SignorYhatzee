import { useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

export const COLORS = ["red", "blue", "yellow", "green"];

export const COLOR_LABELS = {
  red: "Rosso 🔴",
  blue: "Blu 🔵",
  yellow: "Giallo 🟡",
  green: "Verde 🟢",
};

export const COLOR_EMOJIS = {
  red: "🔴",
  blue: "🔵",
  yellow: "🟡",
  green: "🟢",
};

// The outer track has 52 cells (0–51).
// Each color starts entering the track at a different offset.
// Entry cells on the outer track (0-indexed):
export const ENTRY_CELL = { red: 0, blue: 13, yellow: 26, green: 39 };

// Safe cells on the outer track (star positions in standard Ludo)
export const SAFE_CELLS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// After cell 51, tokens enter their home stretch (5 cells, index 0–4), then home (index 5).
// Each color's home stretch starts after they pass their last track cell.
// Track position just before home stretch:
export const HOME_ENTRY = { red: 51, blue: 12, yellow: 25, green: 38 };

// ─── Initial state helpers ─────────────────────────────────────────────────────

/**
 * Token state:
 *  { id, color, pos }
 *  pos:
 *    -1         → still in home base (not on board)
 *    0–51       → on the outer track (absolute)
 *    100–104    → in home stretch (100 = first cell, 104 = last cell before finish)
 *    105        → finished (safe in center)
 */
function makeTokens(color, count = 4) {
  const arr = [];
  for(let i = 0; i < count; i++) {
    arr.push({ id: `${color}-${i}`, color, pos: -1 });
  }
  return arr;
}

function initTokens(count = 4) {
  const tokens = {};
  COLORS.forEach((c) => {
    tokens[c] = makeTokens(c, count);
  });
  return tokens;
}

// ─── Movement helpers ─────────────────────────────────────────────────────────

/**
 * Given a token on the outer track (pos 0–51) for a given color,
 * compute new position after moving `steps` steps.
 * Returns the new pos (may enter home stretch = 100+).
 */
function computeNewPos(color, currentPos, steps) {
  if (currentPos === -1) {
    // Leaving home base: land on entry cell
    return ENTRY_CELL[color];
  }

  // Absolute position on the track
  const relativePos = (currentPos - ENTRY_CELL[color] + 52) % 52;
  const newRelative = relativePos + steps;

  if (newRelative >= 52) {
    // Entering home stretch
    const homeStep = newRelative - 52;
    if (homeStep >= 5) return 105; // finished
    return 100 + homeStep;
  }

  return (ENTRY_CELL[color] + newRelative) % 52;
}

/**
 * Check if a move is valid for a token.
 */
function isValidMove(token, diceValue) {
  if (token.pos === 105) return false; // already finished
  if (token.pos === -1 && diceValue !== 6) return false; // need 6 to enter
  if (token.pos === -1 && diceValue === 6) return true;

  const relativePos = (token.pos - ENTRY_CELL[token.color] + 52) % 52;
  const newRelative = relativePos + diceValue;

  // In home stretch
  if (token.pos >= 100) {
    const homePos = token.pos - 100;
    const newHomePos = homePos + diceValue;
    return newHomePos <= 5; // can't overshoot
  }

  // On track — check overshoot into home stretch
  if (newRelative > 57) return false; // too far, overshoot

  return true;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLudoState() {
  const [screen, setScreen] = useState("setup"); // "setup" | "game" | "over"
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);
  const [pawnsCount, setPawnsCount] = useState(4);
  const [diceCount, setDiceCount] = useState(1);
  const [tokens, setTokens] = useState(initTokens(4));
  const [currentPlayer, setCurrentPlayer] = useState(0); // 0–3
  const [diceValues, setDiceValues] = useState([]);
  const [usedDice, setUsedDice] = useState([]);
  const [activeDieIndex, setActiveDieIndex] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [extraRoll, setExtraRoll] = useState(false);
  const [selectableTokens, setSelectableTokens] = useState([]);
  const [captureMsg, setCaptureMsg] = useState(null);
  const [finishOrder, setFinishOrder] = useState([]); // colors in finish order
  const [rollCount, setRollCount] = useState(0); // consecutive 6s safety
  
  // Alcoholic rules state
  const [popup, setPopup] = useState(null);
  const [inactiveTurns, setInactiveTurns] = useState([0, 0, 0, 0]);

  const handleClosePopup = () => {
    setPopup(null);
  };

  const isPlayerImmune = (c) => {
    return tokens[c].some(t => SAFE_CELLS.has(t.pos));
  };

  const color = COLORS[currentPlayer];

  // ─── Start game ─────────────────────────────────────────────────────────────

  const startGame = () => {
    const names = playerNames.map((n, i) =>
      n.trim() !== "" ? n.trim() : COLOR_LABELS[COLORS[i]]
    );
    setPlayerNames(names);
    setTokens(initTokens(pawnsCount));
    setCurrentPlayer(0);
    setDiceValues([]);
    setUsedDice([]);
    setActiveDieIndex(0);
    setHasRolled(false);
    setExtraRoll(false);
    setSelectableTokens([]);
    setCaptureMsg(null);
    setFinishOrder([]);
    setRollCount(0);
    setPopup(null);
    setInactiveTurns([0, 0, 0, 0]);
    setScreen("game");
  };

  const resetGame = () => {
    setScreen("setup");
    setPlayerNames(["", "", "", ""]);
    setTokens(initTokens(pawnsCount));
    setCurrentPlayer(0);
    setDiceValues([]);
    setUsedDice([]);
    setActiveDieIndex(0);
    setHasRolled(false);
    setExtraRoll(false);
    setSelectableTokens([]);
    setCaptureMsg(null);
    setFinishOrder([]);
    setRollCount(0);
    setPopup(null);
    setInactiveTurns([0, 0, 0, 0]);
  };

  // ─── Roll dice ───────────────────────────────────────────────────────────────

  const updateSelectableTokens = (activeIdx, currentDice = diceValues, currentTokens = tokens) => {
    if (currentDice.length === 0 || usedDice[activeIdx]) {
      setSelectableTokens([]);
      return;
    }
    const val = currentDice[activeIdx];
    const myTokens = currentTokens[COLORS[currentPlayer]];
    const movable = myTokens.filter((t) => isValidMove(t, val));
    setSelectableTokens(movable.map((t) => t.id));
  };

  const setActiveDie = (index) => {
    if (usedDice[index]) return;
    setActiveDieIndex(index);
    updateSelectableTokens(index);
  };

  const rollDice = () => {
    if (rolling || hasRolled) return;
    setRolling(true);
    setCaptureMsg(null);

    setTimeout(() => {
      const vals = [];
      for(let i=0; i<diceCount; i++) {
        vals.push(Math.floor(Math.random() * 6) + 1);
      }
      setDiceValues(vals);
      setUsedDice(vals.map(() => false));
      setActiveDieIndex(0);
      setRolling(false);
      setHasRolled(true);

      const currentName = playerNames[currentPlayer] || COLOR_LABELS[COLORS[currentPlayer]];

      // Check for 3 consecutive 6s
      if (rollCount === 2 && vals.includes(6)) {
        setPopup(`🎲🎲🎲 3 VOLTE 6!\n${currentName}, il tuo turno finisce immediatamente e BEVI x3! 🍺🍺🍺`);
        // Disable moving for this roll
        setUsedDice(vals.map(() => true));
        setTimeout(() => advanceTurn(false, false), 1500);
        return;
      }

      // Determine which tokens can move for the first die
      const val = vals[0];
      const myTokens = tokens[COLORS[currentPlayer]];
      const movable = myTokens.filter((t) => isValidMove(t, val));

      if (movable.length === 0) {
        // If first die has no moves, check the second one if it exists
        if (vals.length > 1) {
          const movable2 = myTokens.filter((t) => isValidMove(t, vals[1]));
          if (movable2.length === 0) {
            setTimeout(() => advanceTurn(vals.includes(6), false), 800);
          } else {
            setActiveDieIndex(1);
            setSelectableTokens(movable2.map(t => t.id));
          }
        } else {
          setTimeout(() => advanceTurn(val === 6, false), 800);
        }
      } else if (movable.length === 1 && vals.length === 1) {
        setTimeout(() => moveToken(movable[0].id, val, tokens, 0, [false], vals), 400);
      } else {
        setSelectableTokens(movable.map((t) => t.id));
      }

      // Check for 6 ( Alcoholic rule )
      if (vals.includes(6)) {
        setPopup(`${currentName} ha fatto 6!\nScegli chi beve e ritira!`);
      }
    }, 600);
  };

  // ─── Move token ─────────────────────────────────────────────────────────────

  const moveToken = (tokenId, dice = diceValues[activeDieIndex], currentTokens = tokens, activeIdx = activeDieIndex, currentUsed = usedDice, currentVals = diceValues) => {
    if (!tokenId) return;
    setSelectableTokens([]);

    const color = tokenId.split("-")[0];
    const tokenIdx = currentTokens[color].findIndex((t) => t.id === tokenId);
    if (tokenIdx === -1) return;

    const token = currentTokens[color][tokenIdx];
    const newPos = computeNewPos(color, token.pos, dice);

    let newTokens = {
      ...currentTokens,
      [color]: currentTokens[color].map((t, i) =>
        i === tokenIdx ? { ...t, pos: newPos } : t
      ),
    };

    // Check capture
    let captured = null;
    if (newPos >= 0 && newPos <= 51 && !SAFE_CELLS.has(newPos)) {
      COLORS.forEach((c) => {
        if (c === color) return;
        newTokens[c] = newTokens[c].map((t) => {
          if (t.pos === newPos) {
            captured = c;
            return { ...t, pos: -1 };
          }
          return t;
        });
      });
    }

    const myNewTokens = newTokens[color].map((t, i) =>
      i === tokenIdx ? { ...t, pos: newPos } : t
    );
    const reallyAllFinished = myNewTokens.every((t) => t.pos === 105);

    setTokens(newTokens);

    let popupMsg = [];

    if (captured) {
      const capturedName = playerNames[COLORS.indexOf(captured)] || COLOR_LABELS[captured];
      setCaptureMsg(`💥 ${COLOR_LABELS[color]} ha catturato una pedina di ${COLOR_LABELS[captured]}!`);
      if (!isPlayerImmune(captured)) {
        popupMsg.push(`💥 ${capturedName} è stato mangiato! Beve 2 sorsi!`);
      } else {
        popupMsg.push(`💥 ${capturedName} è stato mangiato, ma è su una casella sicura ed è immune!`);
      }
    }

    let gameOver = false;
    if (newPos === 105) {
      const newFinishOrder = finishOrder.includes(color) ? finishOrder : [...finishOrder, color];
      setFinishOrder(newFinishOrder);

      const currentName = playerNames[currentPlayer] || COLOR_LABELS[color];
      const victims = COLORS.filter(c => c !== color && !isPlayerImmune(c));
      const immune = COLORS.filter(c => c !== color && isPlayerImmune(c));
      
      let msg = `🏁 ${currentName} ha portato una pedina al traguardo!\nTutti gli altri bevono!`;
      if (immune.length > 0) {
        msg += `\n(Immuni: ${immune.map(c => playerNames[COLORS.indexOf(c)] || COLOR_LABELS[c]).join(', ')})`;
      }
      popupMsg.push(msg);

      if (reallyAllFinished) {
        const updatedOrder = [...finishOrder, color];
        if (updatedOrder.length >= 3) {
          setTimeout(() => setScreen("over"), 800);
          setFinishOrder(updatedOrder);
          gameOver = true;
        } else {
          setFinishOrder(updatedOrder);
        }
      }
    }
    
    if (popupMsg.length > 0) {
      setPopup(prev => prev ? prev + "\n\n" + popupMsg.join("\n\n") : popupMsg.join("\n\n"));
    }

    if (gameOver) return;

    // Mark die as used
    const newUsedDice = [...currentUsed];
    newUsedDice[activeIdx] = true;
    setUsedDice(newUsedDice);

    // Check if there are unused dice left
    const nextUnusedIdx = newUsedDice.findIndex(u => !u);
    
    if (nextUnusedIdx !== -1) {
      // More dice to use
      setActiveDieIndex(nextUnusedIdx);
      
      // Auto-check if next die has valid moves
      const nextVal = currentVals[nextUnusedIdx];
      const movable = newTokens[color].filter(t => isValidMove(t, nextVal));
      if (movable.length === 0) {
        // Next die is unplayable
        newUsedDice[nextUnusedIdx] = true;
        setUsedDice(newUsedDice);
        // Wait! What if there are 3 dice? We only support up to 2.
        const getsExtra = currentVals.includes(6) || (captured !== null && rollCount < 2);
        advanceTurn(getsExtra, true);
      } else {
        setSelectableTokens(movable.map(t => t.id));
      }
    } else {
      // All dice used
      const getsExtra = currentVals.includes(6) || (captured !== null && rollCount < 2);
      advanceTurn(getsExtra, true);
    }
  };

  // ─── Advance turn ────────────────────────────────────────────────────────────

  const advanceTurn = (getsExtra, movedSuccessfully) => {
    setHasRolled(false);
    setSelectableTokens([]);
    
    // Check inactive turns for current player
    const isInactive = tokens[COLORS[currentPlayer]].every(t => t.pos === -1 || t.pos === 105);
    setInactiveTurns(prev => {
      const newTurns = [...prev];
      if (isInactive) {
        newTurns[currentPlayer] += 1;
        if (newTurns[currentPlayer] >= 3) {
          const currentName = playerNames[currentPlayer] || COLOR_LABELS[COLORS[currentPlayer]];
          setPopup(p => p ? p + `\n\n💤 ${currentName} è inattivo da 3 turni! Beve!` : `💤 ${currentName} è inattivo da 3 turni! Beve!`);
          newTurns[currentPlayer] = 0; // reset
        }
      } else {
        newTurns[currentPlayer] = 0;
      }
      return newTurns;
    });

    if (getsExtra) {
      setExtraRoll(true);
      setRollCount((prev) => prev + 1);
    } else {
      setExtraRoll(false);
      setRollCount(0);
      // Find next active player (skip finished ones)
      setCurrentPlayer((prev) => {
        let next = (prev + 1) % 4;
        let attempts = 0;
        while (
          finishOrder.includes(COLORS[next]) &&
          tokens[COLORS[next]].every((t) => t.pos === 105) &&
          attempts < 4
        ) {
          next = (next + 1) % 4;
          attempts++;
        }
        return next;
      });
    }
  };

  const handleTokenClick = (tokenId) => {
    if (!hasRolled || selectableTokens.length === 0) return;
    if (!selectableTokens.includes(tokenId)) return;
    moveToken(tokenId, diceValues[activeDieIndex], tokens, activeDieIndex, usedDice, diceValues);
  };

  return {
    screen, setScreen,
    playerNames, setPlayerNames,
    tokens,
    currentPlayer,
    diceValues,
    usedDice,
    activeDieIndex,
    setActiveDie,
    rolling,
    hasRolled,
    extraRoll,
    selectableTokens,
    captureMsg, setCaptureMsg,
    finishOrder,
    startGame,
    resetGame,
    rollDice,
    handleTokenClick,
    color,
    pawnsCount, setPawnsCount,
    diceCount, setDiceCount,
    popup, handleClosePopup
  };
}
