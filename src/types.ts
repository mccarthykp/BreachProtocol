// types.ts
export interface Position {
  row: number;
  column: number;
}

export interface Daemon {
  id: number;
  name: string;
  sequence: string[];
  isSolved: boolean;
}

export interface HighlightedDaemonIndex {
  daemonId: number;
  sequenceIndex: number;
}
