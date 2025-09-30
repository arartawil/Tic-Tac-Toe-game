import Tile from './Tile.jsx';
import './board.css';

function Board({ grid, selectedPath, onSelect }) {
  const columnCount = grid[0]?.length || grid.length || 0;
  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
      {grid.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const isSelected = selectedPath.some((pos) => pos.row === rowIndex && pos.col === colIndex);
          const isLast = selectedPath[selectedPath.length - 1]?.row === rowIndex &&
            selectedPath[selectedPath.length - 1]?.col === colIndex;
          return (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              tile={tile}
              onSelect={() => onSelect(rowIndex, colIndex)}
              isSelected={isSelected}
              isLastSelected={isLast}
            />
          );
        })
      )}
    </div>
  );
}

export default Board;
