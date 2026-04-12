import { cycleOption } from "../utils/gameHelpers";
import { BET_OPTS, TRAP_OPTS } from "../constants";

export default function SetupScreen({ state }) {
  const { playerNames, setPlayerNames, startGame, betMode, setBetMode, trapMode, setTrapMode } = state;

  return (
    <div className="app setup-screen">
      <h1 className="title">🎲 SignorYhatzee</h1>
      <p className="subtitle">Inserisci i giocatori (min 2)</p>
      <div className="input-grid">
        {playerNames.map((name, i) => (
          <input
            key={i}
            className="player-input"
            placeholder={`Giocatore ${i + 1}`}
            value={name}
            onChange={(e) => {
              const arr = [...playerNames];
              arr[i] = e.target.value;
              if (arr.every((n) => n.trim() !== "")) {
                arr.push("", "");
              }
              setPlayerNames(arr);
            }}
          />
        ))}
      </div>
      <div className="settings-panel" style={{ display: 'flex', gap: '30px', justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
        <div className="setting-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '10px' }}>🎰 Scommessa</label>
          <div className="custom-select" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: '30px', minWidth: '190px', justifyContent: 'space-between' }}>
            <button type="button" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'inherit', fontSize: '1rem', cursor: 'pointer', padding: '5px 10px', borderRadius: '50%' }} onClick={() => setBetMode(cycleOption(betMode, BET_OPTS, -1))}>◀</button>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{BET_OPTS.find(o => o.v === betMode)?.l}</span>
            <button type="button" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'inherit', fontSize: '1rem', cursor: 'pointer', padding: '5px 10px', borderRadius: '50%' }} onClick={() => setBetMode(cycleOption(betMode, BET_OPTS, 1))}>▶</button>
          </div>
        </div>
        <div className="setting-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '10px' }}>💣 Trappola</label>
          <div className="custom-select" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: '30px', minWidth: '190px', justifyContent: 'space-between' }}>
            <button type="button" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'inherit', fontSize: '1rem', cursor: 'pointer', padding: '5px 10px', borderRadius: '50%' }} onClick={() => setTrapMode(cycleOption(trapMode, TRAP_OPTS, -1))}>◀</button>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{TRAP_OPTS.find(o => o.v === trapMode)?.l}</span>
            <button type="button" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'inherit', fontSize: '1rem', cursor: 'pointer', padding: '5px 10px', borderRadius: '50%' }} onClick={() => setTrapMode(cycleOption(trapMode, TRAP_OPTS, 1))}>▶</button>
          </div>
        </div>
      </div>
      <button className="btn btn-primary" onClick={startGame}>
        🚀 Inizia la partita
      </button>
    </div>
  );
}
