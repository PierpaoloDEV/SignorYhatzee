import { useState, useEffect } from 'react';

export default function PlayerPickerModal({ state }) {
  const { showPlayerPicker, popupPickerEvents, players, player, isMyTurn, handlePickerDone } = state;

  const [eventIdx, setEventIdx] = useState(0);
  const [remainingSips, setRemainingSips] = useState(0);
  const [log, setLog] = useState([]); // [{ name, eventIdx }]
  const [allDone, setAllDone] = useState(false);

  // Reset local state whenever the picker opens with new events
  useEffect(() => {
    if (showPlayerPicker && popupPickerEvents?.length > 0) {
      setEventIdx(0);
      setRemainingSips(popupPickerEvents[0].sips);
      setLog([]);
      setAllDone(false);
    }
  }, [showPlayerPicker]);

  if (!showPlayerPicker || !popupPickerEvents?.length) return null;

  const currentEvent = popupPickerEvents[eventIdx];
  const totalEvents = popupPickerEvents.length;

  const handlePick = (name) => {
    if (!isMyTurn || remainingSips <= 0 || allDone) return;

    const newLog = [...log, { name, eventIdx }];
    setLog(newLog);
    const newRemaining = remainingSips - 1;

    if (newRemaining === 0) {
      const nextIdx = eventIdx + 1;
      if (nextIdx < totalEvents) {
        setEventIdx(nextIdx);
        setRemainingSips(popupPickerEvents[nextIdx].sips);
      } else {
        setAllDone(true);
      }
    } else {
      setRemainingSips(newRemaining);
    }
  };

  // Group log entries by event for display
  const logForCurrentEvent = log.filter(e => e.eventIdx === eventIdx);
  const allPicksLog = log.map(e => e.name);

  return (
    <div className="popup-overlay" style={{ zIndex: 300 }}>
      <div
        className="popup"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '420px', width: '92%' }}
      >
        {/* Header */}
        <h2 style={{ marginBottom: '6px', fontSize: '1.4rem' }}>🥂 Chi beve?</h2>

        {/* Progress pills */}
        {totalEvents > 1 && (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '14px' }}>
            {popupPickerEvents.map((ev, i) => (
              <div key={i} style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: i < eventIdx || allDone
                  ? 'var(--gold)'
                  : i === eventIdx
                    ? 'var(--accent)'
                    : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s'
              }} />
            ))}
          </div>
        )}

        {!isMyTurn ? (
          /* Non-active players: show live log of picks */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ color: 'var(--muted)', marginBottom: '12px' }}>
              ⏳ In attesa di <b style={{ color: 'var(--accent)' }}>{players?.[player] ?? '...'}</b> per scegliere...
            </p>
            {allPicksLog.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px 14px', textAlign: 'left' }}>
                {allPicksLog.map((name, i) => (
                  <div key={i} style={{ padding: '3px 0', color: 'var(--gold)', fontSize: '0.9rem' }}>
                    🍺 {name} beve
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : allDone ? (
          /* All picks done: show summary + confirm */
          <div>
            <div style={{
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid var(--gold)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              textAlign: 'left'
            }}>
              <p style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: '8px', fontSize: '0.9rem' }}>
                🍻 Riepilogo sorsi:
              </p>
              {allPicksLog.map((name, i) => (
                <div key={i} style={{ fontSize: '0.9rem', padding: '2px 0' }}>
                  🍺 {name} beve
                </div>
              ))}
            </div>
            <button
              onClick={() => handlePickerDone(allPicksLog)}
              style={{
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'var(--gold)',
                color: '#111',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ✅ Conferma
            </button>
          </div>
        ) : (
          /* Picking phase */
          <div>
            {/* Current event label */}
            <p style={{
              color: 'var(--gold)', fontWeight: 700,
              marginBottom: '6px', fontSize: '0.95rem', textAlign: 'center'
            }}>
              {currentEvent.label}
            </p>

            {/* Remaining sips counter */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', marginBottom: '14px'
            }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Sorsi da assegnare:</span>
              <span style={{
                fontSize: '1.4rem', fontWeight: 900,
                color: 'var(--accent)', lineHeight: 1
              }}>
                {remainingSips}
              </span>
            </div>

            {/* Log of this event's picks */}
            {logForCurrentEvent.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px', padding: '8px 12px',
                marginBottom: '12px', textAlign: 'left', fontSize: '0.85rem'
              }}>
                {logForCurrentEvent.map((e, i) => (
                  <div key={i} style={{ padding: '2px 0', color: 'var(--gold)' }}>
                    🍺 {e.name} beve
                  </div>
                ))}
              </div>
            )}

            {/* Player selection grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: players.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {players.map((name, i) => (
                <button
                  key={i}
                  onClick={() => handlePick(name)}
                  style={{
                    padding: '14px 10px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: i === player
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${i === player ? 'var(--red)' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    color: 'inherit',
                    transition: 'all 0.15s',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = i === player
                      ? 'rgba(239,68,68,0.3)'
                      : 'rgba(255,255,255,0.18)';
                    e.currentTarget.style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = i === player
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {name}
                  {i === player && <span style={{ fontSize: '0.75rem', opacity: 0.7, display: 'block' }}>😬 (tu)</span>}
                </button>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
