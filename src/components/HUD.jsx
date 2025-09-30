import classNames from '../utils/classNames.js';
import './hud.css';

function HUD({
  score,
  bestScore,
  level,
  bestLevel,
  target,
  runningSum,
  timeLeft,
  streak,
  required,
  solvedCount,
  isPaused,
  shake
}) {
  return (
    <div className={classNames('hud', { shake })}>
      <div className="hud-row">
        <div className="hud-item">
          <span className="label">Score</span>
          <span className="value">{score}</span>
        </div>
        <div className="hud-item">
          <span className="label">Best</span>
          <span className="value">{bestScore}</span>
        </div>
        <div className="hud-item">
          <span className="label">Level</span>
          <span className="value">{level}</span>
        </div>
        <div className="hud-item">
          <span className="label">Record Level</span>
          <span className="value">{bestLevel}</span>
        </div>
      </div>
      <div className="hud-row">
        <div className="hud-item target">
          <span className="label">Target</span>
          <span className="value">{target}</span>
        </div>
        <div className="hud-item sum">
          <span className="label">Current Sum</span>
          <span className="value">{runningSum}</span>
        </div>
        <div className="hud-item">
          <span className="label">Streak</span>
          <span className="value">{streak}</span>
        </div>
        <div className="hud-item">
          <span className="label">Solved</span>
          <span className="value">{solvedCount}/{required}</span>
        </div>
        <div className="hud-item timer">
          <span className="label">{isPaused ? 'Paused' : 'Time Left'}</span>
          <span className="value">{timeLeft}s</span>
        </div>
      </div>
    </div>
  );
}

export default HUD;
