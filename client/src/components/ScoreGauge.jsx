import { useState, useEffect } from "react";

export default function ScoreGauge({ score = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(score / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= score) {
        start = score;
        clearInterval(timer);
      }
      setAnimatedScore(start);
    }, 25);
    return () => clearInterval(timer);
  }, [score]);

  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s <= 40) return "var(--score-red)";
    if (s <= 70) return "var(--score-yellow)";
    return "var(--score-green)";
  };

  const getLabel = (s) => {
    if (s <= 40) return "Needs Work";
    if (s <= 70) return "Average";
    return "Excellent";
  };

  const color = getColor(animatedScore);

  return (
    <div className="score-gauge" style={{ margin: "0 auto" }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle className="track" cx="90" cy="90" r={radius} />
        <circle
          className="progress glow-pulse"
          cx="90"
          cy="90"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ color }}
        />
      </svg>
      <div className="score-text">
        <div className="score-number" style={{ color }}>
          {animatedScore}
        </div>
        <div className="score-label">{getLabel(animatedScore)}</div>
      </div>
    </div>
  );
}
