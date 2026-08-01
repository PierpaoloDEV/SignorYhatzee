export default function ActiveRulesBoard({ state }) {
  const { activeRules, players, totalScore } = state;

  if (activeRules.length === 0) return null;

  const getDynamicLabel = (rule) => {
    if (rule.type !== "custom" || !rule.part1) return null;
    
    let label = rule.label;
    const allTotalScores = players.map((_, i) => totalScore(i));
    
    if (rule.part1.toLowerCase().includes("più punti")) {
      const max = Math.max(...allTotalScores);
      const leaders = players.filter((_, i) => allTotalScores[i] === max);
      label = label.replace(/Il giocatore con più punti/i, `Il giocatore con più punti (${leaders.join(", ")})`);
    } else if (rule.part1.toLowerCase().includes("meno punti")) {
      const min = Math.min(...allTotalScores);
      const losers = players.filter((_, i) => allTotalScores[i] === min);
      label = label.replace(/Il giocatore con meno punti/i, `Il giocatore con meno punti (${losers.join(", ")})`);
    }

    return label;
  };


  return (
    <div className="active-rules-container" style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: 'var(--gold)', textAlign: 'center' }}>📜 Leggi in Vigore</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeRules.map((r, i) => (
          <li key={i} style={{ fontSize: '0.9rem', padding: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', borderLeft: '4px solid var(--gold)' }}>
            {r.type === "custom" ? (getDynamicLabel(r) || r.label) : <span><strong>{r.title}</strong>: {r.desc}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

