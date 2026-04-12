export default function ActiveRulesBoard({ state }) {
  const { activeRules } = state;

  if (activeRules.length === 0) return null;

  return (
    <div className="active-rules-container" style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: 'var(--gold)', textAlign: 'center' }}>📜 Leggi in Vigore</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeRules.map((r, i) => (
          <li key={i} style={{ fontSize: '0.9rem', padding: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', borderLeft: '4px solid var(--gold)' }}>
            {r.type === "custom" ? r.label : <span><strong>{r.title}</strong>: {r.desc}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
