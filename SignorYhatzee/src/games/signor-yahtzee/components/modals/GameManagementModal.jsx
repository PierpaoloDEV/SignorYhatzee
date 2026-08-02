import React from "react";

export default function GameManagementModal({ state }) {
  const { 
    showManagementModal, 
    setShowManagementModal, 
    players, 
    removePlayer, 
    restartGame, 
    resetGame,
    socketId,
    playerIds,
    multiplayerPlayers
  } = state;

  if (!showManagementModal) return null;

  return (
    <div className="popup-overlay" style={{ zIndex: 10000 }}>
      <div className="popup" style={{ width: '90%', maxWidth: '400px', background: 'rgba(20, 20, 25, 0.95)', border: '2px solid var(--accent)' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--accent)' }}>⚙️ Gestione Partita</h2>
        
        <div className="management-section" style={{ marginBottom: '25px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--gold)' }}>Giocatori Attivi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {players.map((name, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px'
              }}>
                <span style={{ fontWeight: 'bold' }}>{name} {socketId && playerIds[i] === socketId ? '(Tu)' : ''}</span>
                {socketId && playerIds[i] !== socketId && (
                  <button 
                    className="btn btn-outline" 
                    style={{ 
                      padding: '4px 8px', 
                      fontSize: '0.8rem', 
                      borderColor: '#ff4d4d', 
                      color: '#ff4d4d',
                      minWidth: 'auto'
                    }}
                    onClick={() => {
                      removePlayer(i);
                    }}
                  >
                    Rimuovi ❌
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            style={{ background: 'var(--gold)', color: '#000' }}
            onClick={() => {
              restartGame();
              setShowManagementModal(false);
            }}
          >
            🔄 Ricomincia Partita
          </button>
          
          <button 
            className="btn btn-outline" 
            onClick={() => {
              resetGame();
              setShowManagementModal(false);
            }}
          >
            🏠 Torna al Menu
          </button>

          <button 
            className="btn btn-outline" 
            style={{ marginTop: '10px' }}
            onClick={() => setShowManagementModal(false)}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
