// gameLogic.ts
import { Position, Daemon } from '../types';

export function isValidMove(position: Position, currentStep: 'row' | 'column', currentPosition: Position): boolean {
  if (currentStep === 'row') {
    return position.row === currentPosition.row;
  } else {
    return position.column === currentPosition.column;
  }
}

export function checkDaemons(userSequence: string[], daemons: Daemon[], resetGame: () => void): void {
  daemons.forEach(daemon => {
    if (userSequence.join(',') === daemon.sequence.join(',')) {
      alert(`Unlocked ${daemon.name}`);
      resetGame();
    }
  });
}
