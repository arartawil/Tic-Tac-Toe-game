import './controls.css';

function Controls({ onSubmit, onUndo, onReset, onPauseToggle, isPaused, canSubmit }) {
  return (
    <div className="controls">
      <button type="button" onClick={onUndo} disabled={!canSubmit}>
        Undo
      </button>
      <button type="button" onClick={onSubmit} disabled={!canSubmit}>
        Submit Path
      </button>
      <button type="button" onClick={onPauseToggle}>
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}

export default Controls;
