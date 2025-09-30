import classNames from '../utils/classNames.js';
import './tile.css';

function Tile({ tile, onSelect, isSelected, isLastSelected }) {
  const handleClick = () => {
    if (tile.locked) {
      return;
    }
    onSelect();
  };

  const handleTouch = (event) => {
    event.preventDefault();
    handleClick();
  };

  const displayValue = tile.locked ? '🔒' : tile.value;

  return (
    <button
      type="button"
      className={classNames('tile', {
        selected: isSelected,
        last: isLastSelected,
        negative: tile.value < 0,
        bonus: tile.multiplier > 1,
        locked: tile.locked
      })}
      onClick={handleClick}
      onTouchStart={handleTouch}
      disabled={tile.locked}
    >
      <span>{displayValue}</span>
      {tile.multiplier > 1 && !tile.locked ? <span className="multiplier">x{tile.multiplier}</span> : null}
    </button>
  );
}

export default Tile;
