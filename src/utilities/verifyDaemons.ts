// // verifyDaemons.ts
import { Daemon } from '../types';

export function verifyDaemons(buffer: string[], daemons: Daemon[]): Daemon[] {
  const verifiedDaemons: Daemon[] = [];

  // Check if arrays are equal
  function arraysEqual(arr1: string[], arr2: string[]): boolean {
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  // Check if a subarray exists within the buffer
  function isSubarray(buffer: string[], subarray: string[]): boolean {
    const subarrayLength = subarray.length;
    const bufferLength = buffer.length;

    // BufferLength is always greater than daemon.sequence
    for (let i = 0; i <= bufferLength - subarrayLength; i++) {
      const window = buffer.slice(i, i + subarrayLength);
      if (arraysEqual(window, subarray)) {
        return true;
      }
    }
    return false;
  }

  for (const daemon of daemons) {
    if (isSubarray(buffer, daemon.sequence)) {
      verifiedDaemons.push(daemon);
    }
  }
  return verifiedDaemons;
}
