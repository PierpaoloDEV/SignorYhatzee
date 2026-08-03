import { useRef, useState, useCallback, useEffect } from "react";
import "./HomeCarousel.css";

const GAMES = [
  { id: "yahtzee", emoji: "🎲", name: "Signor Yahtzee", tagline: "Il classico gioco dei dadi (ma con l'alcol)" },
  { id: "drago", emoji: "🐉", name: "Signor Drago", tagline: "Il gioco dell'oca (ma con l'alcol)" },
  { id: "ludo", emoji: "♟️", name: "Signor Ludo", tagline: "Il gioco da tavolo per 4 giocatori (ma con l'alcol)" },
  { id: "wheel", emoji: "🎡", name: "Signor Wheel", tagline: "La ruota della fortuna (ma con l'alcol)" },
];

const N = GAMES.length;

function getOffset(i, active, direction) {
  let off = i - active;
  if (off > N / 2) off -= N;
  if (off < -N / 2) off += N;
  if (Math.abs(off) === N / 2) {
    off = direction >= 0 ? N / 2 : -N / 2;
  }
  return off;
}

export default function HomeCarousel({ onSelectGame }) {
  const [index, setIndex] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(0);
  const containerRef = useRef(null);
  // Track previous offsets to detect cards that "jumped" position
  const prevOffsetsRef = useRef(null);

  const goTo = useCallback((i) => {
    const next = ((i % N) + N) % N;
    setDirection(i >= index ? 1 : -1);
    setIndex(next);
  }, [index]);

  const prev = () => {
    setDirection(-1);
    setIndex((index - 1 + N) % N);
  };
  const next = () => {
    setDirection(1);
    setIndex((index + 1) % N);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setDragging(true);
  };
  const handleTouchMove = (e) => {
    if (!dragging) return;
    const raw = e.touches[0].clientX - touchStartX.current;
    setDragDelta(Math.max(-120, Math.min(120, raw)));
  };
  const handleTouchEnd = () => {
    const width = containerRef.current?.offsetWidth || 1;
    const threshold = width * 0.15;
    if (dragDelta > threshold) prev();
    else if (dragDelta < -threshold) next();
    setDragDelta(0);
    setDragging(false);
  };

  const dragOffsetPx = dragging ? dragDelta : 0;

  // Compute all offsets for this render
  const offsets = GAMES.map((_, i) => getOffset(i, index, direction));

  // Build card elements
  const cards = GAMES.map((game, i) => {
    const offset = offsets[i];
    const prevOffset = prevOffsetsRef.current ? prevOffsetsRef.current[i] : offset;
    const absOffset = Math.abs(offset);
    const isFront = absOffset === 0;
    const isNeighbor = absOffset === 1;
    const isVisible = isFront || isNeighbor;

    // A card "jumped" if its offset changed by more than 1 step,
    // or if we have no previous data (first render)
    const jumped = prevOffsetsRef.current === null || Math.abs(offset - prevOffset) > 1;

    const translateX = offset * 240 + dragOffsetPx;
    const scale = isFront ? 1 : 0.82;
    const opacity = isFront ? 1 : isNeighbor ? 0.45 : 0;
    const zIndex = isFront ? 10 : 5;

    // Disable transition if dragging, card jumped, or card is hidden
    const shouldAnimate = !dragging && !jumped && isVisible;

    const [mainText, subText] = game.tagline.split(' (');

    return (
      <div
        className={`carousel-3d-card ${isFront ? "carousel-3d-card--active" : ""}`}
        key={game.id}
        style={{
          transform: `translateX(${translateX}px) scale(${scale})`,
          opacity,
          zIndex,
          transition: shouldAnimate ? "all 0.5s cubic-bezier(.4, 0, .2, 1)" : "none",
          pointerEvents: isFront ? "auto" : "none",
          visibility: isVisible ? "visible" : "hidden",
        }}
      >
        <div className={`game-card ${isFront ? "glass-panel" : "game-card--ghost"}`}>
          <div className="game-card-emoji">{game.emoji}</div>
          <h2 className="game-card-name">{game.name}</h2>
          <p className="subtitle" style={{ margin: 0 }}>
            {mainText}
            {subText && (
              <span style={{ display: 'block', fontSize: '0.85em', opacity: 0.8, marginTop: '4px' }}>
                ({subText}
              </span>
            )}
          </p>
          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 'auto' }}
            onClick={() => onSelectGame(game.id)}
          >
            Gioca
          </button>
        </div>
      </div>
    );
  });

  // Save current offsets AFTER commit (not during render)
  // so React Strict Mode double-render doesn't break the comparison
  useEffect(() => {
    prevOffsetsRef.current = offsets;
  });

  return (
    <div className="app home-carousel-screen">
      <h1 className="title">🎮 Scegli il gioco</h1>

      <div
        className="carousel-3d-container"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="carousel-fade carousel-fade--left" />
        <div className="carousel-fade carousel-fade--right" />
        {cards}
        <button className="carousel-arrow left" onClick={prev} aria-label="Gioco precedente">‹</button>
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
