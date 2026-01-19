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
      <p className="form-description">
        The Seattle Angina Questionnaire (SAQ) is a 19-item assessment tool designed to evaluate health status and quality of life in patients with coronary artery disease. It measures physical limitations, angina frequency and stability, treatment satisfaction, and disease perception to help healthcare professionals monitor disease progression and inform treatment strategies.
      </p>

      <form onSubmit={handleSubmit}>
        <QuestionnaireRenderer
          questionnaireData={questionnaireData}
          formData={formData}
          onInputChange={handleInputChange}
        />

        <ScoreDisplay scores={scores} />

        <div className="form-field">
          <LoginWithStorageKeyComponent
            storageKey={storageKey}
            makeStorageKey={makeStorageKey}
          />
        </div>

        {user && (
          <div className="form-field">
            <button
              type="submit"
              className="form-button"
              disabled={!storageKey || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit to Welshare Profile"}
            </button>
            {isSubmitting && (
              <p className="submit-status">Submitting your response...</p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
