import { CATEGORIES } from "../constants";
import { calculateScore } from "../utils/gameHelpers";

export default function Scoreboard({ state }) {
  const { players, player, scores, dice, rollsLeft, traps, trapMode, selectCategory, totalScore, getUpperScore } = state;

  const renderRow = (cat) => {
    const matchingTrapsCount = traps.filter(t => t === cat.key).length;
    const trapIcon = (trapMode === "VISIBILE" && matchingTrapsCount > 0)
      ? ` 💣${matchingTrapsCount > 1 ? `x${matchingTrapsCount}` : ""}`
      : "";

    return (
      <tr key={cat.key}>
        <td>
          {cat.label}
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{trapIcon}</span>
        </td>
        {players.map((p, i) => {
          const used = scores[i]?.[cat.key] !== undefined;
          const isCurrent = i === player;
          const preview = isCurrent ? calculateScore(dice, cat.key) : "";
          const canSelect = rollsLeft < 3;

          if (isCurrent && !used) {
            return (
              <td key={i} className="active-cell">
                <button
                  className="score-btn"
                  onClick={() => canSelect && selectCategory(cat.key)}
                  disabled={!canSelect}
                  style={{ opacity: canSelect ? 1 : 0.4, cursor: canSelect ? 'pointer' : 'not-allowed' }}
                >
                  +{preview}
                </button>
              </td>
            );
          }

          return (
            <td key={i} className={used ? "used-cell" : "empty-cell"}>
              {used ? (
                <>
                  {scores[i][cat.key]}
                  {cat.key === "yahtzee" && scores[i]._yahtzeeCount > 1 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--gold)', marginLeft: '3px', fontWeight: 'bold' }}>
                      (x{scores[i]._yahtzeeCount})
                    </span>
                  )}
                </>
              ) : "-"}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="scoreboard-container">
      <table className="main-scoreboard">
        <thead>
          <tr>
            <th>Combinazione</th>
            {players.map((p, i) => (
              <th key={i} className={i === player ? "active" : ""}>
                {p}
                <div className="table-pts">{totalScore(i)} pt</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.slice(0, 6).map(renderRow)}
          {/* RIGA BONUS */}
          <tr className="bonus-row" style={{ background: 'rgba(251,191,36,0.1)' }}>
            <td style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.8rem' }}>🎯 BONUS (63pt)</td>
            {players.map((p, i) => {
              const upperLimit = getUpperScore(i);
              const hasBonus = scores[i]?.bonus === 35;
              return (
                <td key={i} style={{ color: hasBonus ? 'var(--gold)' : 'var(--muted)', fontWeight: hasBonus ? 800 : 500, fontSize: '0.8rem' }}>
                  {hasBonus ? "+35 pt" : `${upperLimit}/63`}
                </td>
              );
            })}
          </tr>
          {CATEGORIES.slice(6).map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}
