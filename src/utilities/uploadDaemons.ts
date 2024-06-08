import { Daemon } from '../types';

export function uploadDaemons(buffer: string[], daemons: Daemon[]): Daemon[] {
  // Check if any of the Daemons' sequences match the buffer sequence
  const uploadedDaemons: Daemon[] = [];
  for (const daemon of daemons) {
    // Ensure daemon.sequence is an array before joining
    if (Array.isArray(daemon.sequence)) {
      const daemonSequence = daemon.sequence.join(''); // Convert Daemon sequence to string
      const bufferString = buffer.join(''); // Convert buffer array to string
      if (bufferString.includes(daemonSequence)) {
        uploadedDaemons.push(daemon);
      }
    }
  }
  return uploadedDaemons;
}
