// utilities/quickhackLogic.ts

import { Position } from '../types';

/**
 * Checks if a move to a given position in the matrix is valid based on the current step (row or column), the current position, and the matrix code.
 * @param {Position} position - The position to check the validity of the move.
 * @param {'row' | 'column'} currentStep - The current step of the game, either 'row' or 'column'.
 * @param {Position} currentPosition - The current position in the grid.
 * @param {string[][]} matrix - The current state of the matrix.
 * @returns {boolean} - True if the move is valid, false otherwise.
 */
export function isValidSelection(position: Position, currentStep: 'row' | 'column', currentPosition: Position, matrix: string[][]): boolean {
  // Check if the cell contains the string '[  ]'
  if (matrix[position.row][position.column] === '[ ]') {
    return false;
  }

  if (currentStep === 'row') {
    return position.row === currentPosition.row;
  } else {
    return position.column === currentPosition.column;
  }
}
