// utilities/verifyDaemons.ts

import { Daemon } from '../types';

/**
 * Verifies if Daemons are present in the buffer by checking if their sequences exist within it.
 * @param {string[]} buffer - The buffer containing the current sequence of selected codes.
 * @param {Daemon[]} daemons - The array of Daemons to verify against the buffer.
 * @returns {Daemon[]} - An array containing the Daemons verified to be present in the buffer.
 */
export function verifyDaemons(buffer: string[], daemons: Daemon[]): Daemon[] {
  const verifiedDaemons: Daemon[] = [];

  /**
   * Checks if two arrays are equal.
   * @param {string[]} arr1 - The first array.
   * @param {string[]} arr2 - The second array.
   * @returns {boolean} - True if the arrays are equal, false otherwise.
   */
  function arraysEqual(arr1: string[], arr2: string[]): boolean {
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  /**
   * Checks if a Daemon sequence exists within the buffer.
   * @param {string[]} buffer - The buffer to search in.
   * @param {string[]} daemonSequence - The Daemon sequence to search for.
   * @returns {boolean} - True if the Daemon sequence exists within the buffer, false otherwise.
   */
  function isDaemonSequenceInBuffer(buffer: string[], daemonSequence: string[]): boolean {
    const subarrayLength = daemonSequence.length;
    const bufferLength = buffer.length;

    // Buffer length will always be greater than Daemon sequences
    for (let i = 0; i <= bufferLength - subarrayLength; i++) {
      const window = buffer.slice(i, i + subarrayLength);
      if (arraysEqual(window, daemonSequence)) {
        return true;
      }
    }
    return false;
  }

  for (const daemon of daemons) {
    if (isDaemonSequenceInBuffer(buffer, daemon.sequence)) {
      verifiedDaemons.push(daemon);
    }
  }
  return verifiedDaemons;
}
