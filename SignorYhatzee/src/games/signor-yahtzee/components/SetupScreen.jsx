import { cycleOption } from "../utils/gameHelpers";
import { BET_OPTS, TRAP_OPTS, RULES_MODE_OPTS } from "../constants";

export default function SetupScreen({ state, onBack }) {
  const { playerNames, setPlayerNames, startGame, betMode, setBetMode, trapMode, setTrapMode, rulesMode, setRulesMode, betWithTrap, setBetWithTrap } = state;

  return (
    <div className="app setup-screen">
      <button className="back-btn" onClick={() => {
        if (onBack) onBack();
      }}>← Indietro</button>
      <h1 className="title">🎲 SignorYahtzee</h1>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <p className="subtitle" style={{ margin: 0 }}>Inserisci i giocatori (min 2)</p>
        
        <div className="input-grid">
          {playerNames.map((name, i) => (
            <input
              key={i}
              className="player-input neon-input"
              placeholder={`Giocatore ${i + 1}`}
              value={name}
              onChange={(e) => {
                const arr = [...playerNames];
                arr[i] = e.target.value;
                // Aggiungi un campo solo se l'ultimo non è vuoto e non abbiamo già troppi campi
                if (i === arr.length - 1 && e.target.value.trim() !== "" && arr.length < 8) {
                  arr.push("");
                }
                setPlayerNames(arr);
              }}
            />
          ))}
        </div>

        <div className="settings-panel" style={{ display: 'flex', gap: '20px', width: '100%', flexWrap: 'wrap' }}>
          <div className="setting-card">
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>🎰 Scommessa</label>
            <div className="custom-select-premium">
              <button className="select-btn" type="button" onClick={() => setBetMode(cycleOption(betMode, BET_OPTS, -1))}>◀</button>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{BET_OPTS.find(o => o.v === betMode)?.l}</span>
              <button className="select-btn" type="button" onClick={() => setBetMode(cycleOption(betMode, BET_OPTS, 1))}>▶</button>
            </div>
          </div>

          <div className="setting-card">
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>💣 Trappola</label>
            <div className="custom-select-premium">
              <button className="select-btn" type="button" onClick={() => {
                const next = cycleOption(trapMode, TRAP_OPTS, -1);
                setTrapMode(next);
                if (next === "NO") setBetWithTrap(false);
              }}>◀</button>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{TRAP_OPTS.find(o => o.v === trapMode)?.l}</span>
              <button className="select-btn" type="button" onClick={() => {
                const next = cycleOption(trapMode, TRAP_OPTS, 1);
                setTrapMode(next);
                if (next === "NO") setBetWithTrap(false);
              }}>▶</button>
            </div>
          </div>

          <div className="setting-card">
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>📜 Regole Extra</label>
            <div className="custom-select-premium">
              <button className="select-btn" type="button" onClick={() => setRulesMode(cycleOption(rulesMode, RULES_MODE_OPTS, -1))}>◀</button>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{RULES_MODE_OPTS.find(o => o.v === rulesMode)?.l}</span>
              <button className="select-btn" type="button" onClick={() => setRulesMode(cycleOption(rulesMode, RULES_MODE_OPTS, 1))}>▶</button>
            </div>
          </div>

          {trapMode !== "NO" && (
          <div className="setting-card">
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>💣 Scommessa con Trappola</label>
            <div 
              className="custom-select-premium" 
              style={{ cursor: 'pointer', justifyContent: 'center', background: betWithTrap ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.3)', borderColor: betWithTrap ? 'var(--red)' : 'rgba(255,255,255,0.1)' }} 
              onClick={() => setBetWithTrap(!betWithTrap)}
            >
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: betWithTrap ? 'var(--red)' : 'inherit' }}>
                {betWithTrap ? "ATTIVA (ON)" : "DISATTIVA (OFF)"}
              </span>
            </div>
          </div>
          )}
        </div>

        <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} onClick={() => startGame()}>
          🚀 Inizia la partita
        </button>
      </div>
    </div>
  );
}
