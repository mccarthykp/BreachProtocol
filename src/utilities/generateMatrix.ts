// generateMatrix.ts
export function generateMatrixSequence(gridSize: number): string[][] {
  // Dynamically generate matrix with codes
  const matrix: string[][] = [];
  // Available codes
  const codes = ['1C', 'BD', '55', 'E9', '7A'];

  for (let row = 0; row < gridSize; row++) {
    const rowSequence: string[] = [];
    for (let column = 0; column < gridSize; column++) {
      const randomIndex = Math.floor(Math.random() * codes.length);
      rowSequence.push(codes[randomIndex]);
    }
    matrix.push(rowSequence);
  }

  return matrix;
}
