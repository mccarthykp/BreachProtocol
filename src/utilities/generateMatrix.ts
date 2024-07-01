// utilities/generateMatrix.ts

/**
 * Generates a matrix of random codes based on the specified grid size.
 * @param {number} gridSize - The size of the grid (number of rows and columns) for the matrix.
 * @returns {string[][]} - A matrix containing randomly generated codes.
 */
export function generateMatrix(gridSize: number): string[][] {
  // Dynamically generate matrix with codes
  const matrix: string[][] = [];
  // Available codes
  const codes = ['1A', '1B', '1C', '1D', '1E', '1F', '1G', '1H', '3A', '3B', '3C', '3D', '3E', '3F', '3G', '3H', '5A', '5B', '5C', '5D', '5E', '5F', '5G', '5H', '7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H', '9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH', 'EA', 'EB', 'EC', 'ED', 'EE', 'EF', 'EG', 'EH'];

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

// Codes based on difficulty? /////////////////////////////////////////////////////////////////

// OG CODES : '1C', 'BD', '55', 'E9', '7A'

// ALT CODES : '1A', '1B', '1C', '1D', '1E','3A', '3B', '3C', '3D', '3E', '5A', '5B', '5C', '5D', '5E','6A', '6B', '6C', '6D', '6E', '7A', '7B', '7C', '7D', '7E', 'AA', 'AB', 'AC', 'AD', 'AE', 'BA', 'BB', 'BC', 'BD', 'BE', 'CA', 'CB', 'CC', 'CD', 'CE', 'DA', 'DB', 'DC', 'DD', 'DE', 'EA', 'EB', 'EC', 'ED', 'EE', '11', '12', '13', '14', '15', '21', '22', '23', '24', '25', '31', '32', '33', '34', '35', '41', '42', '43', '44', '45', '51', '52', '53', '54', '55'

// NO NUMS CODES : '1A', '1B', '1C', '1D', '1E', '1F', '1G', '1H', '3A', '3B', '3C', '3D', '3E', '3F', '3G', '3H', '5A', '5B', '5C', '5D', '5E' '5F', '5G', '5H', '7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H', '9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH', 'EA', 'EB', 'EC', 'ED', 'EE', 'EF', 'EG', 'EH'
