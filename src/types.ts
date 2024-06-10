// types.ts
export interface Position {
  row: number;
  column: number;
}

export interface Daemon {
  id: number;
  name: string;
  sequence: string[];
}
