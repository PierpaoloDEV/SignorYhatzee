export default function DragoScreen({ onExit }) {
  return (
    <div className="app" style={{ justifyContent: 'center', minHeight: '100vh', background: '#fff', color: '#111' }}>
      <button className="back-btn" style={{ color: '#111' }} onClick={onExit}>← Altri giochi</button>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center' }}>🐉 Gioco del Drago</h1>
    </div>
  );
}
