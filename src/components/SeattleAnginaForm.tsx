"use client";

// Main form component demonstrating two Welshare submission methods

import { useStorageKey } from "@/hooks/use-storage-key";
import { usePrivy } from "@privy-io/react-auth";
import React from "react";
import questionnaireData from "../seattle_angina.json";
import EmbeddedWalletSubmission from "./EmbeddedWalletSubmission";
import QuestionnaireRenderer from "./QuestionnaireRenderer";
import ScoreDisplay from "./ScoreDisplay";
import ExternalWalletSubmission from "./ExternalWalletSubmission";
import { useSeattleAnginaForm } from "@/hooks/use-seattle-angina-form";
import { useSeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";
import { useSeattleAnginaSubmission } from "@/hooks/use-seattle-angina-submission";

export default function SeattleAnginaForm() {
  const { storageKey, makeStorageKey } = useStorageKey();
  const { user } = usePrivy();
  const { formData, handleInputChange, isFormComplete, clearFormData } = useSeattleAnginaForm();
  const scores = useSeattleAnginaScores(formData);
  const { isSubmitting, submitForm } = useSeattleAnginaSubmission(
    formData,
    scores,
    storageKey,
    clearFormData
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <div className="form-container">
      <h1 className="form-title">{questionnaireData.title}</h1>
      <p className="form-description">
        Demo: Submit FHIR questionnaire responses to Welshare using two different methods.
      </p>

      <form onSubmit={handleSubmit}>
        <QuestionnaireRenderer
          questionnaireData={questionnaireData}
          formData={formData}
          onInputChange={handleInputChange}
        />

        <ScoreDisplay scores={scores} />

        <div className="submission-options">
          <h2 className="submission-options-title">Submission Methods</h2>

          {/* Method #1: External Wallet - User brings their own Welshare wallet */}
          <div className="submission-option">
            <h3 className="submission-option-title">Method A: External Wallet</h3>
            <ExternalWalletSubmission
              formData={formData}
              scores={scores}
              isFormComplete={isFormComplete}
              onSuccess={clearFormData}
            />
          </div>

          <div className="submission-divider">— or —</div>

          {/* Method #2: Embedded Wallet - App creates wallet for user via Privy */}
          <div className="submission-option">
            <h3 className="submission-option-title">Method B: Embedded Wallet</h3>
            <EmbeddedWalletSubmission
              storageKey={storageKey}
              makeStorageKey={makeStorageKey}
            />

            {user && storageKey && (
              <button
                type="submit"
                className="form-button"
                disabled={isSubmitting || !isFormComplete}
                style={{ marginTop: "1rem" }}
              >
                {isSubmitting ? "Submitting..." : "Submit to Welshare"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
