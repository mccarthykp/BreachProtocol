// generateDaemons.ts
export function generateDaemons(): { name: string, sequence: string[] }[] {
  // Generate Daemons with random sequences
  const daemons: { name: string, sequence: string[] }[] = [];
  const daemonCount = 3; // Number of Daemons

  for (let i = 0; i < daemonCount; i++) {
    const daemonLength = Math.floor(Math.random() * 3) + 2; // Random length between 2 and 4
    const sequence: string[] = [];
    for (let j = 0; j < daemonLength; j++) {
      const randomIndex = Math.floor(Math.random() * 5); // Random index for codes array
      sequence.push(['1C', 'BD', '55', 'E9', '7A'][randomIndex]);
    }
    daemons.push({ name: `DATAMINE_V${i + 1}`, sequence });
  }

  return daemons;
}
