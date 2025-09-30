import { useMemo, useState } from 'react';
import './App.css';

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const Square = ({ value, onClick, isWinner }) => (
  <button
    className={`square${isWinner ? ' winner' : ''}`}
    onClick={onClick}
    disabled={Boolean(value)}
    type="button"
  >
    {value}
  </button>
);

const getWinner = (squares) => {
  for (const [a, b, c] of WINNING_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
};

function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const winner = useMemo(() => getWinner(squares), [squares]);
  const hasEmptySquares = squares.some((square) => square === null);

  const status = winner
    ? `Winner: ${winner.player}`
    : hasEmptySquares
    ? `Next player: ${isXNext ? 'X' : 'O'}`
    : "It's a draw!";

  const handleSquareClick = (index) => {
    if (squares[index] || winner) {
      return;
    }

    const nextSquares = squares.slice();
    nextSquares[index] = isXNext ? 'X' : 'O';
    setSquares(nextSquares);
    setIsXNext((prev) => !prev);
  };

  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="app">
      <h1>Tic Tac Toe</h1>
      <div className="status">{status}</div>
      <div className="board">
        {squares.map((value, index) => (
          <Square
            key={index}
            value={value}
            onClick={() => handleSquareClick(index)}
            isWinner={Boolean(winner?.line?.includes(index))}
          />
        ))}
      </div>
      <button className="reset-button" type="button" onClick={handleReset}>
        Reset Game
      </button>
    </div>
  );
}

export default App;
