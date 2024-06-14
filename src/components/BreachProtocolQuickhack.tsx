import React, { useReducer, useCallback, useEffect, useRef } from "react";
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
import { GameAction, GameState, Position } from "../types";

///////////////////////////////////////////////////////////////////////////////
const initialState: GameState = {
  matrix: [],
  daemons: [],
  bufferCodes: [],
  bufferFeedback: "// SELECT A CODE IN THE FIRST ROW",
  highlightedDaemonIndices: [],
  currentStep: 'row',
  currentPosition: { row: 0, column: 0 },
  highlightedCells: [],
  installedDaemonNames: "",
};

///////////////////////////////////////////////////////////////////////////////
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'reset':
      return action.payload;
    case 'updateBufferCodes':
      return {
        ...state,
        ...action.payload,
      };
    case 'installVerifiedDaemons':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

///////////////////////////////////////////////////////////////////////////////
const BreachProtocolQuickhack: React.FunctionComponent = () => {
  const gridSize = 5; // nxn grid
  const bufferSize = 6; // Default buffer size
  const daemonCount = 1; // Number of Daemons

  const [state, dispatch] = useReducer(gameReducer, initialState);
  const installedDaemonNamesRef = useRef<string>("");

  useEffect(() => {
    const newMatrix = generateMatrix(gridSize);
    const newDaemons = generateDaemons(newMatrix, bufferSize, daemonCount);
    dispatch({
      type: 'reset',
      payload: {
        ...initialState,
        matrix: newMatrix,
        daemons: newDaemons
      }
    });
  }, [bufferSize, daemonCount, gridSize]);

  ///////////////////////////////////////////////////////////////////////////////
  const resetGame = useCallback(() => {
    const newMatrix = generateMatrix(gridSize);
    const newDaemons = generateDaemons(newMatrix, bufferSize, daemonCount);
    dispatch({
      type: 'reset',
      payload: {
        ...initialState,
        matrix: newMatrix,
        daemons: newDaemons
      }
    });
  }, [bufferSize, daemonCount, gridSize]);

  ///////////////////////////////////////////////////////////////////////////////
  const handleCellClick = useCallback(
    (row: number, column: number) => {
      if (isBufferFull(state.bufferCodes, bufferSize)) {
        dispatch({
          type: 'updateBufferCodes',
          payload: { ...state, bufferFeedback: "// BUFFER IS FULL" }
        });
        return;
      }
  
      if (isValidSelection({ row, column }, state.currentStep, state.currentPosition)) {
        const selectedCode = state.matrix[row][column];
        const newBufferCodes = addToBuffer(state.bufferCodes, selectedCode);
        const newHighlightedDaemonIndices = updateHighlightedDaemonIndices(
          newBufferCodes,
          state.daemons,
          state.highlightedDaemonIndices
        );
        const feedback = updateBufferFeedback(newBufferCodes, bufferSize);
  
        // Check if any daemon sequence is solved
        const solvedDaemon = state.daemons.find(daemon =>
          daemon.sequence.every((char, index) =>
            newBufferCodes[index] === char
          )
        );
  
        if (solvedDaemon) {
          const verifiedDaemons = verifyDaemons(newBufferCodes, state.daemons);
          const newInstalledDaemonNames = verifiedDaemons.map(daemon => daemon.name).join(", ");
          installedDaemonNamesRef.current = newInstalledDaemonNames;
  
          dispatch({
            type: 'installVerifiedDaemons',
            payload: {
              ...state,
              bufferCodes: newBufferCodes,
              bufferFeedback: "// UPLOAD COMPLETE",
              installedDaemonNames: `// INSTALLED DAEMONS: ${newInstalledDaemonNames}`,
              highlightedDaemonIndices: newHighlightedDaemonIndices,
              currentStep: state.currentStep === 'row' ? 'column' : 'row',
              currentPosition: { row, column },
            }
          });
        } else {
          // Update state for normal buffer code addition
          dispatch({
            type: 'updateBufferCodes',
            payload: {
              ...state,
              bufferCodes: newBufferCodes,
              bufferFeedback: feedback,
              currentStep: state.currentStep === 'row' ? 'column' : 'row',
              currentPosition: { row, column },
              highlightedDaemonIndices: newHighlightedDaemonIndices,
              highlightedCells: state.currentStep === 'column'
                ? Array.from({ length: state.matrix[row].length }, (_, col) => ({ row, column: col }))
                : Array.from({ length: state.matrix.length }, (_, r) => ({ row: r, column })),
            }
          });
        }
  
      } else {
        let feedback = "// INVALID SELECTION";
        if (state.bufferCodes.length === 0) {
          feedback += ". SELECT A CODE IN THE FIRST ROW";
        } else {
          feedback += state.currentStep === 'row' ? ". SELECT A CODE IN THE ACTIVE ROW" : ". SELECT A CODE IN THE ACTIVE COLUMN";
        }
        dispatch({
          type: 'updateBufferCodes',
          payload: { ...state, bufferFeedback: feedback }
        });
      }
    },
    [state, bufferSize]
  );

  ///////////////////////////////////////////////////////////////////////////////
  const handleCellHover = useCallback(
    (position: Position) => {
      const newHighlightedCells = state.currentStep === 'column'
        ? Array.from({ length: state.matrix[position.row].length }, (_, col) => ({ row: position.row, column: col }))
        : Array.from({ length: state.matrix.length }, (_, row) => ({ row, column: position.column }));

      dispatch({
        type: 'updateBufferCodes',
        payload: { ...state, highlightedCells: newHighlightedCells }
      });
    },
    [state]
  );

  ///////////////////////////////////////////////////////////////////////////////
  const areAllDaemonsInstalled = (state: GameState): boolean => {
    // Extract daemon names from state.daemons
    const daemonNames = state.daemons.map(daemon => daemon.name);
    
    // Split installedDaemonNames by commas and trim whitespaces
    const installedNames = state.installedDaemonNames
      .replace('// INSTALLED DAEMONS:', '') // Remove the initial prefix
      .split(',')
      .map(name => name.trim());
    
    // Check if every daemon name exists in installedNames
    return daemonNames.every(name => installedNames.includes(name));
  };

  ///////////////////////////////////////////////////////////////////////////////
  // Calculate the dimensions of the grid
  const cellSize = 64; // 64px for each cell
  const gridWidth = gridSize * cellSize;
  const gridHeight = gridSize * cellSize;
  const gridContainerWidth = gridWidth + 36;

  ///////////////////////////////////////////////////////////////////////////////
  return (
    <>
      <section className="flex flex-col min-h-screen bg-neutral-950 select-none">
        {/* /////////////////////////////////////////////////////////////////////////////// */}
        <div className="mt-80">
          {!areAllDaemonsInstalled(state) && (
            <>
              <h2 className={`font-orbitron tracking-wide text-2xl text-green-300 text-center w-60 mx-auto p-4
                ${state.bufferCodes.length === bufferSize ? "text-red-500" : ""}
              `}>
                Buffer : {bufferSize - state.bufferCodes.length}
              </h2>
              <div className="relative h-20 w-full">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex">
                  {Array.from({ length: bufferSize }).map((_, index) => (
                    <div
                      key={index}
                      className={`outline outline-2 outline-teal-300 shadow-lg shadow-teal-950 rounded-md px-4 py-4 m-2 text-teal-300 w-16 h-16 flex justify-center items-center ${state.bufferCodes[index] ? "" : "opacity-20 shadow-none"}`}>
                      {state.bufferCodes[index] || ""}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {areAllDaemonsInstalled(state) && (
              <>
                <h2 className='font-orbitron tracking-wide text-2xl text-green-300 text-center w-full mx-auto p-4'>
                  QUICKHACK SUCCESSFULL
                </h2>
                {!areAllDaemonsInstalled(state) && (
                  <>
                    <div className="relative h-20 w-full">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex">
                        {Array.from({ length: bufferSize }).map((_, index) => (
                          <div
                            key={index}
                            className={`outline outline-2 outline-green-300 shadow-lg shadow-green-950 rounded-md px-4 py-4 m-2 text-green-300 w-16 h-16 flex justify-center items-center
                            ${state.bufferCodes[index] ? "" : "opacity-20 shadow-none"}`}>
                            {state.bufferCodes[index] || ""}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {areAllDaemonsInstalled(state) && (
                  <>
                    <div className="relative h-20 w-full">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex"></div>
                    </div>
                  </>
                )}
              </>
              )}
        </div>
        {/* /////////////////////////////////////////////////////////////////////////////// */}
        <div 
          className="flex-col pt-4 font-rajdhani font-thin text-xxs text-green-200 mx-auto"
          style={{ width: `${gridContainerWidth}px` }}
        >
          {!areAllDaemonsInstalled(state) && (
            <>
              <p className={`tracking-widest ${state.installedDaemonNames ? "text-green-200" : "text-neutral-500"}`}>
              {state.installedDaemonNames || "// INSTALLED DAEMONS: "}
              </p>
              <p 
                className={`tracking-widest pb-1
                  ${(state.bufferCodes.length >= bufferSize && state.bufferFeedback !== "// UPLOAD COMPLETE") ? "text-red-600" : ""}
                  ${state.bufferFeedback === "// INVALID SELECTION. SELECT A CODE IN THE FIRST ROW" ? "text-red-500" : ""}
                  ${state.bufferFeedback === "// INVALID SELECTION. SELECT A CODE IN THE ACTIVE ROW" ? "text-red-500" : ""}
                  ${state.bufferFeedback === "// INVALID SELECTION. SELECT A CODE IN THE ACTIVE COLUMN" ? "text-red-500" : ""}
                `}>
                  {state.bufferFeedback}
              </p>
            </>
          )}
          {areAllDaemonsInstalled(state) && (
            <>
              <p 
                className={`tracking-widest ${state.installedDaemonNames ? "text-green-200" : "text-neutral-500"}`}>
                  {state.installedDaemonNames || "// INSTALLED DAEMONS: "}
              </p>
              <p 
                className='tracking-widest pb-1'>
                  // LOGIN REQUIREMENTS MET
              </p>
            </>
          )}
        </div>
        {/* /////////////////////////////////////////////////////////////////////////////// */}
        <div className="flex">
          <div className={`text-center font-rajdhani font-medium tracking-widest text-2xl mx-auto outline outline-1 outline-green-300 rounded-sm bg-neutral-950 p-4 
            ${areAllDaemonsInstalled(state) ? 'bg-neutral-950' : ''}
            `}>
            {!areAllDaemonsInstalled(state) && (
              <>
                {state.matrix.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {row.map((code, columnIndex) => (
                      <div key={columnIndex}>
                        <span
                          className={`flex text-green-300 cursor-pointer hover:text-teal-300 hover:outline hover:outline-1 hover:outline-teal-700 hover:shadow-lg hover:shadow-teal-950 hover:rounded-sm justify-evenly items-center w-16 h-16
                            ${state.highlightedCells.some(cell => cell.row === rowIndex && cell.column === columnIndex) ? 'bg-teal-200 bg-opacity-10' : ''}
                            ${rowIndex === state.currentPosition.row && state.currentStep === 'row' ? 'bg-slate-500 bg-opacity-5' : ''}
                            ${columnIndex === state.currentPosition.column && state.currentStep === 'column' ? 'bg-slate-500 bg-opacity-5' : ''}
                          `}
                            onClick={() => handleCellClick(rowIndex, columnIndex)}
                            onMouseEnter={() => handleCellHover({ row: rowIndex, column: columnIndex })}
                            onMouseMove={() => handleCellHover({ row: rowIndex, column: columnIndex })}
                            onMouseLeave={() => dispatch({ type: 'updateBufferCodes', payload: { ...state, highlightedCells: [] } })}>
                            {code}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
            {areAllDaemonsInstalled(state) && (
              <>
                <div 
                  className="flex"
                  style={{ width: `${gridWidth}px`, height: `${gridHeight}px` }}>
                  <div className="text-green-200 text-xs text-left font-light">
                    <p>// ROOT</p>
                    <p>// ACCESS_REQUEST</p>
                    <p>// ACCESS_REQUEST_SUCCESS</p>
                    <p>// COLLECTING_PACKET:_1.....................COMPLETE</p>
                    <p>// COLLECTING_PACKET:_2.....................COMPLETE</p>
                    <p>// COLLECTING_PACKET:_3.....................COMPLETE</p>
                    <p>// COLLECTING_PACKET:_4.....................COMPLETE</p>
                    <p>// COLLECTING_PACKET:_5.....................COMPLETE</p>
                    <p>// LOGIN</p>
                    <p>// LOGIN_SUCCESS</p>
                    <p>//</p>
                    <p>//</p>
                    <p>//</p>
                    <p>// UPLOAD_IN_PROGRESS</p>
                    <p>// UPLOAD_COMPLETE!</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {/* /////////////////////////////////////////////////////////////////////////////// */}
        <div className="w-full">
          {/* /////////////////////////////////////////////////////////////////////////////// */}
          <div 
            className="flex-col text-white mx-auto"
            style={{ width: `${gridWidth}px` }}
          >
            {!areAllDaemonsInstalled(state) && (
              <div className="w-full mx-auto my-6">
                {state.daemons.map((daemon) => (
                  <div 
                    key={daemon.id} 
                    className={`flex font-rajdhani text-neutral-300 px-4 my-1 justify-between
                      ${daemon.isSolved ? "bg-green-300 font-extrabold rounded-md" : ""}`}
                  >
                    <div className="flex w-28">
                      {daemon.isSolved ? (
                        <div className="flex items-center">
                          <span className="pr-1 font-extrabold text-neutral-950">INSTALLED</span>
                        </div>
                      ) : (
                        daemon.sequence.map((char, seqIndex) => (
                          <span 
                            key={seqIndex} 
                            className={`pr-1 flex items-center
                              ${state.highlightedDaemonIndices.some(index => index.daemonId === daemon.id && index.sequenceIndex === seqIndex) ? "text-green-300" : ""}
                              ${daemon.isSolved ? "font-extrabold text-neutral-950" : ""}
                            `}
                          >
                            {char}
                          </span>
                        ))
                      )}
                    </div>
                    <div className="tracking-wide">
                      <h3 
                        className={`text-lg w-28 text-center
                          ${daemon.isSolved ? "font-extrabold text-neutral-950" : ""}`}>
                            {daemon.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {areAllDaemonsInstalled(state) && (
              <div 
                className="w-full mx-auto my-6"
                style={{ width: `${gridWidth}px` }}
              >
                {state.daemons.map((daemon) => (
                  <div 
                    key={daemon.id} 
                    className={`flex font-rajdhani text-neutral-300 px-4 my-1 justify-between
                      ${daemon.isSolved ? "bg-green-300 font-extrabold rounded-md animate-pulse" : ""}`}
                  >
                    <div className="flex items-center">
                      <span className="pr-1 font-extrabold text-neutral-950">INSTALLED</span>
                    </div>
                    <div className="tracking-wide">
                      <h3
                        className={`text-lg w-28 text-center
                        ${daemon.isSolved ? "font-extrabold text-neutral-950" : ""}`}>
                        {daemon.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* /////////////////////////////////////////////////////////////////////////////// */}
          <div className="flex flex-col">
            <button
              className="rounded-md outline outline-neutral-800 text-sm text-neutral-700 font-orbitron font-bold py-3 px-6 min-w-fit max-w-fit self-center hover:outline-neutral-700 hover:text-neutral-500 transition-all duration-200 tracking-wide"
              onClick={resetGame}>
              RESET GAME
            </button>
          </div>
          {/* /////////////////////////////////////////////////////////////////////////////// */}
        </div>
        {/* /////////////////////////////////////////////////////////////////////////////// */}
      </section>
    </>
  );
};

export default BreachProtocolQuickhack;
