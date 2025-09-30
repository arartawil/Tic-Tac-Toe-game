import { useEffect, useMemo, useState } from 'react';
import Board from './components/Board.jsx';
import HUD from './components/HUD.jsx';
import Controls from './components/Controls.jsx';
import { generatePuzzle } from './utils/generator.js';
import { calculatePathSum, isValidNextSelection } from './utils/pathUtils.js';
import './styles/app.css';

const LEVEL_CONFIGS = [
  {
    gridSize: 4,
    targetRange: [8, 15],
    timeLimit: 90,
    requiredSolutions: 5,
    features: {
      negative: false,
      locked: false,
      bonus: false
    }
  },
  {
    gridSize: 5,
    targetRange: [12, 25],
    timeLimit: 75,
    requiredSolutions: 6,
    features: {
      negative: true,
      locked: false,
      bonus: false
    }
  },
  {
    gridSize: 6,
    targetRange: [18, 35],
    timeLimit: 60,
    requiredSolutions: 7,
    features: {
      negative: true,
      locked: true,
      bonus: true
    }
  }
];

const LOCAL_STORAGE_KEYS = {
  bestScore: 'connect_numbers_best_score',
  bestLevel: 'connect_numbers_best_level'
};

// Audio hooks can be implemented later. Stubs are provided so the rest of the
// app can call them without errors if sounds are introduced.
const playSuccessSound = () => {};
const playErrorSound = () => {};

function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [grid, setGrid] = useState([]);
  const [target, setTarget] = useState(0);
  const [selectedPath, setSelectedPath] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIGS[0].timeLimit);
  const [solvedCount, setSolvedCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hudShake, setHudShake] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEYS.bestScore);
    return stored ? Number(stored) : 0;
  });
  const [bestLevel, setBestLevel] = useState(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEYS.bestLevel);
    return stored ? Number(stored) : 1;
  });

  const levelConfig = LEVEL_CONFIGS[levelIndex];

  useEffect(() => {
    const { grid: newGrid, target: newTarget } = generatePuzzle(levelConfig);
    setGrid(newGrid);
    setTarget(newTarget);
    setSelectedPath([]);
  }, [levelConfig]);

  useEffect(() => {
    setTimeLeft(levelConfig.timeLimit);
  }, [levelConfig]);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }
    if (timeLeft <= 0) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isPaused, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleGameOver();
    }
  }, [timeLeft]);

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.bestScore, String(bestScore));
  }, [bestScore]);

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.bestLevel, String(bestLevel));
  }, [bestLevel]);

  const runningSum = useMemo(() => {
    return calculatePathSum(selectedPath, grid);
  }, [selectedPath, grid]);

  const handleSelectTile = (row, col) => {
    if (timeLeft <= 0 || isPaused) {
      return;
    }
    const tile = grid[row]?.[col];
    if (!tile || tile.locked) {
      return;
    }

    const last = selectedPath[selectedPath.length - 1];
    if (last && last.row === row && last.col === col) {
      setSelectedPath((prev) => prev.slice(0, -1));
      return;
    }

    const alreadySelected = selectedPath.some((pos) => pos.row === row && pos.col === col);
    if (alreadySelected) {
      return;
    }

    if (selectedPath.length === 0 || isValidNextSelection(selectedPath[selectedPath.length - 1], { row, col })) {
      setSelectedPath((prev) => [...prev, { row, col }]);
    }
  };

  const handleSubmitPath = () => {
    if (selectedPath.length === 0 || timeLeft <= 0) {
      return;
    }
    if (runningSum === target) {
      const lengthBonus = selectedPath.length * 10;
      const streakBonus = streak * 5;
      const gained = lengthBonus + streakBonus;
      const newScore = score + gained;
      setScore(newScore);
      const newStreak = streak + 1;
      setStreak(newStreak);
      const newSolved = solvedCount + 1;
      setSolvedCount(newSolved);
      const required = levelConfig.requiredSolutions;
      const unlockedLevel =
        newSolved >= required && levelIndex < LEVEL_CONFIGS.length - 1
          ? levelIndex + 2
          : levelIndex + 1;
      updateBests(newScore, unlockedLevel);
      advanceOrRefresh(newSolved);
      playSuccessSound();
    } else {
      setStreak(0);
      setHudShake(true);
      window.setTimeout(() => setHudShake(false), 400);
      playErrorSound();
    }
    setSelectedPath([]);
  };

  const advanceOrRefresh = (newSolved) => {
    const required = levelConfig.requiredSolutions;
    if (newSolved >= required) {
      if (levelIndex < LEVEL_CONFIGS.length - 1) {
        setLevelIndex((prev) => prev + 1);
        setSolvedCount(0);
      } else {
        // Completed final level; increase difficulty loop by resetting solved count and refreshing board.
        setSolvedCount(0);
        refreshPuzzle();
      }
    } else {
      refreshPuzzle();
    }
  };

  const refreshPuzzle = () => {
    const { grid: newGrid, target: newTarget } = generatePuzzle(levelConfig);
    setGrid(newGrid);
    setTarget(newTarget);
  };

  const handleReset = () => {
    setLevelIndex(0);
    setScore(0);
    setStreak(0);
    setSolvedCount(0);
    setIsPaused(false);
    setTimeLeft(LEVEL_CONFIGS[0].timeLimit);
    const { grid: newGrid, target: newTarget } = generatePuzzle(LEVEL_CONFIGS[0]);
    setGrid(newGrid);
    setTarget(newTarget);
    setSelectedPath([]);
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleGameOver = () => {
    setIsPaused(true);
  };

  const updateBests = (newScore, reachedLevel) => {
    if (newScore > bestScore) {
      setBestScore(newScore);
    }
    if (reachedLevel > bestLevel) {
      setBestLevel(reachedLevel);
    }
  };

  const handleUndo = () => {
    setSelectedPath((prev) => prev.slice(0, -1));
  };

  const gameState = {
    grid,
    target,
    selectedPath,
    score,
    level: levelIndex + 1,
    streak,
    timeLeft,
    runningSum,
    bestScore,
    bestLevel,
    required: levelConfig.requiredSolutions,
    solvedCount,
    isPaused
  };

  return (
    <div className="app">
      <h1>Connect Numbers</h1>
      <HUD {...gameState} shake={hudShake} />
      <Board grid={grid} selectedPath={selectedPath} onSelect={handleSelectTile} />
      <Controls
        onSubmit={handleSubmitPath}
        onUndo={handleUndo}
        onReset={handleReset}
        onPauseToggle={handlePauseToggle}
        isPaused={isPaused}
        canSubmit={selectedPath.length > 0 && !isPaused && timeLeft > 0}
      />
    </div>
  );
}

export default App;
