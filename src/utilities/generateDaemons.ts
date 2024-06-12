// utilities/generateDaemons.ts

/**
 * Generates Daemons with random sequences based on specified buffer length and daemon count.
 * @param {number} bufferLength - The length of the buffer used to generate Daemons.
 * @param {number} daemonCount - The number of Daemons to generate.
 * @returns {{ id: number, name: string, sequence: string[], isSolved: boolean }[]} An array of generated Daemons.
 * @throws {Error} - If the buffer length is less than 4, as it must be at least 4 to generate valid Daemon sequences.
 */
export function generateDaemons(bufferLength: number, daemonCount: number): { id: number, name: string, sequence: string[], isSolved: boolean }[] {
  // Ensure buffer is sufficient to generate daemons with valid lengths
  if (bufferLength < 4) {
    throw new Error('Buffer length must be at least 4 to generate valid daemon sequences.');
  }

  // Generate Daemons with random sequences
  const daemons: { id: number, name: string, sequence: string[], isSolved: boolean }[] = [];

  for (let i = 0; i < daemonCount; i++) {
    const id: number = i + 1;
    const name: string = `DATAMINE_V${i + 1}`;
    // Random length between 2 and bufferLength - 2
    const daemonLength = Math.floor(Math.random() * (bufferLength - 3)) + 2;
    const sequence: string[] = [];
    for (let j = 0; j < daemonLength; j++) {
      const randomIndex = Math.floor(Math.random() * 5); // Random index for codes array
      sequence.push(['1C', 'BD', '55', 'E9', '7A'][randomIndex]);
    }
    // Daemon is unsolved by default
    const isSolved: boolean = false;
    daemons.push({ id, name, sequence, isSolved });
  }

  return daemons;
}
