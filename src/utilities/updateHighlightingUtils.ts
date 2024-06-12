// utilities/updateHighlightedDaemonIndices.ts

import { Daemon, HighlightedDaemonIndex } from '../types';

///////////////////////////////////////////////////////////////////////////////
// export function updateMatrixHighlighting(
//   position, currentLine, nextLine): {
//   return;
// }












///////////////////////////////////////////////////////////////////////////////
/**
 * Update highlighted daemon indices based on new buffer codes.
 * @param newBufferCodes The new buffer codes to update with.
 * @param daemons The array of daemons to update.
 * @param highlightedDaemonIndices The array of highlighted daemon indices.
 * @returns The updated array of highlighted daemon indices.
 */
export function updateHighlightedDaemonIndices(newBufferCodes: string[], daemons: Daemon[], highlightedDaemonIndices: HighlightedDaemonIndex[]): HighlightedDaemonIndex[] {
  let newHighlightedDaemonIndices: HighlightedDaemonIndex[] = [...highlightedDaemonIndices];
  const selectedCodeIndex = newBufferCodes.length - 1;
  const selectedCode = newBufferCodes[selectedCodeIndex];

  daemons.forEach((daemon) => {
    const daemonId = daemon.id;

    // Check if the selected code matches the code of the first index of the Daemon sequence
    if (selectedCodeIndex === 0 && selectedCode === daemon.sequence[0]) {
      const isFirstIndexHighlighted = newHighlightedDaemonIndices.some(index =>
        index.daemonId === daemonId && index.sequenceIndex === 0
      );

      // If the code of the first index of the Daemon's sequence is not already highlighted, add it to the list of highlighted indices
      if (!isFirstIndexHighlighted) {
        newHighlightedDaemonIndices.push({ daemonId, sequenceIndex: 0 });
      }
    }

    // If the first code of the first index of the Daemon's sequence is already highlighted, then..
    // Find the first non-highlighted index in the Daemon sequence
    if (selectedCodeIndex > 0) {
      let firstNonHighlightedIndex = 1;
      let lastHighlightedIndex = 0;
      
      for (let i = 0; i < daemon.sequence.length; i++) {
        const isHighlighted = newHighlightedDaemonIndices.some(
          index => index.daemonId === daemonId && index.sequenceIndex === i
        );
        if (!isHighlighted) {
          firstNonHighlightedIndex = i;
          break;
        }
      }

      // Check if a Daemon's codes should be highlighted, cleared or stay highlighted
      // If the selected code and the code of the firstNonHighlightedIndex match, highlight the code of the firstNonHighlightedIndex in the Daemon's sequence
      if (firstNonHighlightedIndex !== -1 && selectedCode === daemon.sequence[firstNonHighlightedIndex]) {
        newHighlightedDaemonIndices.push({ daemonId, sequenceIndex: firstNonHighlightedIndex });
        lastHighlightedIndex = firstNonHighlightedIndex;
      } else {
        // If the selected code is not equal to the firstNonHighlighted code, and is equal to the previously highlighted code, this Daemon is still solvable
        if (firstNonHighlightedIndex !== -1 && daemon.sequence[firstNonHighlightedIndex - 1] === selectedCode) {
          return;
          // Un-highlight all indices for this Daemon if selected code doesn't match the next expected code
        } else { 
          newHighlightedDaemonIndices = newHighlightedDaemonIndices.filter(index => index.daemonId !== daemonId);
        }
      }
      // Mark daemon as solved if all codes are highlighted
      if (lastHighlightedIndex === daemon.sequence.length - 1) {
        daemon.isSolved = true;
      }
    }
  });

  return newHighlightedDaemonIndices;
}
///////////////////////////////////////////////////////////////////////////////
