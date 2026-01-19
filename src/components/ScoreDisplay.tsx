"use client";

import React from "react";
import { SeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";

interface ScoreDisplayProps {
  scores: SeattleAnginaScores;
}

export default function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const {
    physicalLimitationScore,
    symptomFrequencyScore,
    qualityOfLifeScore,
    overallSummaryScore,
  } = scores;

  const hasAnyScore =
    physicalLimitationScore !== null ||
    symptomFrequencyScore !== null ||
    qualityOfLifeScore !== null ||
    overallSummaryScore !== null;

  if (!hasAnyScore) {
    return null;
  }

  return (
    <div className="score-panel">
      <h3 className="score-panel-title">Calculated Scores (0-100 scale)</h3>

      {physicalLimitationScore !== null && (
        <div className="score-row">
          <strong>Physical Limitation Score:</strong>{" "}
          {physicalLimitationScore.toFixed(1)}
        </div>
      )}

      {symptomFrequencyScore !== null && (
        <div className="score-row">
          <strong>Symptom Frequency Score:</strong>{" "}
          {symptomFrequencyScore.toFixed(1)}
        </div>
      )}

      {qualityOfLifeScore !== null && (
        <div className="score-row">
          <strong>Quality of Life Score:</strong>{" "}
          {qualityOfLifeScore.toFixed(1)}
        </div>
      )}

      {overallSummaryScore !== null && (
        <div className="score-row score-row-highlight">
          <strong>Overall Summary Score:</strong>{" "}
          {overallSummaryScore.toFixed(1)}
        </div>
      )}

      <p className="score-panel-hint">
        Higher scores indicate better health status. Scores are automatically
        calculated and included in your submission.
      </p>
    </div>
  );
}
