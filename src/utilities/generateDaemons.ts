// utilities/generateDaemons.ts

import { Position } from '../types';
import { isValidSelection } from './quickhackLogic';

/**
 * Generates Daemons with valid sequences based on the specified buffer length and daemon count.
 * @param {string[][]} matrix - The matrix of codes to validate against.
 * @param {number} bufferLength - The length of the buffer used to generate Daemons.
 * @param {number} daemonCount - The number of Daemons to generate.
 * @returns {{ id: number, name: string, sequence: string[], isSolved: boolean }[]} An array of generated Daemons.
 * @throws {Error} - If the buffer length is less than 4, as it must be at least 4 to generate valid daemon sequences.
 */
export function generateDaemons(matrix: string[][], bufferLength: number, daemonCount: number): { id: number, name: string, sequence: string[], isSolved: boolean }[] {
  // Ensure buffer is sufficient to generate daemons with valid lengths
  if (bufferLength < 4) {
    throw new Error('Buffer length must be at least 4 to generate valid daemon sequences.');
  }

  const daemons: { id: number, name: string, sequence: string[], isSolved: boolean }[] = [];

  // Helper function to generate a valid sequence
  const generateValidSequence = (startPos: Position, length: number): string[] | null => {
    const sequence: string[] = [];
    const usedPositions: Set<string> = new Set();
    let position = startPos;
    let currentStep: 'row' | 'column' = 'row';

    for (let i = 0; i < length; i++) {
      if (!isValidSelection(position, currentStep, position, matrix)) {
        return null;
      }

      const posKey = `${position.row},${position.column}`;
      if (usedPositions.has(posKey)) {
        return null;
      }
      usedPositions.add(posKey);
      sequence.push(matrix[position.row][position.column]);

      if (currentStep === 'row') {
        // Move to a random position in the same column in the next row
        const availableRows = matrix
          .map((_, rowIndex) => rowIndex)
          .filter(rowIndex => !usedPositions.has(`${rowIndex},${position.column}`));
        if (availableRows.length === 0) {
          return null;
        }
        const nextRow = availableRows[Math.floor(Math.random() * availableRows.length)];
        position = { row: nextRow, column: position.column };
        currentStep = 'column';
      } else {
        // Move to a random position in the same row in the next column
        const availableColumns = matrix[0]
          .map((_, columnIndex) => columnIndex)
          .filter(columnIndex => !usedPositions.has(`${position.row},${columnIndex}`));
        if (availableColumns.length === 0) {
          return null;
        }
        const nextColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
        position = { row: position.row, column: nextColumn };
        currentStep = 'row';
      }
    }

    return sequence;
  };

  // Generate the first Daemon starting from the first row and ensure it's solvable
  let firstDaemonSequence: string[] | null = null;
  const firstRow = 0;
  let daemonLength = Math.floor(Math.random() * (bufferLength - 3)) + 2;

  while (firstDaemonSequence === null) {
    const startColumn = Math.floor(Math.random() * matrix[0].length);
    firstDaemonSequence = generateValidSequence({ row: firstRow, column: startColumn }, daemonLength);

    if (firstDaemonSequence === null) {
      daemonLength = Math.floor(Math.random() * (bufferLength - 2)) + 2;
    }
  }

  daemons.push({ id: 1, name: `DATAMINE_V1`, sequence: firstDaemonSequence, isSolved: false });

  // Generate the remaining Daemons
  for (let i = 1; i < daemonCount; i++) {
    let sequence: string[] | null = null;

    while (sequence === null) {
      // Random length between 2 and bufferLength - 2
      daemonLength = Math.floor(Math.random() * (bufferLength - 3)) + 2;
      const startRow = Math.floor(Math.random() * matrix.length);
      const startColumn = Math.floor(Math.random() * matrix[0].length);

      sequence = generateValidSequence({ row: startRow, column: startColumn }, daemonLength);
    }

    daemons.push({ id: i + 1, name: `DATAMINE_V${i + 1}`, sequence, isSolved: false });
  }

  // Randomize the sequence names
  daemons.forEach(daemon => {
    const randomIndex = Math.floor(Math.random() * daemonCount);
    const tempName = daemon.name;
    daemon.name = daemons[randomIndex].name;
    daemons[randomIndex].name = tempName;
  });

  // Sorting daemons by name alphabetically
  daemons.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  return daemons;
}
