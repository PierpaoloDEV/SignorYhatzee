import { useEffect, useState } from 'react';

export default function EventModal({ result, onClose }) {
  const [show, setShow] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    // Piccolo ritardo per l'animazione di entrata
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    if (result.type === 'customRule' && inputValue.trim()) {
      onClose({ customRule: inputValue.trim() });
    } else {
      onClose();
    }
  };

  return (
    <div 
      className={`wheel-event-overlay ${show ? 'show' : ''}`} 
      style={{ '--event-color': result.color }}
      onClick={handleClose}
    >
      <div 
        className="wheel-event-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wheel-event-icon">{result.icon}</div>
        <h2 className="wheel-event-title">{result.label}</h2>
        <p className="wheel-event-text">{result.text}</p>
        
        {result.type === 'customRule' && (
          <div style={{ marginTop: '15px' }}>
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Scrivi qui la tua nuova regola..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                minHeight: '80px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>
        )}

        <p className="wheel-event-hint">Tocca fuori o clicca per continuare</p>
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1.5rem', background: result.color, borderColor: result.color }} 
          onClick={handleClose}
        >
          {result.type === 'customRule' ? (inputValue.trim() ? 'Salva e Continua' : 'Salta') : 'Capito!'}
        </button>
      </div>
    </div>
  );
}
