import { COLORS, COLOR_EMOJIS, COLOR_LABELS, ENTRY_CELL, SAFE_CELLS } from "../hooks/useLudoState";
import DrinkPopup from "./modals/DrinkPopup";
import RulesInfoModal from "./modals/RulesInfoModal";

// ─── Board geometry ────────────────────────────────────────────────────────────
// The classic Ludo board is a 15×15 grid.
// We define each cell of the outer track as [row, col] coordinates.
// Standard track starting from Red's entry (top-left area), going clockwise.

// 52-cell outer track coordinates (row, col) on the 15×15 grid
const TRACK_CELLS = [
  // Red side → down left column (rows 6→0, col 6) → across top → ...
  [6,1],[5,1],[4,1],[3,1],[2,1],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6], // 0-10
  [0,6],[0,7],                                                          // 11-12
  [0,8],[1,8],[1,9],[1,10],[1,11],[1,12],[1,13],[1,14],[2,14],           // 13-21 (Blue entry=13)
  [3,14],[4,14],[5,14],[6,14],[6,13],[6,12],[6,11],[6,10],[6,9],         // 22-30
  [6,8],[7,8],                                                           // 31-32
  [8,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[9,14],[10,14],         // 33-41 (Yellow entry=26... need fix)
  [11,14],[12,14],[13,14],[14,13],[14,12],[14,11],[14,10],[14,9],[14,8], // 42-50
  [14,7],                                                                // 51
  // Green entry = 39
];

// We'll use a simpler visual representation.
// The board is drawn as a color-coded SVG-like div grid.

// Color for each track cell background (for the colored lanes near home stretch)
function getCellColor(idx) {
  if (idx === 0) return "red";
  if (idx === 13) return "blue";
  if (idx === 26) return "yellow";
  if (idx === 39) return "green";
  return null;
}

// ─── Board cell layout (15×15) ────────────────────────────────────────────────

// We'll represent the board as a flat array of 225 cells.
// Each cell: { type: "track"|"home"|"base"|"center"|"empty", color, trackIdx, homeIdx }

