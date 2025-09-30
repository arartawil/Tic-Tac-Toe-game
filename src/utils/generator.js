import { isAdjacent } from './pathUtils.js';

const MAX_ATTEMPTS = 200;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildNeighbors(size, cell) {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = cell.row + dr;
      const nc = cell.col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        neighbors.push({ row: nr, col: nc });
      }
    }
  }
  return neighbors;
}

function generateSolutionPath(size) {
  const minLength = Math.min(4, size + 1);
  const maxLength = Math.min(size * 2, size * size);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const path = [];
    const used = new Set();
    const start = { row: randomInt(0, size - 1), col: randomInt(0, size - 1) };
    path.push(start);
    used.add(`${start.row},${start.col}`);
    const desiredLength = randomInt(minLength, Math.max(minLength, maxLength));
    while (path.length < desiredLength) {
      const last = path[path.length - 1];
      const neighbors = buildNeighbors(size, last).filter((pos) => !used.has(`${pos.row},${pos.col}`));
      if (neighbors.length === 0) {
        break;
      }
      const next = neighbors[randomInt(0, neighbors.length - 1)];
      path.push(next);
      used.add(`${next.row},${next.col}`);
    }
    if (path.length >= minLength) {
      return path;
    }
  }
  throw new Error('Failed to generate solution path');
}

function valueBounds(features) {
  if (features.negative) {
    return { min: -5, max: 9 };
  }
  return { min: 1, max: 9 };
}

function generateSolutionNumbers(pathLength, levelConfig) {
  const { min, max } = valueBounds(levelConfig.features);
  const [targetMin, targetMax] = levelConfig.targetRange;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const numbers = [];
    let runningSum = 0;
    for (let i = 0; i < pathLength - 1; i += 1) {
      const value = randomInt(min, max);
      numbers.push(value);
      runningSum += value;
    }
    const remainingMin = targetMin - runningSum;
    const remainingMax = targetMax - runningSum;
    const finalMin = Math.max(min, remainingMin);
    const finalMax = Math.min(max, remainingMax);
    if (finalMin > finalMax) {
      continue;
    }
    const finalValue = randomInt(finalMin, finalMax);
    numbers.push(finalValue);
    const total = runningSum + finalValue;
    if (total >= targetMin && total <= targetMax) {
      return { numbers, target: total };
    }
  }
  throw new Error('Failed to generate solution numbers');
}

function pickRandomCells(size, count, excludedSet) {
  const available = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const key = `${row},${col}`;
      if (!excludedSet.has(key)) {
        available.push({ row, col });
      }
    }
  }
  for (let i = available.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available.slice(0, count).map(({ row, col }) => `${row},${col}`);
}

function createTile(value, overrides = {}) {
  return {
    value,
    multiplier: 1,
    locked: false,
    ...overrides
  };
}

export function generatePuzzle(levelConfig) {
  const size = levelConfig.gridSize;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const solutionPath = generateSolutionPath(size);
    const { numbers, target } = generateSolutionNumbers(solutionPath.length, levelConfig);
    const solutionSet = new Set(solutionPath.map((pos) => `${pos.row},${pos.col}`));

    const lockedCount = levelConfig.features.locked ? Math.max(1, Math.floor(size / 2)) : 0;
    const lockedCells = new Set(pickRandomCells(size, lockedCount, solutionSet));

    const bonusCount = levelConfig.features.bonus ? Math.max(1, Math.floor(size / 2)) : 0;
    const excludedForBonus = new Set([...solutionSet, ...lockedCells]);
    const bonusCells = new Set(pickRandomCells(size, bonusCount, excludedForBonus));

    const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => createTile(0)));
    const { min, max } = valueBounds(levelConfig.features);

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const key = `${row},${col}`;
        if (solutionSet.has(key)) {
          const index = solutionPath.findIndex((pos) => pos.row === row && pos.col === col);
          grid[row][col] = createTile(numbers[index]);
          continue;
        }
        if (lockedCells.has(key)) {
          grid[row][col] = createTile(0, { locked: true });
          continue;
        }
        let value = randomInt(min, max);
        if (!levelConfig.features.negative && value < 0) {
          value = Math.abs(value);
        }
        const isBonus = bonusCells.has(key);
        grid[row][col] = createTile(value, { multiplier: isBonus ? 2 : 1 });
      }
    }

    if (validateSolution(grid, solutionPath, target)) {
      return { grid, target, solutionPath };
    }
  }
  throw new Error('Unable to generate valid puzzle');
}

function validateSolution(grid, path, target) {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    if (!isAdjacent(path[i - 1], path[i])) {
      return false;
    }
  }
  for (const pos of path) {
    const tile = grid[pos.row]?.[pos.col];
    if (!tile || tile.locked) {
      return false;
    }
    total += tile.value * (tile.multiplier || 1);
  }
  return total === target;
}
