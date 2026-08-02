import { useState, useEffect } from 'react';
import { cycleOption } from "../utils/gameHelpers";
import { BET_OPTS, TRAP_OPTS, RULES_MODE_OPTS } from "../constants";

export default function LobbyScreen({ multiplayer, onLocalPlay, onOnlinePlay, state, onExit }) {
  const { 
    hostRoom, 
    joinRoom, 
    roomCode, 
    players, 
    isHost, 
    startGame, 
    error, 
    isConnected,
    leaveRoom 
  } = multiplayer;
  
  const { betMode, setBetMode, trapMode, setTrapMode, rulesMode, setRulesMode, betWithTrap, setBetWithTrap } = state || {};

  const [playerName, setPlayerName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [mode, setMode] = useState('choice'); // choice, host, join, waiting

  // Sincronizza il modo della lobby con lo stato del multiplayer
  useEffect(() => {
    if (roomCode) {
      setMode(isHost ? 'host' : 'waiting');
    } else if (mode !== 'host' && mode !== 'join' && mode !== 'waiting') {
      setMode('choice');
    }
  }, [roomCode, isHost]);

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      alert("Codice copiato negli appunti! 📋");
    }
  };

  if (mode === 'choice') {
    return (
      <div className="app lobby">
        {onExit && <button className="back-btn" onClick={onExit}>← Altri giochi</button>}
        <h1 className="title">🎲 SignorYahtzee</h1>
        <div className="glass-panel lobby-options">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
            onLocalPlay();
          }}>
            🏠 Gioca in Locale
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', margin: '10px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>OPPURE ONLINE</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>

          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => {
            onOnlinePlay();
            setMode('host');
          }}>
            🌐 Crea Partita Online
          </button>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => {
            onOnlinePlay();
            setMode('join');
          }}>
            🤝 Partecipa con Codice
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'host' || mode === 'waiting') {
    return (
      <div className="app lobby">
        <button className="back-btn" onClick={() => {
          leaveRoom();
          setMode('choice');
        }}>← Indietro</button>
        <h1 className="title">Crea Stanza</h1>
        
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          {!roomCode ? (
            <div className="setup-form">
              <p className="subtitle" style={{ margin: 0 }}>Scegli il tuo nome</p>
              <input 
                className="player-input neon-input"
                placeholder="Nome..." 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              {error && <p className="error-text">{error}</p>}
              <button 
                className="btn btn-primary"
                disabled={!playerName.trim()}
                onClick={() => hostRoom(playerName)}
              >
                Genera Codice
              </button>
            </div>
          ) : (
            <div className="room-info">
              <p className="room-code-label">CODICE STANZA</p>
              <p className="room-code-display" onClick={handleCopyCode} style={{ cursor: 'pointer' }}>{roomCode}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '-15px', marginBottom: '20px' }}>Clicca sul codice per copiarlo</p>
              
              <div className="player-list">
                {players.map((p, i) => (
                  <div key={`${p.name}-${i}`} className="player-tag">
                    <span>{p.name} {p.id === multiplayer.socketId ? '(Tu)' : ''}</span>
                  </div>
                ))}
              </div>
              
              <div className="settings-panel" style={{ display: 'flex', gap: '20px', width: '100%', flexWrap: 'wrap', marginTop: '20px', marginBottom: '20px' }}>
                <div className="setting-card" style={{ flex: 1, minWidth: '140px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>🎰 Scommessa</label>
                  <div className="custom-select-premium">
                    {isHost && <button className="select-btn" type="button" onClick={() => setBetMode(cycleOption(betMode, BET_OPTS, -1))}>◀</button>}
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{BET_OPTS.find(o => o.v === betMode)?.l}</span>
                    {isHost && <button className="select-btn" type="button" onClick={() => setBetMode(cycleOption(betMode, BET_OPTS, 1))}>▶</button>}
                  </div>
                </div>

                <div className="setting-card" style={{ flex: 1, minWidth: '140px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>💣 Trappola</label>
                  <div className="custom-select-premium">
                    {isHost && <button className="select-btn" type="button" onClick={() => {
                      const next = cycleOption(trapMode, TRAP_OPTS, -1);
                      setTrapMode(next);
                      if (next === "NO") setBetWithTrap(false);
                    }}>◀</button>}
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{TRAP_OPTS.find(o => o.v === trapMode)?.l}</span>
                    {isHost && <button className="select-btn" type="button" onClick={() => {
                      const next = cycleOption(trapMode, TRAP_OPTS, 1);
                      setTrapMode(next);
                      if (next === "NO") setBetWithTrap(false);
                    }}>▶</button>}
                  </div>
                </div>

                <div className="setting-card" style={{ flex: 1, minWidth: '140px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>📜 Regole Extra</label>
                  <div className="custom-select-premium">
                    {isHost && <button className="select-btn" type="button" onClick={() => setRulesMode(cycleOption(rulesMode, RULES_MODE_OPTS, -1))}>◀</button>}
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{RULES_MODE_OPTS.find(o => o.v === rulesMode)?.l}</span>
                    {isHost && <button className="select-btn" type="button" onClick={() => setRulesMode(cycleOption(rulesMode, RULES_MODE_OPTS, 1))}>▶</button>}
                  </div>
                </div>

                {trapMode !== "NO" && (
                <div className="setting-card" style={{ flex: 1, minWidth: '140px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase' }}>💣 Scomm. + Trappola</label>
                  <div 
                    className="custom-select-premium" 
                    style={{ cursor: isHost ? 'pointer' : 'default', justifyContent: 'center', background: betWithTrap ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.3)', borderColor: betWithTrap ? 'var(--red)' : 'rgba(255,255,255,0.1)' }} 
                    onClick={() => isHost && setBetWithTrap(!betWithTrap)}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', color: betWithTrap ? 'var(--red)' : 'inherit' }}>
                      {betWithTrap ? "ATTIVA (ON)" : "DISATTIVA (OFF)"}
                    </span>
                  </div>
                </div>
                )}
              </div>

              {isHost && (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '20px' }}
                  disabled={players.length < 2}
                  onClick={startGame}
                >
                  🚀 Inizia Partita
                </button>
              )}
              {!isHost && <p className="online-status">In attesa dell'host...</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="app lobby">
        <button className="back-btn" onClick={() => setMode('choice')}>← Indietro</button>
        <h1 className="title">Partecipa</h1>
        <div className="glass-panel setup-form" style={{ width: '100%', maxWidth: '400px' }}>
          <p className="subtitle" style={{ margin: 0 }}>Inserisci i dettagli</p>
          <input 
            className="player-input neon-input"
            placeholder="Il tuo nome" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input 
            className="player-input neon-input"
            placeholder="Codice Stanza (4 cifre)" 
            maxLength={4}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button 
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={!playerName.trim() || inputCode.length < 4}
            onClick={() => joinRoom(inputCode, playerName)}
          >
            Entra in Stanza
          </button>
        </div>
      </div>
    );
  }

  return null;
}
