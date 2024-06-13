import React, { useState, useCallback, useEffect, useRef } from "react";
import { generateMatrix } from "../utilities/generateMatrix";
import { generateDaemons } from "../utilities/generateDaemons";
import { verifyDaemons } from "../utilities/verifyDaemons";
import {
  isBufferFull,
  addToBuffer,
  updateBufferFeedback,
} from "../utilities/bufferUtils";
import { updateHighlightedDaemonIndices } from "../utilities/updateHighlightingUtils";
import { isValidSelection } from '../utilities/quickhackLogic';
import { Daemon, Position } from "../types";

///////////////////////////////////////////////////////////////////////////////
const BreachProtocolQuickhack: React.FunctionComponent = () => {
  const gridSize = 5; // nxn grid
  const bufferSize = 6; // Default buffer size
  const daemonCount = 3; // Number of Daemons
  const [matrix, setMatrix] = useState<string[][]>([]);
  const [daemons, setDaemons] = useState<Daemon[]>([]);

  const [bufferCodes, setBufferCodes] = useState<string[]>([]);
  const [bufferFeedback, setBufferFeedback] = useState<string>(
    "// SELECT A CODE FROM THE FIRST ROW"
  );

  const uploadedDaemonNamesRef = useRef<string>("");
  const [uploadedDaemonNames, setUploadedDaemonNames] = useState<string>("");

  const [highlightedDaemonIndices, setHighlightedDaemonIndices] = useState<
    { daemonId: number; sequenceIndex: number }[]
  >([]);

  const [currentStep, setCurrentStep] = useState<'row' | 'column'>('row');
  const [currentPosition, setCurrentPosition] = useState<Position>({ row: 0, column: 0 });
  const [highlightedCells, setHighlightedCells] = useState<{ row: number, column: number }[]>([]);
  
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
    setBufferCodes([]);
    setBufferFeedback("// SELECT A CODE FROM THE FIRST ROW");
    uploadedDaemonNamesRef.current = "";
    setUploadedDaemonNames("");
    setCurrentStep('row');
    setCurrentPosition({row: 0, column: 0});
    // Clear all highlighted Daemon indices per Daemon.id
    setHighlightedDaemonIndices([]);
    // Reset highlighted matrix cells
    setHighlightedCells([]);
  }, [gridSize, bufferSize, daemonCount]);

  ///////////////////////////////////////////////////////////////////////////////
  const handleCellClick = useCallback(
    (row: number, column: number) => {
      // If the buffer is full, game ends
      if (isBufferFull(bufferCodes, bufferSize)) {
        setBufferFeedback("// BUFFER IS FULL");
        return;
      }

      if (isValidSelection({row, column}, currentStep, currentPosition) === true) {
        // Update current position
        setCurrentPosition({ row, column });
        // Toggle between 'row' and 'column' for currentStep
        setCurrentStep(prevStep => (prevStep === 'row' ? 'column' : 'row'));
        const selectedCode = matrix[row][column];

        const newBufferCodes = addToBuffer(bufferCodes, selectedCode);
        const newHighlightedDaemonIndices = updateHighlightedDaemonIndices(
          newBufferCodes,
          daemons,
          highlightedDaemonIndices
        );
        const feedback = updateBufferFeedback(newBufferCodes, bufferSize);

        // Add the selected code to the buffer
        setBufferCodes(newBufferCodes);
        // Highlight the appropriate indices based on the new buffer codes
        setHighlightedDaemonIndices(newHighlightedDaemonIndices);
        // Update the game feedback accordingly
        setBufferFeedback(feedback);
        // Highlight entire row or column based on currentStep
        if (currentStep === 'column') {
          // Highlight entire row of clicked cell
          const newHighlightedCells = Array.from({ length: matrix[row].length }, (_, col) => ({ row, column: col }));
          setHighlightedCells(newHighlightedCells);
        } else if (currentStep === 'row') {
          // Highlight entire column of clicked cell
          const newHighlightedCells = Array.from({ length: matrix.length }, (_, r) => ({ row: r, column }));
          setHighlightedCells(newHighlightedCells);
        }
        
      } else {
        if (bufferCodes.length === 0) {
          setBufferFeedback('// INVALID SELECTION. SELECT A CODE FROM THE FIRST ROW');
          return;
        }
        if (currentStep === 'row') {
          setBufferFeedback('// INVALID SELECTION. SELECT A CODE IN THE ACTIVE ROW');
        } else {
          setBufferFeedback('// INVALID SELECTION. SELECT A CODE IN THE ACTIVE COLUMN')
        }
      }
    },
    [bufferCodes, currentPosition, currentStep, daemons, highlightedDaemonIndices, matrix]
  );
  ///////////////////////////////////////////////////////////////////////////////
  const handleCellHover = useCallback(
    (position: Position) => {
      // Clear previous highlighted cells
      setHighlightedCells([]);
  
      if (currentStep === 'column') {
        // Highlight entire row of hovered cell
        for (let col = 0; col < matrix[position.row].length; col++) {
          setHighlightedCells(prevCells => [...prevCells, { row: position.row, column: col }]);
        }
      } else if (currentStep === 'row') {
        // Highlight entire column of hovered cell
        for (let row = 0; row < matrix.length; row++) {
          setHighlightedCells(prevCells => [...prevCells, { row: row, column: position.column }]);
        }
      }
    },
    [currentStep, matrix]
  );

  ///////////////////////////////////////////////////////////////////////////////
  const uploadVerifiedDaemons = useCallback(() => {
    // If buffer is empty, do nothing
    if (bufferCodes.length === 0) {
      setBufferFeedback("// BUFFER IS EMPTY, SELECT CODES TO UPLOAD DAEMONS");
      return;
    }

    // verifyDaemons returns an array of solved Daemon objects
    const verifiedDaemons = verifyDaemons(bufferCodes, daemons);

    if (verifiedDaemons.length === 0 && uploadedDaemonNamesRef.current === "") {
      setBufferFeedback("// UPLOAD DENIED, NO DAEMONS SOLVED");
      return;
    }

    // If the user hasn't solved another Daemon, deny upload
    if (verifiedDaemons.length === 0 && uploadedDaemonNamesRef.current !== "") {
      setBufferFeedback("// UPLOAD DENIED, NO ADDITIONAL DAEMONS SOLVED");
      return;
    }

    if (bufferCodes.length === bufferSize) {
      setHighlightedDaemonIndices([]);
    }

    // Extract Daemon names
    const newUploadedDaemonNames = verifiedDaemons
      .map((daemon) => daemon.name)
      .join(", ");
    // Update the ref with new names
    uploadedDaemonNamesRef.current +=
      (uploadedDaemonNamesRef.current ? ", " : "") + newUploadedDaemonNames;
    // Filter out uploaded Daemons from the remaining daemons
    const remainingDaemons = daemons.filter(
      (daemon) => !verifiedDaemons.includes(daemon)
    );
    // Update Daemon's state with remaining daemons
    setDaemons(remainingDaemons);
    setBufferFeedback("// UPLOAD COMPLETE");
    setUploadedDaemonNames(
      `// UPLOADED DAEMONS: ${uploadedDaemonNamesRef.current}`
    );
  }, [bufferCodes, daemons]);
  ///////////////////////////////////////////////////////////////////////////////
  return (
    <>
      <section className="flex flex-col min-h-screen bg-neutral-950 select-none">
        {/* ///////////////////////////////////////////////////////////////////////////// */}
        <div className="mt-80">
          <h2
            className={`font-orbitron tracking-wide text-2xl text-lime-200 text-center w-60 mx-auto p-4 ${
              bufferCodes.length === bufferSize ? "text-red-600" : ""
            }`}
          >
            Buffer : {bufferSize - bufferCodes.length}
          </h2>
          <div className="relative h-20 w-full">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex">
              {Array.from({ length: bufferSize }).map((_, index) => (
                <div
                  key={index}
                  className={`outline outline-2 outline-cyan-500 shadow-lg shadow-cyan-950 rounded-md px-4 py-4 m-2 text-cyan-400 w-16 h-16 flex justify-center items-center ${
                    bufferCodes[index] ? "" : "opacity-20 shadow-none"
                  }`}
                >
                  {bufferCodes[index] || ""}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* ///////////////////////////////////////////////////////////////////////////// */}
        <div className="w-94 flex-col pt-4 font-rajdhani font-thin text-xxs text-lime-100 mx-auto">
          <p
            className={`tracking-widest ${
              uploadedDaemonNames ? "text-lime-100" : "text-neutral-500"
            }`}
          >
            {uploadedDaemonNames || "// UPLOADED DAEMONS: "}
          </p>
          <p
            className={`tracking-wide pb-1 ${
              bufferCodes.length >= bufferSize &&
              bufferFeedback !== "// UPLOAD COMPLETE"
                ? "text-red-600"
                : ""
            } ${
              bufferFeedback === "// UPLOAD DENIED, NO DAEMONS SOLVED"
                ? "text-red-600"
                : ""
            }`}
          >
            {bufferFeedback}
          </p>
        </div>
        {/* ///////////////////////////////////////////////////////////////////////////// */}
        <div className="text-center font-rajdhani font-medium tracking-widest text-2xl mx-auto outline outline-1 outline-lime-200 rounded-sm bg-neutral-950 p-4">
        {matrix.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((code, columnIndex) => (
              <div className="text-lime-200" key={columnIndex}>
                <span
                  className={`flex text-lime-200 cursor-pointer hover:text-cyan-300 hover:outline hover:outline-1 hover:outline-cyan-300 hover:shadow-lg hover:shadow-cyan-950 justify-evenly items-center w-16 h-16 
                    ${highlightedCells.some(cell => cell.row === rowIndex && cell.column === columnIndex) ? 'bg-lime-300 bg-opacity-5' : ''}
                    ${rowIndex === currentPosition.row && currentStep === 'row' ? 'bg-slate-500 bg-opacity-5' : ''}
                    ${columnIndex === currentPosition.column && currentStep === 'column' ? 'bg-slate-500 bg-opacity-5' : ''}
                  `}
                  onClick={() => handleCellClick(rowIndex, columnIndex)}
                  onMouseEnter={() => handleCellHover({ row: rowIndex, column: columnIndex })}
                  onMouseMove={() => handleCellHover({ row: rowIndex, column: columnIndex })}
                  onMouseLeave={() => setHighlightedCells([])}
                >
                  <div>{code}</div>
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
        {/* ///////////////////////////////////////////////////////////////////////////// */}
        <div className="w-full">
          {/* ///////////////////////////////////////////////////////////////////////////// */}
          <div className="flex-col text-white h-24">
            <div className="w-fit mx-auto my-4">
              {daemons.map((daemon) => (
                <div
                  key={daemon.id}
                  className={`flex font-rajdhani text-neutral-300 px-4 my-1
                    ${
                      daemon.isSolved
                        ? "bg-lime-300 font-extrabold rounded-md"
                        : ""
                    }
                  `}
                >
                  <p className="text-lg w-40 tracking-widest pr-5">
                    {daemon.sequence.map((char, seqIndex) => (
                      <span
                        key={seqIndex}
                        className={`pr-1
                          ${
                            highlightedDaemonIndices.some(
                              (index) =>
                                index.daemonId === daemon.id &&
                                index.sequenceIndex === seqIndex
                            )
                              ? "text-lime-300"
                              : ""
                          }
                          ${
                            daemon.isSolved
                              ? "font-extrabold text-neutral-950"
                              : ""
                          }
                        `}
                      >
                        {char}
                      </span>
                    ))}
                  </p>
                  <div className="text-left w-30 tracking-wide pl-5">
                    <h3
                      className={`text-lg
                        ${
                          daemon.isSolved
                            ? "font-extrabold text-neutral-950"
                            : ""
                        }
                      `}
                    >
                      {daemon.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ///////////////////////////////////////////////////////////////////////////// */}
          <div className="flex flex-col mt-2">
            <button
              className="rounded-md bg-red-900 text-sm font-orbitron font-bold py-3 px-6 min-w-fit max-w-fit self-center hover:bg-red-950 transition-colors duration-200 tracking-wide"
              onClick={uploadVerifiedDaemons}
            >
              UPLOAD DAEMONS
            </button>
            <button
              className="rounded-md outline outline-neutral-800 text-sm text-neutral-700 font-orbitron font-bold py-3 px-6 min-w-fit max-w-fit self-center mt-5 hover:outline-neutral-700 hover:text-neutral-500 transition-all duration-200 tracking-wide"
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
