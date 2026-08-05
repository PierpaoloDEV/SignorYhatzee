import { useState } from "react";

const GENERAL_RULES = [
  { cat: "Turni passivi", rule: "Ogni tre turni senza pedine in campo (quindi solo in casa o nel traguardo): BEVI! 🍺" },
  { cat: "Dado 6", rule: "Scegli chi beve e ritiri il dado! 🍻" },
  { cat: "Tre volte 6", rule: "Se fai 6 per 3 volte di fila, il tuo turno termina immediatamente e BEVI x3! 🍺🍺🍺" },
  { cat: "Mangiare", rule: "Se mangi qualcuno lo fai bere x2! 🍺🍺" },
  { cat: "Casella Sicura (⭐)", rule: "Se vai su una casella sicura sei immune alle bevute." },
  { cat: "Traguardo (🏁)", rule: "Se una pedina arriva al traguardo bevono tutti tranne te! 🥂" },
];

export default function RulesInfoModal() {
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

            <h3 style={{ color: 'var(--gold)', marginBottom: '10px', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Regole alcoliche
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {GENERAL_RULES.map(r => (
                <div key={r.cat} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '8px 12px', textAlign: 'left' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{r.cat}: </span>
                  <span style={{ fontSize: '0.9rem' }}>{r.rule}</span>
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
