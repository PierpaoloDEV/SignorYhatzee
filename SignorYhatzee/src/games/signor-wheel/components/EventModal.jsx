import { useEffect, useState } from 'react';

export default function EventModal({ result, onClose }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Piccolo ritardo per l'animazione di entrata
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div 
      className={`wheel-event-overlay ${show ? 'show' : ''}`} 
      style={{ '--event-color': result.color }}
      onClick={onClose}
    >
      <div 
        className="wheel-event-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wheel-event-icon">{result.icon}</div>
        <h2 className="wheel-event-title">{result.label}</h2>
        <p className="wheel-event-text">{result.text}</p>
        <p className="wheel-event-hint">Tocca fuori o clicca per continuare</p>
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1.5rem', background: result.color, borderColor: result.color }} 
          onClick={onClose}
        >
          Capito!
        </button>
      </div>
    </div>
  );
}
