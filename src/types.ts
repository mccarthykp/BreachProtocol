// types.ts

export interface GameState {
  matrix: string[][];
  daemons: Daemon[];
  bufferCodes: string[];
  bufferFeedback: string;
  highlightedDaemonIndices: { daemonId: number; sequenceIndex: number }[];
  currentStep: 'row' | 'column';
  currentPosition: Position;
  highlightedCells: { row: number; column: number }[];
  installedDaemonNames: string;
}

export type GameAction = 
  | { type: 'reset'; payload: GameState }
  | { type: 'updateBufferCodes'; payload: GameState }
  | { type: 'installVerifiedDaemons'; payload: GameState };

export interface Daemon {
  id: number;
  name: string;
  sequence: string[];
  isSolved: boolean;
}

export interface Position {
  row: number;
  column: number;
}

export interface HighlightedDaemonIndex {
  daemonId: number;
  sequenceIndex: number;
}
