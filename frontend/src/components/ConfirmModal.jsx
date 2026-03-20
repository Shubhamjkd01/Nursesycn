export default function ConfirmModal({ text, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>⚠️ Confirm Administration</h3>
        <p>{text || 'Are you sure this medicine has been administered to the patient?'}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>No, Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Yes, Mark as Given ✓</button>
        </div>
      </div>
    </div>
  )
}
