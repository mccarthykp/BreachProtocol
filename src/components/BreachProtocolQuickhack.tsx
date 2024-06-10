// BreachProtocolQuickhack.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateMatrix } from '../utilities/generateMatrix';
import { generateDaemons } from '../utilities/generateDaemons';
import { verifyDaemons } from '../utilities/verifyDaemons';
import { Daemon } from '../types';

///////////////////////////////////////////////////////////////////////////////
const BreachProtocolQuickhack: React.FC = () => {
  const gridSize = 5; // nxn grid
  const bufferSize = 6; // Default buffer size
  const daemonCount = 3; // Number of Daemons
  const [matrix, setMatrix] = useState<string[][]>([]);
  const [daemons, setDaemons] = useState<Daemon[]>([]);

  const [bufferValues, setBufferValues] = useState<string[]>([]);
  const [bufferFeedback, setBufferFeedback] = useState('// SELECT A CODE FROM THE FIRST ROW');

  const uploadedDaemonNamesRef = useRef('');
  const [uploadedDaemonNames, setUploadedDaemonNames] = useState('');

  ///////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    setMatrix(generateMatrix(gridSize));
    setDaemons(generateDaemons(bufferSize, daemonCount));
  }, [bufferSize, daemonCount, gridSize]);

  ///////////////////////////////////////////////////////////////////////////////
  const resetGame = useCallback(() => {
    // Generate a new matrix
    setMatrix(generateMatrix(gridSize));
    // Generate new Daemons
    setDaemons(generateDaemons(bufferSize, daemonCount));
    
    setBufferValues([]);
    setBufferFeedback('// SELECT A CODE FROM THE FIRST ROW');
    // Reset ref value
    uploadedDaemonNamesRef.current = '';
    setUploadedDaemonNames('');
  }, [gridSize, bufferSize, daemonCount]);

  ///////////////////////////////////////////////////////////////////////////////
  const handleCellClick = useCallback((row: number, column: number) => {
    console.log('Clicked Cell:', { row, column });

    // If Daemons have already been uploaded, game ends
    // if (uploadedDaemonNames) {
    //   setBufferFeedback('// UPLOAD COMPLETE');
    //   setUploadedDaemonNames(uploadedDaemonNames);
    //   return;
    // }

    // If buffer is full, game ends
    if (bufferValues.length >= bufferSize) {
      setBufferFeedback('// BUFFER IS FULL');
      return;
      // If buffer is not full, add selected code to buffer
    } else {

      const selectedCharacter = matrix[row][column];

      setBufferValues(prevBufferValues => {
        const newBufferValues = [...prevBufferValues, selectedCharacter];
        if (newBufferValues.length === bufferSize) {
          setBufferFeedback('// BUFFER IS FULL');
        } else {
          setBufferFeedback('// BREACH PROTOCOL IN PROCESS . .');
        }
        return newBufferValues;
      });
    }
  }, [bufferValues.length, matrix]);

  ///////////////////////////////////////////////////////////////////////////////
  const uploadVerifiedDaemons = useCallback(() => {
    // If buffer is empty, do nothing
    if (bufferValues.length === 0) {
      setBufferFeedback('// BUFFER IS EMPTY, SELECT CODES TO UPLOAD DAEMONS');
      return;
    }

    // verifyDaemons returns an array of solved Daemon objects
    const verifiedDaemons = verifyDaemons(bufferValues, daemons);

    if (verifiedDaemons.length === 0 && uploadedDaemonNamesRef.current === '') {
      setBufferFeedback('// UPLOAD DENIED, NO DAEMONS SOLVED');
      return;
    }

    // If user hasn't solved another Daemon, deny upload
    if (verifiedDaemons.length === 0 && uploadedDaemonNamesRef.current !== '') {
      setBufferFeedback('// UPLOAD DENIED, NO ADDITIONAL DAEMONS SOLVED');
      return;
    }
    
    // Extract Daemon names
    const newUploadedDaemonNames = verifiedDaemons.map(daemon => daemon.name).join(', ');
    // Update the ref with new names
    uploadedDaemonNamesRef.current += (uploadedDaemonNamesRef.current ? ', ' : '') + newUploadedDaemonNames;
    // Filter out uploaded daemons from the remaining daemons
    const remainingDaemons = daemons.filter(daemon => !verifiedDaemons.includes(daemon));
    // Update daemons state with remaining daemons
    setDaemons(remainingDaemons);

    setBufferFeedback('// UPLOAD COMPLETE');
    setUploadedDaemonNames(`UPLOADED DAEMONS: ${uploadedDaemonNamesRef.current}`);

  }, [bufferValues, daemons]);

  ///////////////////////////////////////////////////////////////////////////////
  return (
    <>
      {/* ///////////////////////////////////////////////////////////////////////////// */}
      <section className='flex flex-col min-h-screen bg-neutral-950 select-none'>
        {/* ///////////////////////////////////////////////////////////////////////////// */}
        <div className='mt-80'>
          <h2 className={`font-orbitron tracking-wide text-2xl text-lime-200 text-center w-60 mx-auto p-4
            ${bufferValues.length === bufferSize ? 'text-red-600' : ''}`}>
              Buffer : {bufferSize - bufferValues.length}
          </h2>

          <div className='relative h-20 w-full'>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex">
              {Array.from({ length: bufferSize }).map((_, index) => (
                <div
                  key={index}
                  className={`outline outline-2 outline-cyan-500 shadow-lg shadow-cyan-950 rounded-md px-4 py-4 m-2 text-cyan-400 w-16 h-16 flex justify-center items-center ${
                    bufferValues[index] ? '' : 'opacity-20 shadow-none'
                  }`}
                >
                  {bufferValues[index] || ''}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* ///////////////////////////////////////////////////////////////////////////// */}
        <div 
          className='w-94 flex-col pt-4 font-rajdhani font-thin text-xxs text-lime-100 mx-auto'>
            <p className={`tracking-widest 
              ${uploadedDaemonNames ? 'text-lime-100' : 'text-neutral-500'}`}
            >
              {uploadedDaemonNames || 'UPLOADED DAEMONS : '}
            </p>
            <p className={`tracking-wide pb-1
              ${bufferValues.length >= bufferSize && bufferFeedback !== '// UPLOAD COMPLETE' ? 'text-red-600' : ''}
              ${bufferFeedback === '// UPLOAD DENIED, NO DAEMONS SOLVED' ? 'text-red-600' : ''}`}
            >
              {bufferFeedback}
            </p>
        </div>
        <div className='text-center font-rajdhani font-medium tracking-widest text-2xl mx-auto outline outline-1 outline-lime-200 rounded-sm bg-neutral-950 p-4'>
          {matrix.map((row, rowIndex) => (
            <div key={rowIndex} className='flex'>
              {row.map((code, columnIndex) => (
                <div 
                  className='text-lime-200'
                  key={columnIndex}>
                  <span

                    className={`flex text-lime-200 cursor-pointer hover:text-cyan-300 hover:outline hover:outline-1 hover:outline-cyan-300 hover:shadow-lg hover:shadow-cyan-950 justify-evenly items-center w-16 h-16
                    `}

                    onClick={() => handleCellClick(rowIndex, columnIndex)}
                    // onMouseEnter={() => handleMouseEnter(rowIndex, columnIndex)}
                    // onMouseLeave={handleMouseLeave}
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
          {/* ///////////////////////////////////////////////////////////////////////////// */}
          <div className='flex-col text-white h-44'>
            <h2 className='text-2xl p-4 font-orbitron tracking-wide text-center w-fit mx-auto'>DAEMONS</h2>
            <div className='w-fit mx-auto my-2'>
              {daemons.map((daemon, index) => (
                <div key={index} 
                  className='flex font-rajdhani text-neutral-300'>
                  <p className='text-lg w-40 tracking-widest pr-5'>
                    {[...daemon.sequence].join(' ')}
                  </p>
                  <div className='text-left w-30 tracking-wide pl-5'>
                    <h3 className='text-lg'>{daemon.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ///////////////////////////////////////////////////////////////////////////// */}
          <div className='flex flex-col'>
            <button
              className='rounded-md bg-red-900 text-sm font-orbitron font-bold py-3 px-6 min-w-fit max-w-fit self-center mt-4 hover:bg-red-950 transition-colors duration-200 tracking-wide'
              onClick={uploadVerifiedDaemons}
            >
                UPLOAD DAEMONS
            </button>
            <button
              className='rounded-md outline outline-neutral-800 text-sm text-neutral-700 font-orbitron font-bold py-3 px-6 min-w-fit max-w-fit self-center mt-6 hover:outline-neutral-700 hover:text-neutral-500 transition-all duration-200 tracking-wide'
              onClick={resetGame}
            >
                RESET GAME
            </button>
          </div>
          {/* ///////////////////////////////////////////////////////////////////////////// */}
        </div>
        {/* ///////////////////////////////////////////////////////////////////////////// */}
      </section>
    </>
  );
};

export default BreachProtocolQuickhack;
