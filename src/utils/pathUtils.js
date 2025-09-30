export function isAdjacent(a, b) {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

export function isValidNextSelection(last, next) {
  if (!last) {
    return true;
  }
  return isAdjacent(last, next);
}

export function calculatePathSum(path, grid) {
  return path.reduce((total, pos) => {
    const tile = grid[pos.row]?.[pos.col];
    if (!tile || tile.locked) {
      return total;
    }
    const value = tile.value * (tile.multiplier || 1);
    return total + value;
  }, 0);
}
