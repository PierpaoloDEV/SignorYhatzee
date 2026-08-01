import { COLOR_LABELS, COLOR_EMOJIS, COLORS } from "../hooks/useLudoState";

export default function GameOverScreen({ finishOrder, playerNames, tokens, onRestart, onExit }) {
  // Build final ranking: finishOrder first, then remaining in any order
  const finished = finishOrder;
  const remaining = COLORS.filter((c) => !finished.includes(c));
  const ranking = [...finished, ...remaining];

  const medals = ["🥇", "🥈", "🥉", "4️⃣"];

  const getName = (color) => {
    const idx = COLORS.indexOf(color);
    return playerNames[idx] || COLOR_LABELS[color];
  };

  const colorBg = {
    red:    "rgba(239,68,68,0.15)",
    blue:   "rgba(59,130,246,0.15)",
    yellow: "rgba(245,158,11,0.15)",
    green:  "rgba(34,197,94,0.15)",
  };
  const colorBorder = {
    red:    "#ef4444",
    blue:   "#3b82f6",
    yellow: "#f59e0b",
    green:  "#22c55e",
  };

  return (
    <div className="app ludo-gameover">
      <h1 className="title ludo-title">🏆 Fine Partita!</h1>
      <p className="subtitle">Classifica finale</p>

      <div className="ludo-ranking">
        {ranking.map((color, i) => (
          <div
            key={color}
            className="ludo-rank-row"
            style={{
              background: colorBg[color],
              border: `2px solid ${colorBorder[color]}`,
              borderRadius: 12,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: "1.8rem" }}>{medals[i]}</span>
            <span style={{ fontSize: "1.5rem" }}>{COLOR_EMOJIS[color]}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{getName(color)}</div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                {tokens[color].filter((t) => t.pos === 105).length}/4 pedine in centro
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 10, width: "100%" }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onRestart}>
          🔄 Rivincita
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onExit}>
          🏠 Home
        </button>
      </div>
    </div>
  );
}
