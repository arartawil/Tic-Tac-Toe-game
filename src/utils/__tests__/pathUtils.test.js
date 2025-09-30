import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePathSum, isAdjacent, isValidNextSelection } from '../pathUtils.js';

describe('path utils', () => {
  it('determines adjacency including diagonals', () => {
    assert.equal(isAdjacent({ row: 0, col: 0 }, { row: 0, col: 1 }), true);
    assert.equal(isAdjacent({ row: 0, col: 0 }, { row: 1, col: 1 }), true);
    assert.equal(isAdjacent({ row: 0, col: 0 }, { row: 2, col: 0 }), false);
    assert.equal(isAdjacent({ row: 0, col: 0 }, { row: 0, col: 0 }), false);
  });

  it('validates next selection against previous', () => {
    const last = { row: 2, col: 2 };
    assert.equal(isValidNextSelection(last, { row: 3, col: 3 }), true);
    assert.equal(isValidNextSelection(last, { row: 4, col: 2 }), false);
  });

  it('calculates running sum honoring multipliers and locked tiles', () => {
    const grid = [
      [
        { value: 2, multiplier: 1, locked: false },
        { value: -1, multiplier: 2, locked: false }
      ],
      [
        { value: 5, multiplier: 1, locked: true },
        { value: 3, multiplier: 1, locked: false }
      ]
    ];
    const path = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 }
    ];
    assert.equal(calculatePathSum(path, grid), 2 + -1 * 2 + 0 + 3);
  });
});