function buildBoard() {
  const cells = Array(15).fill(null).map(() =>
    Array(15).fill(null).map(() => ({ type: "empty" }))
  );

  // ── Colored base corners (6×6 areas in the 4 corners) ──
  // Red: top-left (rows 0-5, cols 0-5)
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 6; c++)
      cells[r][c] = { type: r >= 1 && r <= 4 && c >= 1 && c <= 4 ? "base-inner" : "base-outer", color: "red" };

  // Blue: top-right (rows 0-5, cols 9-14)
  for (let r = 0; r < 6; r++)
    for (let c = 9; c < 15; c++)
      cells[r][c] = { type: r >= 1 && r <= 4 && c >= 10 && c <= 13 ? "base-inner" : "base-outer", color: "blue" };

  // Yellow: bottom-right (rows 9-14, cols 9-14)
  for (let r = 9; r < 15; r++)
    for (let c = 9; c < 15; c++)
      cells[r][c] = { type: r >= 10 && r <= 13 && c >= 10 && c <= 13 ? "base-inner" : "base-outer", color: "yellow" };

  // Green: bottom-left (rows 9-14, cols 0-5)
  for (let r = 9; r < 15; r++)
    for (let c = 0; c < 6; c++)
      cells[r][c] = { type: r >= 10 && r <= 13 && c >= 1 && c <= 4 ? "base-inner" : "base-outer", color: "green" };

  // ── Center finishing zone (3×3, rows 6-8, cols 6-8) ──
  for (let r = 6; r <= 8; r++)
    for (let c = 6; c <= 8; c++)
      cells[r][c] = { type: "center" };

  // ── Home stretches (colored approach lanes to center) ──
  // Red: col 7, rows 1–5 (going down toward center)
  for (let r = 1; r <= 5; r++) cells[r][7] = { type: "home-stretch", color: "red", homeIdx: 5 - r }; // homeIdx 4→0

  // Blue: row 7, cols 9–13 (going left toward center)
  for (let c = 9; c <= 13; c++) cells[7][c] = { type: "home-stretch", color: "blue", homeIdx: c - 9 };

  // Yellow: col 7, rows 9–13 (going up toward center)
  for (let r = 9; r <= 13; r++) cells[r][7] = { type: "home-stretch", color: "yellow", homeIdx: r - 9 };

  // Green: row 7, cols 1–5 (going right toward center)
  for (let c = 1; c <= 5; c++) cells[7][c] = { type: "home-stretch", color: "green", homeIdx: 5 - c };

  // ── Outer track cells ──
  // Column 6 (rows 0-5 and 9-14), Row 0 (cols 6-8), etc.
  // Red lane going down (col 6, rows 1-5)
  const trackLayout = [
    // From Red entry going clockwise around the board:
    // Left column (col 6): rows 6→1
    [6,6],[5,6],[4,6],[3,6],[2,6],[1,6],
    // Top-left corner: row 0, cols 6→8
    [0,6],[0,7],[0,8],
    // Right upper (col 8, rows 1→6)
    [1,8],[2,8],[3,8],[4,8],[5,8],[6,8],
    // Right outer column: col 14, rows 0→6
    [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
    // Top-right: row 0-6 col 14 → [0,8] area... 
    // Let me redo this properly below
  ];

  // The standard track (52 cells clockwise from Red's start):
  const OUTER_TRACK = [
    // 0: Red entry — going clockwise
    [6,1],[5,1],[4,1],[3,1],[2,1],[1,1],  // 0-5 (red home column)
    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],  // 6-11
    [0,7],                                 // 12 (top center safe)
    [0,8],[0,9],[0,10],[0,11],[0,12],[0,13],[0,14], // 13: Blue entry (13) at [0,8]... 
    [1,14],[2,14],[3,14],[4,14],[5,14],[6,14],      // 20-25
    [7,14],[7,13],[7,12],[7,11],[7,10],[7,9],        // 26: Yellow entry
    [8,14],[9,14],[10,14],[11,14],[12,14],[13,14],[14,14], // 32-38
    [14,13],[14,12],[14,11],[14,10],[14,9],[14,8],   // 39: Green entry (39)
    [14,7],                                          // 45
    [14,6],[14,5],[14,4],[14,3],[14,2],[14,1],[14,0], // 46-52
    [13,0],[12,0],[11,0],[10,0],[9,0],[8,0],         // 53-58... too many
  ];

  // ── Simplified approach: define just the 52 track cells with known positions ──
  // Standard 15×15 Ludo track (classic layout):
  const TRACK = buildTrack();
  TRACK.forEach(([r, c], idx) => {
    if (cells[r]?.[c]) {
      const lane = getCellColor(idx);
      cells[r][c] = {
        type: "track",
        trackIdx: idx,
        isSafe: SAFE_CELLS.has(idx),
        laneColor: lane,
      };
    }
  });

  return cells;
}

function buildTrack() {
  // 52 cells going clockwise, starting from Red entry (top-left area)
  return [
    // Red home column (going up): col 1, rows 6→1
    [6,1],[5,1],[4,1],[3,1],[2,1],[1,1],
    // Top edge (going right): row 0, cols 1→6
    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
    // Top center: row 0, col 7 (safe)
    [0,7],
    // Top edge right half (going right): row 0, cols 8→13
    [0,8],[0,9],[0,10],[0,11],[0,12],[0,13],
    // Blue home column (going down): col 13, rows 1→6
    [1,13],[2,13],[3,13],[4,13],[5,13],[6,13],
    // Middle right (going right): row 7, cols 13→8
    [7,13],[7,12],[7,11],[7,10],[7,9],[7,8],
    // Right center: row 7, col 7... skip (home stretch blue)
    // Right side col 13 going down
    [1,13],[2,13], // duplicate! fix needed
  ];
}

// ─── Clean implementation with correct 52-cell track ─────────────────────────

export const TRACK = [
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],
  [6,0]
];

// ─── Simple board renderer component ─────────────────────────────────────────

const TOKEN_COLORS = {
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#f59e0b",
  green: "#22c55e",
};

const BASE_POSITIONS = {
  // 4 slots in each base area (15×15 grid coords)
  red:    [[2,2],[2,3],[3,2],[3,3]],
  blue:   [[2,11],[2,12],[3,11],[3,12]],
  yellow: [[11,11],[11,12],[12,11],[12,12]],
  green:  [[11,2],[11,3],[12,2],[12,3]],
};

