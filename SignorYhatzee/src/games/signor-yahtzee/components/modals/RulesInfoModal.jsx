import { useState } from "react";
import { SPECIAL_RULES } from "../../constants";

const GENERAL_RULES = [
  { cat: "Generale", rule: "Se metti 0 su un punteggio: BEVI 2! 🍺🍺" },
  { cat: "1-6 (Assi…Sei)", rule: "Nessuna regola speciale da bere." },
  { cat: "Tris", rule: "Scegli chi beve 🍺" },
  { cat: "Poker", rule: "Scegli 2 persone che bevono 🍻 — se il punteggio è ≥18 puoi piazzare una Trappola!" },
  { cat: "Full", rule: "Bevono tutti, compreso te 🍻" },
  { cat: "Scala Piccola", rule: "Bevono quelli con il punteggio più basso." },
  { cat: "Scala Grande", rule: "Bevono quelli con il punteggio più alto." },
  { cat: "Yahtzee", rule: "Bevono tutti gli altri 🔥 + chi lo fa può creare una nuova regola!" },
  { cat: "Chance", rule: "Bevono tutti quelli con Chance inferiore alla tua. Se non c'è nessuno, bevi tu! (Gli 0 non contano)" },
  { cat: "Bonus (+35pt)", rule: "Raggiunto con ≥63 punti nella sezione alta. Chi lo sblocca sceglie 3 sorsi da fare bere!" },
];

export default function RulesInfoModal({ state }) {
  const { activeRules } = state;
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bottone in alto a sinistra */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
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
          backdropFilter: 'blur(6px)',
          color: '#fff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Vedi le regole"
      >
        📋
      </button>

      {/* Modal */}
      {open && (
        <div
          className="popup-overlay"
          onClick={() => setOpen(false)}
          style={{ zIndex: 2500, cursor: 'pointer', alignItems: 'flex-start', paddingTop: '20px' }}
        >
          <div
            className="popup bet-popup"
            onClick={e => e.stopPropagation()}
            style={{ cursor: 'default', maxHeight: '85vh', overflowY: 'auto', width: '92%', maxWidth: '440px' }}
          >
            <h2 style={{ marginBottom: '15px' }}>📋 Regole di gioco</h2>

            {/* Regole generali */}
            <h3 style={{ color: 'var(--gold)', marginBottom: '10px', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Regole generali
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {GENERAL_RULES.map(r => (
                <div key={r.cat} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '8px 12px', textAlign: 'left' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{r.cat}: </span>
                  <span style={{ fontSize: '0.9rem' }}>{r.rule}</span>
                </div>
              ))}
            </div>

            {/* Regole attive aggiuntive */}
            <h3 style={{ color: '#f472b6', marginBottom: '10px', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Regole aggiuntive attive
            </h3>
            {activeRules.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'center' }}>Nessuna regola aggiuntiva ancora.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                {activeRules.map((r, i) => {
                  let displayLabel = r.type === 'special' ? r.desc : r.label;
                  
                  // Risoluzione dinamica dei nomi per le regole custom
                  if (r.type === "custom" && r.part1) {
                    const allTotalScores = state.players.map((_, idx) => state.totalScore(idx));
                    if (r.part1.toLowerCase().includes("più punti")) {
                      const max = Math.max(...allTotalScores);
                      const leaders = state.players.filter((_, idx) => allTotalScores[idx] === max);
                      displayLabel = displayLabel.replace(/Il giocatore con più punti/i, `Il giocatore con più punti (${leaders.join(", ")})`);
                    } else if (r.part1.toLowerCase().includes("meno punti")) {
                      const min = Math.min(...allTotalScores);
                      const losers = state.players.filter((_, idx) => allTotalScores[idx] === min);
                      displayLabel = displayLabel.replace(/Il giocatore con meno punti/i, `Il giocatore con meno punti (${losers.join(", ")})`);
                    }
                  }

                  return (
                    <div key={i} style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: '10px', padding: '8px 12px', textAlign: 'left' }}>
                      <span style={{ fontWeight: 'bold', color: '#f472b6' }}>
                        {r.type === 'special' ? `⭐ ${r.title}` : '📜 Regola Custom'}:{' '}
                      </span>
                      <span style={{ fontSize: '0.9rem' }}>
                        {displayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}


            {/* Tutte le regole speciali disponibili */}
            <h3 style={{ color: 'var(--accent)', marginTop: '20px', marginBottom: '10px', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tutte le regole speciali disponibili
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              {SPECIAL_RULES.map((r, i) => (
                <div key={r.key} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '8px 12px', textAlign: 'left' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>⭐ {r.title}: </span>
                  <span style={{ fontSize: '0.9rem' }}>{r.desc}</span>
                </div>
              ))}
            </div>

            <button
              className="btn btn-outline"
              style={{ marginTop: '15px', width: '100%' }}
              onClick={() => setOpen(false)}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
