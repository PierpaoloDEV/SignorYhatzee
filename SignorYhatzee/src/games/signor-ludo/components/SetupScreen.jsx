import { useState } from "react";
import { COLOR_LABELS, COLORS } from "../hooks/useLudoState";

export default function SetupScreen({ playerNames, setPlayerNames, onStart, onExit }) {
  const [error, setError] = useState("");

  const handleStart = () => {
    const filled = playerNames.filter((n) => n.trim() !== "");
    if (filled.length < 2) {
      setError("Inserisci almeno 2 nomi giocatori.");
      return;
    }
    setError("");
    onStart();
  };

  const colorStyles = {
    red: { border: "2px solid #ef4444", color: "#ef4444" },
    blue: { border: "2px solid #3b82f6", color: "#3b82f6" },
    yellow: { border: "2px solid #f59e0b", color: "#f59e0b" },
    green: { border: "2px solid #22c55e", color: "#22c55e" },
  };

  return (
    <div className="app ludo-setup">
      <button className="back-btn" onClick={onExit}>← Altri giochi</button>
      <h1 className="title ludo-title">🎯 Signor Ludo</h1>
      <p className="subtitle">Inserisci i nomi dei giocatori</p>

      <div className="ludo-setup-grid">
        {COLORS.map((c, i) => (
          <div key={c} className="ludo-player-input-row">
            <div className="ludo-color-dot" style={{ background: c === "yellow" ? "#f59e0b" : c === "blue" ? "#3b82f6" : c }} />
            <input
              className="ludo-input"
              style={colorStyles[c]}
              placeholder={COLOR_LABELS[c]}
              value={playerNames[i]}
              onChange={(e) => {
                const next = [...playerNames];
                next[i] = e.target.value;
                setPlayerNames(next);
              }}
              maxLength={16}
            />
          </div>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-primary ludo-start-btn" onClick={handleStart}>
        🎲 Inizia Partita
      </button>

      <div className="ludo-rules-preview glass-panel">
        <h3>📖 Regole base</h3>
        <ul>
          <li>🎲 Tira il dado — con <strong>6</strong> esci dal tabellone e ritiri</li>
          <li>💥 Atterri su una pedina avversaria → la rimandi a casa</li>
          <li>⭐ Le celle con la stella sono <strong>sicure</strong></li>
          <li>🏁 Porta tutte e 4 le pedine in centro per vincere!</li>
        </ul>
      </div>
    </div>
  );
}
