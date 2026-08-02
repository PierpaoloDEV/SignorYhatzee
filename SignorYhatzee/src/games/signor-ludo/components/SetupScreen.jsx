import { useState } from "react";
import { COLOR_LABELS, COLORS } from "../hooks/useLudoState";

const PAWNS_OPTS = [1, 2, 3, 4];
const DICE_OPTS = [1, 2];

function cycleOption(current, options, direction) {
  const currentIndex = options.indexOf(current);
  if (currentIndex === -1) return options[0];
  const nextIndex = (currentIndex + direction + options.length) % options.length;
  return options[nextIndex];
}

export default function SetupScreen({ playerNames, setPlayerNames, pawnsCount, setPawnsCount, diceCount, setDiceCount, onStart, onExit }) {
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
    <div className="app setup-screen">
      <button className="back-btn" onClick={onExit}>← Altri giochi</button>
      <h1 className="title">♟️ Signor Ludo</h1>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <p className="subtitle" style={{ margin: 0 }}>Inserisci i giocatori (min 2)</p>
        
        <div className="input-grid">
          {COLORS.map((c, i) => (
            <div key={c} className="ludo-player-input-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="ludo-color-dot" style={{ background: c === "yellow" ? "#f59e0b" : c === "blue" ? "#3b82f6" : c, width: '20px', height: '20px', borderRadius: '50%' }} />
              <input
                className="player-input neon-input"
                style={{ ...colorStyles[c], flex: 1, margin: 0 }}
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

        <div className="settings-panel" style={{ display: 'flex', gap: '20px', width: '100%', flexWrap: 'wrap' }}>
          <div className="setting-card">
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>♟️ Pedine</label>
            <div className="custom-select-premium">
              <button className="select-btn" type="button" onClick={() => setPawnsCount(cycleOption(pawnsCount, PAWNS_OPTS, -1))}>◀</button>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{pawnsCount}</span>
              <button className="select-btn" type="button" onClick={() => setPawnsCount(cycleOption(pawnsCount, PAWNS_OPTS, 1))}>▶</button>
            </div>
          </div>

          <div className="setting-card">
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>🎲 Dadi</label>
            <div className="custom-select-premium">
              <button className="select-btn" type="button" onClick={() => setDiceCount(cycleOption(diceCount, DICE_OPTS, -1))}>◀</button>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{diceCount}</span>
              <button className="select-btn" type="button" onClick={() => setDiceCount(cycleOption(diceCount, DICE_OPTS, 1))}>▶</button>
            </div>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} onClick={handleStart}>
          🎲 Inizia Partita
        </button>

        <div className="ludo-rules-preview glass-panel" style={{ marginTop: '0', width: '100%', textAlign: 'left', padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>📖 Regole base</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>🎲 Tira il dado — con <strong>6</strong> esci dal tabellone e ritiri</li>
            <li>💥 Atterri su una pedina avversaria → la rimandi a casa</li>
            <li>⭐ Le celle con la stella sono <strong>sicure</strong></li>
            <li>🏁 Porta tutte e {pawnsCount} le pedine in centro per vincere!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
