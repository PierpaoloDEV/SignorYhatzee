import { BASE_RULE, GAME_TITLE, MAX_PLAYERS, MIN_PLAYERS } from '../constants';

export default function SetupScreen({ state, onExit }) {
  const { playerNames, setPlayerNames, startGame } = state;
  const filledCount = playerNames.filter((n) => n.trim()).length;
  const canStart = filledCount >= MIN_PLAYERS;

  const handleChange = (i, value) => {
    const arr = [...playerNames];
    arr[i] = value;
    if (i === arr.length - 1 && value.trim() !== '' && arr.length < MAX_PLAYERS) {
      arr.push('');
    }
    setPlayerNames(arr);
  };

  const handleRemove = (i) => {
    if (playerNames.length <= 2) return;
    setPlayerNames(playerNames.filter((_, idx) => idx !== i));
  };

  return (
    <div className="app drago-app">
      <button className="back-btn" onClick={onExit}>← Altri giochi</button>
      <h1 className="drago-title">🐉 {GAME_TITLE}</h1>
      <p className="drago-subtitle">Aggiungi le pedine (min {MIN_PLAYERS}, max {MAX_PLAYERS})</p>

      <div className="glass-panel drago-setup-panel">
        <div className="drago-input-list">
          {playerNames.map((name, i) => (
            <div key={i} className="drago-input-row">
              <input
                className="drago-input"
                placeholder={`Pedina ${i + 1}`}
                value={name}
                maxLength={16}
                onChange={(e) => handleChange(i, e.target.value)}
              />
              {playerNames.length > 2 && (
                <button
                  type="button"
                  className="drago-input-remove"
                  aria-label="Rimuovi pedina"
                  onClick={() => handleRemove(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button className="btn btn-primary drago-start-btn" disabled={!canStart} onClick={startGame}>
          🔥 Inizia la partita
        </button>
      </div>

      <p className="drago-rule-note">📜 {BASE_RULE}</p>
    </div>
  );
}
