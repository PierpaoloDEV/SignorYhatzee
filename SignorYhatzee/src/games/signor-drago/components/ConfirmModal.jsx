export default function ConfirmModal({
  title, text, confirmLabel = 'Conferma', cancelLabel = 'Annulla', extraLabel,
  onConfirm, onCancel, onExtra,
}) {
  return (
    <div className="drago-confirm-overlay" onClick={onCancel}>
      <div className="drago-confirm-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="drago-confirm-title">{title}</h2>
        {text && <p className="drago-confirm-text">{text}</p>}
        <div className="drago-confirm-actions">
          <button className="btn btn-outline" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
        {extraLabel && onExtra && (
          <button className="drago-confirm-extra" onClick={onExtra}>{extraLabel}</button>
        )}
      </div>
    </div>
  );
}
