"use client";

import { SeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";

interface ScoreDisplayProps {
  scores: SeattleAnginaScores;
}

// Example: Display calculated scores that will be included in submission
// Demonstrates inverted color scheme with prominent score display
export default function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const { physicalLimitationScore, overallSummaryScore } = scores;

  if (physicalLimitationScore === null) return null;

  return (
    <div className="score-panel score-panel--inverted">
      <h3 className="score-panel-title score-panel-title--inverted">
        Calculated Scores
      </h3>
      <div className="score-panel-content">
        <div className="score-item">
          <span className="score-label">Physical Limitation</span>
          <span className="score-value">
            {physicalLimitationScore.toFixed(1)}
          </span>
        </div>
        {overallSummaryScore !== null && (
          <div className="score-item">
            <span className="score-label">Overall Summary</span>
            <span className="score-value">
              {overallSummaryScore.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="score-range">Scale: 0-100</div>
    </div>
  );
}
