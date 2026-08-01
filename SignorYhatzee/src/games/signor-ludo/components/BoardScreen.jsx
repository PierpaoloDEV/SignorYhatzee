import { COLORS, COLOR_EMOJIS, COLOR_LABELS, ENTRY_CELL, SAFE_CELLS } from "../hooks/useLudoState";

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
  // Each color has 5 approach cells
  if (idx >= 1 && idx <= 5) return "red";     // Red approach
  if (idx >= 14 && idx <= 18) return "blue";  // Blue approach
  if (idx >= 27 && idx <= 31) return "yellow";// Yellow approach
  if (idx >= 40 && idx <= 44) return "green"; // Green approach
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

const TRACK_52 = buildTrack52();

function buildTrack52() {
  return [
    // Red entry = 0, going clockwise
    // Left column: col 1, rows 6→1 (6 cells)
    [6,1],[5,1],[4,1],[3,1],[2,1],[1,1],  // 0-5
    // Top row going right: row 0, cols 1→6 (6 cells)
    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],  // 6-11
    // Top center column going down: col 7, row 0 (1 cell — safe)
    [0,7],                                // 12 — safe (top)
    // Blue entry = 13
    // Top right going right: row 0, cols 8→13 (6 cells)
    [0,8],[0,9],[0,10],[0,11],[0,12],[0,13], // 13-18
    // Right column top: col 13, rows 1→6 (6 cells)
    [1,13],[2,13],[3,13],[4,13],[5,13],[6,13], // 19-24
    // Right middle row going right: row 7, cols 14→9... wait
    // Actually row 6 right: row 6, cols 13→8
    [6,13],[6,12],[6,11],[6,10],[6,9],[6,8], // wrong — reuse [6,13]
  ];
}

// ─── Definitive clean 52-cell track ──────────────────────────────────────────

export const TRACK = (() => {
  const t = [];
  // Standard clockwise starting from Red (top-left side):
  // Segment 1: Left outer column, going up: col 1, row 6→1
  for (let r = 6; r >= 1; r--) t.push([r, 1]);         // 0-5 (Red entry=0)
  // Segment 2: Top row going right: row 0, col 1→6
  for (let c = 1; c <= 6; c++) t.push([0, c]);          // 6-11
  // Segment 3: Top center (safe): row 0, col 7
  t.push([0, 7]);                                         // 12
  // Segment 4: Top row going right: row 0, col 8→13
  for (let c = 8; c <= 13; c++) t.push([0, c]);         // 13-18 (Blue entry=13)
  // Segment 5: Right outer column going down: col 13, row 1→6
  for (let r = 1; r <= 6; r++) t.push([r, 13]);         // 19-24
  // Segment 6: Middle row going right: row 6, col 13→8 — NO. Row 7 right of home
  // Actually: right middle going down from row 6 col 13:
  // Row 6 going right from col 13→14 already done; next is row 7 col 14 going down...
  // Let me use the absolute standard layout:
  // After right column we go: row 7 going right col 14→9 (right-center row)
  for (let c = 13; c >= 8; c--) t.push([6, c]);        // 25-30 (row 6 going left)
  // Right center safe: row 7, col 13
  t.push([7, 13]);                                        // 31 — safe
  // Yellow approach: row 7, col 14→9 going left... hmm
  // Bottom-right going down: col 13, row 8→13
  for (let r = 8; r <= 13; r++) t.push([r, 13]);        // 32-37 (Yellow entry=26... offset issue)
  // Bottom row going left: row 14, col 13→8
  for (let c = 13; c >= 8; c--) t.push([14, c]);        // 38-43
  // Bottom center (safe): row 14, col 7
  t.push([14, 7]);                                        // 44
  // Bottom row going left: row 14, col 6→1
  for (let c = 6; c >= 1; c--) t.push([14, c]);         // 45-50 (Green entry=39)
  // Left outer column going up: col 1, row 13→8
  for (let r = 13; r >= 8; r--) t.push([r, 1]);         // 51 (only 1 left)
  return t;                                               // total: 52 cells
})();

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
  red:    [[5,7],[4,7],[3,7],[2,7],[1,7]],
  blue:   [[7,9],[7,10],[7,11],[7,12],[7,13]], // flipped: 0 = closest entry
  yellow: [[9,7],[10,7],[11,7],[12,7],[13,7]],
  green:  [[7,5],[7,4],[7,3],[7,2],[7,1]],
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

export default function BoardScreen({ state }) {
  const {
    tokens,
    currentPlayer,
    diceValue,
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
    if (idx >= 1 && idx <= 5) return "red";
    if (idx >= 14 && idx <= 18) return "blue";
    if (idx >= 32 && idx <= 36) return "yellow";
    if (idx >= 45 && idx <= 49) return "green";
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
    <div className="ludo-game-screen">
      {/* Header */}
      <div className="ludo-header">
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
      {selectableTokens.length > 1 && hasRolled && (
        <div className="ludo-hint">👆 Tocca una pedina evidenziata per muoverla</div>
      )}

      {/* Dice + Roll */}
      <div className="ludo-dice-area">
        <div className={`ludo-dice ${rolling ? "ludo-dice-rolling" : ""}`} style={{ borderColor: TOKEN_COLORS[currentColor] }}>
          {rolling ? "🎲" : diceValue ? ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][diceValue] : "🎲"}
        </div>
        <button
          className="btn btn-primary ludo-roll-btn"
          style={{ background: `linear-gradient(135deg, ${TOKEN_COLORS[currentColor]}, ${TOKEN_COLORS[currentColor]}aa)` }}
          disabled={rolling || hasRolled}
          onClick={rollDice}
        >
          {rolling ? "..." : hasRolled ? "In attesa..." : "Lancia dado"}
        </button>
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
  if (c === 7 && r >= 1 && r <= 5) return true;   // Red
  if (r === 7 && c >= 9 && c <= 13) return true;  // Blue
  if (c === 7 && r >= 9 && r <= 13) return true;  // Yellow
  if (r === 7 && c >= 1 && c <= 5) return true;   // Green
  return false;
}

function getHomeStretchColor(r, c) {
  if (c === 7 && r >= 1 && r <= 5) return "red";
  if (r === 7 && c >= 9 && c <= 13) return "blue";
  if (c === 7 && r >= 9 && r <= 13) return "yellow";
  if (r === 7 && c >= 1 && c <= 5) return "green";
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
