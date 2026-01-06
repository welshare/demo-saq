"use client";

import { useStorageKey } from "@/hooks/use-storage-key";
import { usePrivy } from "@privy-io/react-auth";
import React from "react";
import questionnaireData from "../seattle_angina.json";
import LoginWithStorageKeyComponent from "./LoginWithStorageKeyComponent";
import QuestionnaireRenderer from "./QuestionnaireRenderer";
import ScoreDisplay from "./ScoreDisplay";
import { useSeattleAnginaForm } from "@/hooks/use-seattle-angina-form";
import { useSeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";
import { useSeattleAnginaSubmission } from "@/hooks/use-seattle-angina-submission";

export default function SeattleAnginaForm() {
  const { storageKey, makeStorageKey } = useStorageKey();
  const { user } = usePrivy();
  const { formData, handleInputChange } = useSeattleAnginaForm();
  const scores = useSeattleAnginaScores(formData);
  const { isSubmitting, submitForm } = useSeattleAnginaSubmission(
    formData,
    scores,
    storageKey
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <div className="form-container">
      <h1 className="form-title">{questionnaireData.title}</h1>

      <div style={{ marginBottom: "2rem" }}>
        <LoginWithStorageKeyComponent
          storageKey={storageKey}
          makeStorageKey={makeStorageKey}
        />
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
        <QuestionnaireRenderer
          questionnaireData={questionnaireData}
          formData={formData}
          onInputChange={handleInputChange}
        />

        <ScoreDisplay scores={scores} />

        <div className="form-field">
          <button
            type="submit"
            className="form-button"
            disabled={!storageKey}
            style={{
              opacity: storageKey ? 1 : 0.5,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit to Welshare Profile"}
          </button>
          {!user && !isSubmitting && (
            <p style={{ color: "#00ff00", marginTop: "0.5rem" }}>
              Connect your wallet to enable submission
            </p>
          )}
          {isSubmitting && (
            <p style={{ color: "#00ff00", marginTop: "0.5rem" }}>
              Submitting your response...
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
