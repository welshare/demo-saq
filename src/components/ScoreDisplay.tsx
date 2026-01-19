"use client";

import { SeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";

interface ScoreDisplayProps {
  scores: SeattleAnginaScores;
}

// Example: Display calculated scores that will be included in submission
export default function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const { physicalLimitationScore, overallSummaryScore } = scores;

  if (physicalLimitationScore === null) return null;

  return (
    <div className="score-panel">
      <h3 className="score-panel-title">Calculated Scores (0-100)</h3>
      <div>Physical Limitation: {physicalLimitationScore.toFixed(1)}</div>
      <div>Overall Summary: {overallSummaryScore?.toFixed(1)}</div>
    </div>
  );
}
