import { useState } from "react";

export default function RulesModal({ state }) {
  const { players, snakeEyesPlayerIndex, thumbKingPlayerIndex } = state;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 2000,
          background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.35)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          transition: 'transform 0.2s, background 0.2s'
        }}
        title="Regole e Stato"
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        📖
      </button>

      {open && (
        <div className="wheel-event-overlay show" onClick={() => setOpen(false)}>
          <div className="glass-panel" style={{
            maxWidth: '500px',
            width: '90vw',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(20, 20, 30, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>📖 Regole e Stato</h2>
              <button 
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', textAlign: 'left' }}>
              <h3 style={{ marginTop: 0, color: '#f97316', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Stato Attuale</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {snakeEyesPlayerIndex !== null && players[snakeEyesPlayerIndex] ? (
                  <div className="status-indicator snake-eyes-indicator" style={{ position: 'relative', top: 0, right: 0, width: '100%' }}>
                    <span className="status-icon">🐍</span>
                    <div className="status-text">
                      <span>Occhi di Serpente:</span>
                      <strong style={{ color: players[snakeEyesPlayerIndex].color, fontSize: '1.1rem' }}>{players[snakeEyesPlayerIndex].name}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: '#888' }}>
                    🐍 Nessun giocatore ha gli Occhi di Serpente.
                  </div>
                )}

                {thumbKingPlayerIndex !== null && players[thumbKingPlayerIndex] ? (
                  <div className="status-indicator thumb-king-indicator" style={{ position: 'relative', top: 0, right: 0, width: '100%' }}>
                    <span className="status-icon">👍</span>
                    <div className="status-text">
                      <span>Re del Pollice:</span>
                      <strong style={{ color: players[thumbKingPlayerIndex].color, fontSize: '1.1rem' }}>{players[thumbKingPlayerIndex].name}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: '#888' }}>
                    👍 Nessuno è attualmente il Re del Pollice.
                  </div>
                )}
              </div>

              <h3 style={{ color: '#f97316', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Regole Speciali</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: '1.1rem' }}>🐍 Occhi di Serpente</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#ccc', lineHeight: '1.4' }}>Chi ha gli occhi di serpente non deve essere guardato negli occhi. Se incroci lo sguardo con lui, bevi! Resta attivo finché non li riceve un altro.</p>
                </div>
                <div>
                  <strong style={{ color: '#fff', fontSize: '1.1rem' }}>👍 Re del Pollice</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#ccc', lineHeight: '1.4' }}>Il re del pollice può mettere il pollice sul tavolo in qualsiasi momento. L'ultimo che lo nota e lo fa, beve! Resta re finché non lo diventa un altro.</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
