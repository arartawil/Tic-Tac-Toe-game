import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generatePuzzle } from '../generator.js';

const mockConfig = {
  gridSize: 4,
  targetRange: [8, 15],
  timeLimit: 90,
  requiredSolutions: 5,
  features: {
    negative: false,
    locked: true,
    bonus: true
  }
};

describe('generator', () => {
  it('creates a board with at least one valid path', () => {
    const { grid, target, solutionPath } = generatePuzzle(mockConfig);
    assert.ok(solutionPath.length > 0);
    const seen = new Set();
    let total = 0;
    solutionPath.forEach((pos, index) => {
      const key = `${pos.row},${pos.col}`;
      assert.equal(seen.has(key), false);
      seen.add(key);
      if (index > 0) {
        const prev = solutionPath[index - 1];
        const rowDiff = Math.abs(prev.row - pos.row);
        const colDiff = Math.abs(prev.col - pos.col);
        assert.ok(rowDiff <= 1 && colDiff <= 1);
      }
      const tile = grid[pos.row][pos.col];
      assert.equal(tile.locked, false);
      total += tile.value * (tile.multiplier || 1);
    });
    assert.equal(total, target);
  });

  it('respects locked tiles and bonus multipliers', () => {
    const { grid } = generatePuzzle(mockConfig);
    let lockedCount = 0;
    let bonusCount = 0;
    grid.forEach((row) => {
      row.forEach((tile) => {
        if (tile.locked) lockedCount += 1;
        if (!tile.locked && tile.multiplier > 1) bonusCount += 1;
      });
    });
    assert.ok(lockedCount > 0);
    assert.ok(bonusCount > 0);
  });
});
