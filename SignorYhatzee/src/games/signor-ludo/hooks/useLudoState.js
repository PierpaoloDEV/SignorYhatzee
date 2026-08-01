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
function makeTokens(color) {
  return [0, 1, 2, 3].map((id) => ({ id: `${color}-${id}`, color, pos: -1 }));
}

function initTokens() {
  const tokens = {};
  COLORS.forEach((c) => {
    tokens[c] = makeTokens(c);
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
  if (newRelative > 56) return false; // too far, overshoot

  return true;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLudoState() {
  const [screen, setScreen] = useState("setup"); // "setup" | "game" | "over"
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);
  const [tokens, setTokens] = useState(initTokens());
  const [currentPlayer, setCurrentPlayer] = useState(0); // 0–3
  const [diceValue, setDiceValue] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [extraRoll, setExtraRoll] = useState(false);
  const [selectableTokens, setSelectableTokens] = useState([]);
  const [captureMsg, setCaptureMsg] = useState(null);
  const [finishOrder, setFinishOrder] = useState([]); // colors in finish order
  const [rollCount, setRollCount] = useState(0); // consecutive 6s safety

  const color = COLORS[currentPlayer];

  // ─── Start game ─────────────────────────────────────────────────────────────

  const startGame = () => {
    const names = playerNames.map((n, i) =>
      n.trim() !== "" ? n.trim() : COLOR_LABELS[COLORS[i]]
    );
    setPlayerNames(names);
    setTokens(initTokens());
    setCurrentPlayer(0);
    setDiceValue(null);
    setHasRolled(false);
    setExtraRoll(false);
    setSelectableTokens([]);
    setCaptureMsg(null);
    setFinishOrder([]);
    setRollCount(0);
    setScreen("game");
  };

  const resetGame = () => {
    setScreen("setup");
    setPlayerNames(["", "", "", ""]);
    setTokens(initTokens());
    setCurrentPlayer(0);
    setDiceValue(null);
    setHasRolled(false);
    setExtraRoll(false);
    setSelectableTokens([]);
    setCaptureMsg(null);
    setFinishOrder([]);
    setRollCount(0);
  };

  // ─── Roll dice ───────────────────────────────────────────────────────────────

  const rollDice = () => {
    if (rolling || hasRolled) return;
    setRolling(true);
    setCaptureMsg(null);

    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setDiceValue(value);
      setRolling(false);
      setHasRolled(true);

      // Determine which tokens can move
      const myTokens = tokens[COLORS[currentPlayer]];
      const movable = myTokens.filter((t) => isValidMove(t, value));

      if (movable.length === 0) {
        // No moves possible → pass turn
        setTimeout(() => advanceTurn(value === 6, false), 800);
      } else if (movable.length === 1) {
        // Auto-select if only one option
        setTimeout(() => moveToken(movable[0].id, value, tokens), 400);
      } else {
        setSelectableTokens(movable.map((t) => t.id));
      }
    }, 600);
  };

  // ─── Move token ─────────────────────────────────────────────────────────────

  const moveToken = (tokenId, dice = diceValue, currentTokens = tokens) => {
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

    // Check capture (only on outer track, not on safe cells)
    let captured = null;
    if (newPos >= 0 && newPos <= 51 && !SAFE_CELLS.has(newPos)) {
      COLORS.forEach((c) => {
        if (c === color) return;
        newTokens[c] = newTokens[c].map((t) => {
          if (t.pos === newPos) {
            captured = c;
            return { ...t, pos: -1 }; // send home
          }
          return t;
        });
      });
    }

    // Check if all 4 tokens of this color are finished
    const allFinished = newTokens[color].every((t) =>
      t.pos === 105 || (t.id === tokenId ? newPos === 105 : false)
    );
    // Re-check properly
    const myNewTokens = newTokens[color].map((t, i) =>
      i === tokenIdx ? { ...t, pos: newPos } : t
    );
    const reallyAllFinished = myNewTokens.every((t) => t.pos === 105);

    setTokens(newTokens);

    if (captured) {
      setCaptureMsg(`💥 ${COLOR_LABELS[color]} ha catturato una pedina di ${COLOR_LABELS[captured]}!`);
    }

    // Handle finish
    if (newPos === 105) {
      const newFinishOrder = finishOrder.includes(color)
        ? finishOrder
        : [...finishOrder, color];
      setFinishOrder(newFinishOrder);

      if (reallyAllFinished) {
        // This color has finished all tokens — check if game is over
        const activePlayers = COLORS.filter(
          (c) => !newFinishOrder.includes(c) && c !== color
        );
        const updatedOrder = [...finishOrder, color];
        if (updatedOrder.length >= 3) {
          // 3 players finished → last one auto-loses, game over
          setTimeout(() => setScreen("over"), 800);
          setFinishOrder(updatedOrder);
          return;
        }
        setFinishOrder(updatedOrder);
      }
    }

    // Extra roll on 6 or capture
    const getsExtra = dice === 6 || (captured !== null && rollCount < 2);
    advanceTurn(getsExtra, true);
  };

  // ─── Advance turn ────────────────────────────────────────────────────────────

  const advanceTurn = (getsExtra, movedSuccessfully) => {
    setHasRolled(false);
    setSelectableTokens([]);

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
    moveToken(tokenId, diceValue, tokens);
  };

  return {
    screen, setScreen,
    playerNames, setPlayerNames,
    tokens,
    currentPlayer,
    diceValue,
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
  };
}
