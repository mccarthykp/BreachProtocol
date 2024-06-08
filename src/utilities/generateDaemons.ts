// generateDaemons.ts
export function generateDaemons(bufferLength: number, daemonCount: number): { name: string, sequence: string[] }[] {
  // Ensure buffer is sufficient to generate daemons with valid lengths
  if (bufferLength < 4) {
    throw new Error('Buffer length must be at least 4 to generate valid daemon sequences.');
  }

  // Generate Daemons with random sequences
  const daemons: { name: string, sequence: string[] }[] = [];

  for (let i = 0; i < daemonCount; i++) {
    // Random length between 2 and bufferLength - 2
    const daemonLength = Math.floor(Math.random() * (bufferLength - 3)) + 2;
    const sequence: string[] = [];
    for (let j = 0; j < daemonLength; j++) {
      const randomIndex = Math.floor(Math.random() * 5); // Random index for codes array
      sequence.push(['1C', 'BD', '55', 'E9', '7A'][randomIndex]);
    }
    daemons.push({ name: `DATAMINE_V${i + 1}`, sequence });
  }

  return daemons;
}
