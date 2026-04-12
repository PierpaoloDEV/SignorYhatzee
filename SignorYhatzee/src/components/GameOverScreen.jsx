export default function GameOverScreen({ state }) {
  const { isGameOver, getWinner, players, totalScore, resetGame } = state;

  if (!isGameOver()) return null;

  return (
    <div className="app game-over-screen">
      <h1 className="title">🏆 Partita finita!</h1>
      <p className="winner-label">Vince...</p>
      <p className="winner-name">{getWinner()}</p>
      <p className="winner-sub">sei il Signor Yahtzee 🎉</p>
      <div className="scoreboard">
        {players.map((name, i) => (
          <div key={i} className="score-row">
            <span className="score-name">{name}</span>
            <span className="score-pts">{totalScore(i)} pt</span>
          </div>
        ))}
      </div>
      <button
        className="btn btn-outline"
        onClick={resetGame}
      >
        🔄 Nuova partita
      </button>
    </div>
  );
}
