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
    <div className="form-field">
      <h3
        className="form-label"
        style={{ fontSize: "1.2rem", marginBottom: "1rem" }}
      >
        📊 Calculated Scores (0-100 scale)
      </h3>

      {physicalLimitationScore !== null && (
        <div style={{ marginBottom: "0.5rem", color: "#00ff00" }}>
          <strong>Physical Limitation Score:</strong>{" "}
          {physicalLimitationScore.toFixed(1)}
        </div>
      )}

      {symptomFrequencyScore !== null && (
        <div style={{ marginBottom: "0.5rem", color: "#00ff00" }}>
          <strong>Symptom Frequency Score:</strong>{" "}
          {symptomFrequencyScore.toFixed(1)}
        </div>
      )}

      {qualityOfLifeScore !== null && (
        <div style={{ marginBottom: "0.5rem", color: "#00ff00" }}>
          <strong>Quality of Life Score:</strong>{" "}
          {qualityOfLifeScore.toFixed(1)}
        </div>
      )}

      {overallSummaryScore !== null && (
        <div
          style={{
            marginBottom: "0.5rem",
            color: "#00ff00",
            fontWeight: "bold",
          }}
        >
          <strong>Overall Summary Score:</strong>{" "}
          {overallSummaryScore.toFixed(1)}
        </div>
      )}

      <p
        style={{
          fontSize: "0.9rem",
          color: "#00ff00",
          opacity: 0.8,
          marginTop: "0.5rem",
        }}
      >
        Higher scores indicate better health status. Scores are automatically
        calculated and included in your submission.
      </p>
    </div>
  );
}