const HOME_STRETCH_POSITIONS = {
  // 5 cells in home stretch (homeIdx 0→4, closest to entry first)
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5]],
  blue:   [[1,7],[2,7],[3,7],[4,7],[5,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9]],
  green:  [[13,7],[12,7],[11,7],[10,7],[9,7]],
};

const CENTER_POSITION = [7, 7];

function getTokenCellCoords(token) {
  if (token.pos === -1) {
    // In base
    return null; // handled separately
  }
  if (token.pos === 105) {
    return CENTER_POSITION;
  }
  if (token.pos >= 100 && token.pos <= 104) {
    const homeIdx = token.pos - 100;
    return HOME_STRETCH_POSITIONS[token.color][homeIdx];
  }
  // On outer track
  return TRACK[token.pos] || null;
}

// ─── Main Board Component ─────────────────────────────────────────────────────

export default function BoardScreen({ state, onExit }) {
  const {
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
    captureMsg,
    finishOrder,
    playerNames,
    rollDice,
    handleTokenClick,
    setCaptureMsg,
  } = state;

  const currentColor = COLORS[currentPlayer];
  const currentName = playerNames[currentPlayer] || COLOR_LABELS[currentColor];

  // Build a map: "r-c" → list of tokens at that cell
  const cellTokenMap = {};
  const addToMap = (key, token) => {
    if (!cellTokenMap[key]) cellTokenMap[key] = [];
    cellTokenMap[key].push(token);
  };

  COLORS.forEach((color) => {
    tokens[color].forEach((token, idx) => {
      if (token.pos === -1) {
        const [r, c] = BASE_POSITIONS[color][idx];
        addToMap(`${r}-${c}`, token);
      } else {
        const coords = getTokenCellCoords(token);
        if (coords) addToMap(`${coords[0]}-${coords[1]}`, token);
      }
    });
  });

  const CELL_SIZE = Math.min(Math.floor((window.innerWidth - 32) / 15), 38);
  const BOARD_SIZE = CELL_SIZE * 15;

  const getTrackCellStyle = (trackIdx) => {
    const laneColor = getCellColorForTrack(trackIdx);
    if (laneColor) return { background: `${TOKEN_COLORS[laneColor]}33`, border: `1px solid ${TOKEN_COLORS[laneColor]}66` };
    if (SAFE_CELLS.has(trackIdx)) return { background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.5)" };
    return { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" };
  };

  function getCellColorForTrack(idx) {
    if (idx === 0) return "red";
    if (idx === 13) return "blue";
    if (idx === 26) return "yellow";
    if (idx === 39) return "green";
    return null;
  }

  // Render the 15×15 grid
  const grid = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const key = `${r}-${c}`;
      const tokensHere = cellTokenMap[key] || [];

      // Determine cell style
      let cellStyle = {
        width: CELL_SIZE,
        height: CELL_SIZE,
        position: "absolute",
        left: c * CELL_SIZE,
        top: r * CELL_SIZE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        fontSize: CELL_SIZE < 28 ? "0.55rem" : "0.7rem",
      };

      // Determine what kind of cell this is
      const isBase = isBaseCell(r, c);
      const isHomeStretch = isHomeStretchCell(r, c);
      const trackIdx = getTrackIndex(r, c);
      const isTrack = trackIdx !== -1;
      const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
      const baseColor = isBase || isHomeStretch;

      if (isCenter) {
        if (r === 7 && c === 7) {
          cellStyle = { ...cellStyle, background: "radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)", borderRadius: 4, border: "2px solid #fbbf24", zIndex: 2 };
        } else {
          // Colored triangles in center (simplified as colored quadrants)
          const centerColor = getCenterColor(r, c);
          cellStyle = { ...cellStyle, background: centerColor ? `${TOKEN_COLORS[centerColor]}99` : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };
        }
      } else if (isHomeStretch) {
        const hsColor = getHomeStretchColor(r, c);
        cellStyle = { ...cellStyle, background: hsColor ? `${TOKEN_COLORS[hsColor]}44` : "transparent", border: `1px solid ${hsColor ? TOKEN_COLORS[hsColor] : "transparent"}55` };
      } else if (isBase) {
        const bc = getBaseColor(r, c);
        const isInnerBase = isBaseInnerCell(r, c);
        if (isInnerBase) {
          cellStyle = { ...cellStyle, background: bc ? `${TOKEN_COLORS[bc]}22` : "transparent", border: `1px solid ${bc ? TOKEN_COLORS[bc] : "transparent"}44` };
        } else {
          cellStyle = { ...cellStyle, background: bc ? `${TOKEN_COLORS[bc]}88` : "transparent" };
        }
      } else if (isTrack) {
        cellStyle = { ...cellStyle, ...getTrackCellStyle(trackIdx), borderRadius: 3 };
      } else {
        cellStyle = { ...cellStyle, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" };
      }

      const cellContent = [];

      // Safe cell star
      if (isTrack && SAFE_CELLS.has(trackIdx) && tokensHere.length === 0) {
        cellContent.push(<span key="star" style={{ fontSize: CELL_SIZE < 28 ? "0.6rem" : "0.8rem", opacity: 0.8 }}>⭐</span>);
      }

      // Center icon
      if (r === 7 && c === 7 && tokensHere.length === 0) {
        cellContent.push(<span key="home" style={{ fontSize: "1rem" }}>🏁</span>);
      }

      // Tokens on this cell
      if (tokensHere.length > 0) {
        if (tokensHere.length === 1) {
          const t = tokensHere[0];
          const isSelectable = selectableTokens.includes(t.id);
          cellContent.push(
            <Token
              key={t.id}
              token={t}
              size={CELL_SIZE - 6}
              isSelectable={isSelectable}
              onClick={() => handleTokenClick(t.id)}
            />
          );
        } else {
          // Multiple tokens stacked — show count badge
          const firstColor = tokensHere[0].color;
          cellContent.push(
            <div key="stack" style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 1, width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
              {tokensHere.slice(0, 4).map((t, i) => (
                <Token
                  key={t.id}
                  token={t}
                  size={CELL_SIZE / 2 - 2}
                  isSelectable={selectableTokens.includes(t.id)}
                  onClick={() => handleTokenClick(t.id)}
                />
              ))}
            </div>
          );
        }
      }

      grid.push(
        <div key={key} style={cellStyle}>
          {cellContent}
        </div>
      );
    }
  }

  return (
    <div className="ludo-game-screen app">
      <RulesInfoModal />
      <DrinkPopup state={state} />
      <div className="glass-panel" style={{ width: "100%", maxWidth: BOARD_SIZE + 40, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        {/* Header */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <button className="back-btn" onClick={onExit} style={{ position: "absolute", left: 0, margin: 0, padding: "8px 12px", zIndex: 10 }}>← Esci</button>
          <div className="ludo-turn-indicator" style={{ borderColor: TOKEN_COLORS[currentColor] }}>
            <span style={{ color: TOKEN_COLORS[currentColor], fontWeight: 700, fontSize: "1rem" }}>
              {COLOR_EMOJIS[currentColor]} {currentName}
            </span>
            {extraRoll && <span className="ludo-extra-badge">🎲 Rilancia!</span>}
            {finishOrder.length > 0 && (
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Finito: {finishOrder.map(c => COLOR_EMOJIS[c]).join(" ")}
              </span>
            )}
          </div>
        </div>

        {/* Board */}
        <div style={{ position: "relative", width: BOARD_SIZE, height: BOARD_SIZE, margin: "0 auto" }}>
          {grid}
        </div>

        {/* Capture message */}
        {captureMsg && (
          <div className="ludo-capture-msg" onClick={() => setCaptureMsg(null)}>
            {captureMsg}
          </div>
        )}

        {/* Selectable hint */}
        {selectableTokens.length > 0 && hasRolled && (
          <div className="ludo-hint">👆 Tocca una pedina evidenziata per muoverla col dado attivo</div>
        )}

        {/* Dice + Roll */}
        <div className="ludo-dice-area" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {rolling ? (
              <div className="ludo-dice ludo-dice-rolling" style={{ borderColor: TOKEN_COLORS[currentColor] }}>🎲</div>
            ) : diceValues.length > 0 ? (
              diceValues.map((val, idx) => {
                const isActive = activeDieIndex === idx;
                const isUsed = usedDice[idx];
                return (
                  <div
                    key={idx}
                    className={`ludo-dice ${isActive && !isUsed ? "ludo-dice-active" : ""} ${isUsed ? "ludo-dice-used" : ""}`}
                    style={{
                      borderColor: isActive && !isUsed ? TOKEN_COLORS[currentColor] : "rgba(255,255,255,0.2)",
                      opacity: isUsed ? 0.3 : 1,
                      cursor: isUsed ? "default" : "pointer"
                    }}
                    onClick={() => setActiveDie(idx)}
                  >
                    {["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][val]}
                  </div>
                );
              })
            ) : (
              <div className="ludo-dice" style={{ borderColor: TOKEN_COLORS[currentColor] }}>🎲</div>
            )}
          </div>
          <button
            className="btn btn-primary ludo-roll-btn"
            style={{ background: `linear-gradient(135deg, ${TOKEN_COLORS[currentColor]}, ${TOKEN_COLORS[currentColor]}aa)`, flexShrink: 0 }}
            disabled={rolling || hasRolled}
            onClick={rollDice}
          >
            {rolling ? "..." : hasRolled ? "In attesa..." : "Lancia"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Token component ──────────────────────────────────────────────────────────

function Token({ token, size, isSelectable, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: TOKEN_COLORS[token.color],
        border: isSelectable ? "2px solid #fff" : "1.5px solid rgba(0,0,0,0.4)",
        cursor: isSelectable ? "pointer" : "default",
        boxShadow: isSelectable
          ? `0 0 8px ${TOKEN_COLORS[token.color]}, 0 0 16px ${TOKEN_COLORS[token.color]}`
          : "0 2px 4px rgba(0,0,0,0.4)",
        transition: "box-shadow 0.2s, transform 0.15s",
        transform: isSelectable ? "scale(1.15)" : "scale(1)",
        flexShrink: 0,
        animation: isSelectable ? "ludo-pulse 0.8s ease-in-out infinite alternate" : "none",
      }}
    />
  );
}

// ─── Cell classification helpers ─────────────────────────────────────────────

function isBaseCell(r, c) {
  if (r <= 5 && c <= 5) return true;
  if (r <= 5 && c >= 9) return true;
  if (r >= 9 && c >= 9) return true;
  if (r >= 9 && c <= 5) return true;
  return false;
}

function isBaseInnerCell(r, c) {
  if (r >= 1 && r <= 4 && c >= 1 && c <= 4) return true;
  if (r >= 1 && r <= 4 && c >= 10 && c <= 13) return true;
  if (r >= 10 && r <= 13 && c >= 10 && c <= 13) return true;
  if (r >= 10 && r <= 13 && c >= 1 && c <= 4) return true;
  return false;
}

function getBaseColor(r, c) {
  if (r <= 5 && c <= 5) return "red";
  if (r <= 5 && c >= 9) return "blue";
  if (r >= 9 && c >= 9) return "yellow";
  if (r >= 9 && c <= 5) return "green";
  return null;
}

function isHomeStretchCell(r, c) {
  if (r === 7 && c >= 1 && c <= 5) return true;   // Red
  if (c === 7 && r >= 1 && r <= 5) return true;   // Blue
  if (r === 7 && c >= 9 && c <= 13) return true;  // Yellow
  if (c === 7 && r >= 9 && r <= 13) return true;  // Green
  return false;
}

function getHomeStretchColor(r, c) {
  if (r === 7 && c >= 1 && c <= 5) return "red";
  if (c === 7 && r >= 1 && r <= 5) return "blue";
  if (r === 7 && c >= 9 && c <= 13) return "yellow";
  if (c === 7 && r >= 9 && r <= 13) return "green";
  return null;
}

function getCenterColor(r, c) {
  if (r === 6 && c === 6) return "red";
  if (r === 6 && c === 8) return "blue";
  if (r === 8 && c === 8) return "yellow";
  if (r === 8 && c === 6) return "green";
  return null;
}

function getTrackIndex(r, c) {
  return TRACK.findIndex(([tr, tc]) => tr === r && tc === c);
}
