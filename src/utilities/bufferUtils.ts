// utilities/bufferUtils.ts

/**
 * Checks if the buffer is full based on its current size and the specified buffer size.
 * @param {string[]} bufferCodes - The current codes in the buffer.
 * @param {number} bufferSize - The maximum size of the buffer.
 * @returns {boolean} - True if the buffer is full, false otherwise.
 */
export function isBufferFull(bufferCodes: string[], bufferSize: number): boolean {
  return bufferCodes.length >= bufferSize;
}

/**
 * Adds the selected code to the buffer if the buffer is not full.
 * @param {string[]} bufferCodes - The current codes in the buffer.
 * @param {string} selectedCode - The code to add to the buffer.
 * @returns {string[]} - The updated buffer codes after adding the selected code.
 */
export function addToBuffer(bufferCodes: string[], selectedCode: string): string[] {
  return [...bufferCodes, selectedCode];
}

/**
 * Updates the feedback based on whether the buffer is full or not.
 * @param {string[]} newBufferCodes - The new buffer codes.
 * @param {number} bufferSize - The maximum size of the buffer.
 * @returns {string} - The updated feedback message.
 */
export function updateBufferFeedback(newBufferCodes: string[], bufferSize: number): string {
  if (newBufferCodes.length === bufferSize) {
    return '// BUFFER IS FULL';
  } else {
    return '// BREACH PROTOCOL IN PROCESS';
  }
}
