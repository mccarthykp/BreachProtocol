// BreachProtocolQuickhack.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { generateMatrixSequence } from '../utilities/generateMatrix';
import { generateDaemons } from '../utilities/generateDaemons';
import { validateSequence } from '../utilities/validateSequence';
import { uploadDaemons } from '../utilities/uploadDaemons';
import { Daemon } from '../types';

const BreachProtocolQuickhack: React.FC = () => {
  const gridSize = 5; // 5x5 grid
  const bufferSize = 6; // Default buffer size

  const [matrix, setMatrix] = useState<string[][]>([]);
  const [buffer, setBuffer] = useState<string[]>([]);
  const [daemons, setDaemons] = useState<Daemon[]>([]);
  const [feedback, setFeedback] = useState<string>('SELECT A CODE FROM THE FIRST ROW');
  const [hoveredCell, setHoveredCell] = useState<{ row: number, column: number } | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ row: 0, column: 0 }); 
  const [currentStep, setCurrentStep] = useState('row');

  useEffect(() => {
    setMatrix(generateMatrixSequence(gridSize));
    const daemonsData: Daemon[] = generateDaemons();
    // Set daemons state with array of Daemon objects
    setDaemons(daemonsData);

    setCurrentStep('row');
    // setCurrentPosition({ row: 0, column: 0 }); 
  }, [gridSize]);

  const resetGame = useCallback(() => {
    setBuffer([]);
    setFeedback('Select a code from the first row');
  }, []);

  const handleCellClick = useCallback((row: number, column: number) => {
    console.log('Clicked Cell:', { row, column });
    console.log('Current Position:', currentPosition);
    console.log('Current Step:', currentStep);

    if (buffer.length >= bufferSize) {
      // Buffer is full, do not allow further selection
      setFeedback('://BUFFER IS FULL. UPLOAD DAEMONS TO CONTINUE');
      return;
    }

    if (
      (currentStep === 'row' && currentPosition.column === column) ||
      (currentStep === 'column' && currentPosition.row === row)
    ) {
      const selectedCharacter = matrix[row][column];

      setBuffer(prevBuffer => {
        const newBuffer = [...prevBuffer, selectedCharacter];
        if (newBuffer.length === bufferSize) {
          setFeedback('// BUFFER IS FULL. UPLOAD DAEMONS TO CONTINUE');
        } else {
          setFeedback('// BREACH PROTOCOL IN PROCESS . .');
        }
        return newBuffer;
      });

      setCurrentPosition({ row, column });
      setCurrentStep(currentStep === 'column' ? 'row' : 'column');
    } else {
      setFeedback('INVALID SELECTION');
    }
  }, [currentPosition, currentStep, buffer.length, matrix]);

  const uploadSelectedDaemons = useCallback(() => {
    if (buffer.length === 0) {
      setFeedback('BUFFER IS EMPTY. SELECT CHARACTERS TO UPLOAD DAEMONS.');
      return;
    }
  
    if (!validateSequence(buffer, bufferSize)) {
      setFeedback('INVALID BUFFER SIZE. SELECT CHARACTERS TO UPLOAD DAEMONS.');
      return;
    }
  
    const uploadedDaemons = uploadDaemons(buffer, daemons); // Assuming uploadDaemons returns an array of uploaded Daemon objects
    const uploadedDaemonNames = uploadedDaemons.map(daemon => daemon.name); // Extract Daemon names
    const remainingDaemons = daemons.filter(daemon => !uploadedDaemons.includes(daemon)); // Filter out uploaded Daemons
    setDaemons(remainingDaemons); // Update daemons state with remaining Daemons
    setFeedback(`Uploaded Daemons: ${uploadedDaemonNames.join(', ')}.`);
    resetGame();
  }, [buffer, bufferSize, daemons, resetGame]);

  const handleMouseEnter = (row: number, column: number) => {
    // Only apply hover effect if it matches the current selection step
    if (
      (currentStep === 'row' && currentPosition.row === row) || // If hovering a row during row selection
      (currentStep === 'column' && currentPosition.column === column) // If hovering a column during column selection
    ) {
      setHoveredCell({ row, column });
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredCell(null); // Reset the hoveredCell
  };

  return (
    <>
      <section className='flex flex-col min-h-screen bg-neutral-950 select-none'>
        {/* ///////////////////////////////////////////////////////////////////////////// */}
        <div className='mt-80'>
          <h2 className={`font-orbitron tracking-wide text-2xl text-lime-200 text-center w-60 mx-auto p-4
            ${buffer.length === bufferSize ? 'text-red-600' : ''}`}>
              Buffer : {bufferSize - buffer.length}
          </h2>

          <div className='relative h-20 w-full'>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex">
              {Array.from({ length: bufferSize }).map((_, index) => (
                <div
                  key={index}
                  className={`outline outline-2 outline-cyan-500 shadow-lg shadow-cyan-950 rounded-md px-4 py-4 m-2 text-cyan-400 w-16 h-16 flex justify-center items-center ${
                    buffer[index] ? '' : 'opacity-20 shadow-none'
                  }`}
                >
                  {buffer[index] || ''}
                </div>
              ))}
            </div>
          </div>

          <p 
            className={`w-full text-center font-rajdhani font-thin text-white p-4
              ${buffer.length === bufferSize ? 'text-red-600' : ''}`}
            >
              {feedback}
          </p>
        </div>
        {/* ///////////////////////////////////////////////////////////////////////////// */}
        <div className='text-center font-rajdhani font-medium tracking-widest text-2xl mx-auto outline outline-1 outline-lime-200 rounded-sm bg-neutral-950 p-4'>
          {matrix.map((row, rowIndex) => (
            <div key={rowIndex} className='flex'>
              {row.map((code, columnIndex) => (
                <div 
                  className='text-lime-200'
                  key={columnIndex}>
                  <span

                    className={`flex text-lime-200 cursor-pointer hover:text-cyan-300 hover:outline hover:outline-1 hover:outline-cyan-300 hover:shadow-lg hover:shadow-cyan-950 justify-evenly items-center w-16 h-16

                      ${currentStep === 'row' && currentPosition.row === rowIndex ? 'bg-gray-800 bg-opacity-35' : ''}
                      ${currentStep === 'column' && currentPosition.column === columnIndex ? 'bg-gray-800 bg-opacity-35' : ''}
                      ${currentStep === 'row' && hoveredCell && hoveredCell.column === columnIndex ? 'bg-lime-300 bg-opacity-5' : ''}
                      ${currentStep === 'column' && hoveredCell && hoveredCell.row === rowIndex ? 'bg-lime-300 bg-opacity-5' : ''}
                      
                    `}

                    onClick={() => handleCellClick(rowIndex, columnIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, columnIndex)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div>
                      {code}
                    </div>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* ///////////////////////////////////////////////////////////////////////////// */}
        <div className='w-full'>
          <div className='flex-col text-white'>
            <h2 className='text-2xl p-4 font-orbitron tracking-wide text-center w-fit mx-auto'>DAEMONS</h2>
            <div className='w-fit mx-auto my-2'>
              {daemons.map((daemon, index) => (
                <div key={index} className='flex font-rajdhani'>
                  <p className='text-lg w-32 tracking-widest pr-5'>
                    {[...daemon.sequence].join(' ')}
                  </p>
                  <div className='text-left w-32 tracking-wide pl-5'>
                    <h3 className='text-lg'>{daemon.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='flex flex-col'>
            <button
              className='rounded-md bg-red-900 text-sm font-orbitron font-bold py-3 px-6 min-w-fit max-w-fit self-center mt-6 hover:bg-red-950 transition-colors duration-300 tracking-wide'
              onClick={uploadSelectedDaemons}
            >
                UPLOAD DAEMONS
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default BreachProtocolQuickhack;
