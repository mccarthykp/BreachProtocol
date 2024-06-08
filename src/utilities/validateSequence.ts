export function validateSequence(sequence: string[], bufferSize: number): boolean {
  return sequence.length <= bufferSize;
}
