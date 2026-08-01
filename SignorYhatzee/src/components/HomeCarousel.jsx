import { useRef, useState } from "react";
import "./HomeCarousel.css";

const GAMES = [
  { id: "yahtzee", emoji: "🎲", name: "Signor Yahtzee", tagline: "Il classico gioco dei dadi (ma con l'alcol)" },
  { id: "drago", emoji: "🐉", name: "Signor Drago", tagline: "Prossimamente" },
];

export default function HomeCarousel({ onSelectGame }) {
  const [index, setIndex] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStartX = useRef(0);
  const trackRef = useRef(null);

  const goTo = (i) => setIndex((i + GAMES.length) % GAMES.length);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setDragging(true);
  };
  const handleTouchMove = (e) => {
    if (!dragging) return;
    setDragDelta(e.touches[0].clientX - touchStartX.current);
  };
  const handleTouchEnd = () => {
    const width = trackRef.current?.offsetWidth || 1;
    const threshold = width * 0.2;
    if (dragDelta > threshold) prev();
    else if (dragDelta < -threshold) next();
    setDragDelta(0);
    setDragging(false);
  };

  const trackStyle = {
    transform: `translateX(calc(-${index * 100}% + ${dragDelta}px))`,
    transition: dragging ? "none" : "transform .3s ease",
  };

  return (
    <div className="app home-carousel-screen">
      <h1 className="title">🎮 Scegli il gioco</h1>

      <div className="game-carousel">
        <button className="carousel-arrow left" onClick={prev} aria-label="Gioco precedente">‹</button>

        <div
          className="carousel-track"
          ref={trackRef}
          style={trackStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {GAMES.map((game) => (
            <div className="carousel-slide" key={game.id}>
              <div className="glass-panel game-card">
                <div className="game-card-emoji">{game.emoji}</div>
                <h2 className="game-card-name">{game.name}</h2>
                <p className="subtitle">{game.tagline}</p>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => onSelectGame(game.id)}>
                  Gioca
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-arrow right" onClick={next} aria-label="Gioco successivo">›</button>
      </div>

      <div className="carousel-dots">
        {GAMES.map((game, i) => (
          <span
            key={game.id}
            className={`carousel-dot ${i === index ? "active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
