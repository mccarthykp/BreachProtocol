// utilities/generateDaemons.ts

/**
 * Checks if a sequence can be found in the given matrix based on the game's rules.
 * At least one Daemon sequence should be solvable from the first row.
 * @param {string[][]} matrix - The matrix of codes.
 * @param {string[]} sequence - The sequence to check.
 * @param {number} bufferSize - The buffer size.
 * @returns {boolean} - True if the sequence can be found in the matrix within the buffer size, false otherwise.
 */
export function canSolveSequence(matrix: string[][], sequence: string[], bufferSize: number): boolean {
  const gridSize = matrix.length;

  // Check starting positions in the first row first
  for (let startCol = 0; startCol < gridSize; startCol++) {
    if (findSequence(matrix, sequence, bufferSize, 0, startCol, 'row')) {
      return true;
    }
  }

  // Check other starting positions in the matrix
  for (let startRow = 1; startRow < gridSize; startRow++) {
    for (let startCol = 0; startCol < gridSize; startCol++) {
      if (findSequence(matrix, sequence, bufferSize, startRow, startCol, 'row') ||
          findSequence(matrix, sequence, bufferSize, startRow, startCol, 'column')) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Generates Daemons with random sequences based on specified buffer length and daemon count.
 * All Daemon sequences should be able to start from the first row,
 * and at least one Daemon sequence should be solvable from the first row.
 * Sequences are generated considering the actual code values in the matrix.
 * Each code in a sequence is selected uniquely from its position in the matrix.
 * @param {string[][]} matrix - The matrix of codes.
 * @param {number} bufferLength - The length of the buffer used to generate Daemons.
 * @param {number} daemonCount - The number of Daemons to generate.
 * @returns {{ id: number, name: string, sequence: string[], isSolved: boolean }[]} An array of generated Daemons.
 * @throws {Error} - If the buffer length is less than 4, as it must be at least 4 to generate valid Daemon sequences.
 */
export function generateDaemons(matrix: string[][], bufferLength: number, daemonCount: number): { id: number, name: string, sequence: string[], isSolved: boolean }[] {
  // Ensure buffer is sufficient to generate daemons with valid lengths
  if (bufferLength < 4) {
    throw new Error('Buffer length must be at least 4 to generate valid daemon sequences.');
  }

  // Generate Daemons with valid sequences
  const daemons: { id: number, name: string, sequence: string[], isSolved: boolean }[] = [];

  const generatedSequences = new Set<string>();
  let firstRowSolvableDaemonGenerated = false;

  while (daemons.length < daemonCount) {
    const id: number = daemons.length + 1;
    const name: string = `DATAMINE_V${id}`;
    const daemonLength = Math.floor(Math.random() * (bufferLength - 3)) + 2;
    let sequence: string[];
    let sequenceStr: string;

    // Generate a unique sequence that is solvable from the first row
    do {
      sequence = [];
      const selectedPositions = new Set<number>(); // Track selected positions to ensure uniqueness
      for (let i = 0; i < daemonLength; i++) {
        let randomRow: number, randomCol: number;
        do {
          randomRow = Math.floor(Math.random() * matrix.length);
          randomCol = Math.floor(Math.random() * matrix[0].length);
        } while (selectedPositions.has(randomCol * matrix.length + randomRow)); // Ensure uniqueness based on position index
        selectedPositions.add(randomCol * matrix.length + randomRow);
        sequence.push(matrix[randomRow][randomCol]);
      }
      sequenceStr = sequence.join('-');
    } while (generatedSequences.has(sequenceStr));

    // Check if this sequence can be started from the first row
    let canStartFromFirstRow = false;
    for (let startCol = 0; startCol < matrix[0].length; startCol++) {
      if (findSequence(matrix, sequence, bufferLength, 0, startCol, 'row')) {
        canStartFromFirstRow = true;
        if (!firstRowSolvableDaemonGenerated && canSolveSequence(matrix, sequence, bufferLength)) {
          firstRowSolvableDaemonGenerated = true;
        }
        break;
      }
    }

    // If the sequence can't start from the first row, log an error and continue
    if (!canStartFromFirstRow) {
      console.error(`Sequence ${sequenceStr} cannot start from the first row.`);
      continue;
    }

    generatedSequences.add(sequenceStr);

    // Daemon is unsolved by default
    const isSolved: boolean = false;
    daemons.push({ id, name, sequence, isSolved });
  }

  // Ensure at least one Daemon is solvable from the first row
  if (!firstRowSolvableDaemonGenerated) {
    let sequence: string[];
    let sequenceStr: string;
    let solvableFromFirstRow = false;

    do {
      const id: number = daemons.length + 1;
      const name: string = `DATAMINE_V${id}`;
      const daemonLength = Math.floor(Math.random() * (bufferLength - 3)) + 2;

      do {
        sequence = [];
        const selectedPositions = new Set<number>(); // Track selected positions to ensure uniqueness
        for (let i = 0; i < daemonLength; i++) {
          let randomRow: number, randomCol: number;
          do {
            randomRow = Math.floor(Math.random() * matrix.length);
            randomCol = Math.floor(Math.random() * matrix[0].length);
          } while (selectedPositions.has(randomCol * matrix.length + randomRow)); // Ensure uniqueness based on position index
          selectedPositions.add(randomCol * matrix.length + randomRow);
          sequence.push(matrix[randomRow][randomCol]);
        }
        sequenceStr = sequence.join('-');
      } while (generatedSequences.has(sequenceStr));

      for (let startCol = 0; startCol < matrix[0].length; startCol++) {
        if (findSequence(matrix, sequence, bufferLength, 0, startCol, 'row')) {
          if (canSolveSequence(matrix, sequence, bufferLength)) {
            solvableFromFirstRow = true;
            firstRowSolvableDaemonGenerated = true;
            daemons.push({ id, name, sequence, isSolved: false });
          }
          break;
        }
      }
    } while (!solvableFromFirstRow);
  }

  return daemons;
}

/**
 * Finds a sequence in the matrix starting from a given position and direction.
 * @param {string[][]} matrix - The matrix of codes.
 * @param {string[]} sequence - The sequence to find.
 * @param {number} bufferSize - The buffer size.
 * @param {number} startRow - The starting row index.
 * @param {number} startCol - The starting column index.
 * @param {('row' | 'column')} direction - The direction ('row' or 'column') to search.
 * @returns {boolean} - True if the sequence is found, false otherwise.
 */
function findSequence(matrix: string[][], sequence: string[], bufferSize: number, startRow: number, startCol: number, direction: 'row' | 'column'): boolean {
  let currentStep = direction;
  let sequenceIndex = 0;
  let bufferUsed = 0;
  let currentRow = startRow;
  let currentCol = startCol;

  while (sequenceIndex < sequence.length && bufferUsed < bufferSize) {
    if (matrix[currentRow][currentCol] === sequence[sequenceIndex]) {
      sequenceIndex++;
      currentStep = currentStep === 'row' ? 'column' : 'row'; // Switch direction
    }
    if (sequenceIndex === sequence.length) return true; // Sequence complete

    bufferUsed++;
    if (currentStep === 'row') {
      currentRow++;
      if (currentRow >= matrix.length) return false; // Out of bounds
    } else {
      currentCol++;
      if (currentCol >= matrix[0].length) return false; // Out of bounds
    }
  }
  return false;
}