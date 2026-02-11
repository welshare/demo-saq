"use client";

import { useStorageKey } from "@/hooks/use-storage-key";
import {
  AnswerCodeMap,
  useSeattleAnginaScores,
} from "@/hooks/use-seattle-angina-scores";
import { useSeattleAnginaSubmission } from "@/hooks/use-seattle-angina-submission";
import {
  QuestionRenderer,
  useQuestionnaire,
  LegalConsentForm,
  isQuestionHidden,
} from "@welshare/questionnaire";
import type { QuestionnaireItem, Coding } from "@welshare/questionnaire";
import { usePrivy } from "@privy-io/react-auth";
import React, { useState, useEffect, useRef, useMemo } from "react";
import EmbeddedWalletSubmission from "./EmbeddedWalletSubmission";
import ExternalWalletSubmission from "./ExternalWalletSubmission";
import ScoreDisplay from "./ScoreDisplay";

const STORAGE_KEY = "seattle-angina-form-draft";

// Required question linkIds (all choice questions the user must answer)
const REQUIRED_QUESTION_IDS = [
  "94952",
  "94953",
  "94954",
  "94955",
  "94956",
  "94957",
  "94959",
];

export default function QuestionnaireFormContent() {
  const {
    questionnaire,
    response,
    getAnswer,
    updateAnswer,
    debugMode,
    toggleDebugMode,
  } = useQuestionnaire();
  const { storageKey, makeStorageKey } = useStorageKey();
  const { user } = usePrivy();

  const [showPills, setShowPills] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const restoredRef = useRef(false);

  // Restore answers from sessionStorage after provider has initialized.
  // The provider's init effect sets response.questionnaire — we wait for that
  // to avoid a race where our updateAnswer calls get overwritten by initialization.
  const isProviderReady = !!response.questionnaire;
  useEffect(() => {
    if (restoredRef.current || !isProviderReady) return;
    restoredRef.current = true;

    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (typeof parsed !== "object" || parsed === null) return;

      for (const [linkId, code] of Object.entries(parsed)) {
        if (typeof code === "string" && code) {
          const coding = findCodingForCode(
            questionnaire.item ?? [],
            linkId,
            code
          );
          if (coding) {
            updateAnswer(linkId, { valueCoding: coding });
          }
        }
      }
    } catch {
      // ignore
    }
  }, [isProviderReady, questionnaire, updateAnswer]);

  const clearForm = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  // Extract answer codes from library state for score calculation and persistence.
  // Computed on every render since getAnswer reads from the latest response state.
  const answerCodes = useMemo(() => {
    const _answerCodes: AnswerCodeMap = {};
    for (const linkId of REQUIRED_QUESTION_IDS) {
      const answer = getAnswer(linkId);
      if (answer?.valueCoding?.code) {
        _answerCodes[linkId] = answer.valueCoding.code;
      }
    }
    return _answerCodes;
  }, [response]);

  // Sync answer codes to sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const answerCodesJson = JSON.stringify(answerCodes);
    if (answerCodesJson === "{}") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, answerCodesJson);
    } catch {
      // ignore
    }
  }, [answerCodes]);

  const scores = useSeattleAnginaScores(answerCodes);

  const isFormComplete = REQUIRED_QUESTION_IDS.every((id) => !!answerCodes[id]);

  const clearFormData = () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  const { isSubmitting, submitForm } = useSeattleAnginaSubmission(
    response,
    scores,
    storageKey,
    clearFormData
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasConsented) {
      submitForm();
    } else {
      setShowConsent(true);
    }
  };

  // Render visible top-level items
  const visibleItems = (questionnaire.item ?? []).filter(
    (item) => !isQuestionHidden(item)
  );

  return (
    <>
      <form onSubmit={handleSubmit}>
        {visibleItems.map((item) => (
          <QuestionRenderer
            key={item.linkId}
            item={item as QuestionnaireItem}
            choiceLayout={showPills ? "inline-wrap" : "stacked"}
          />
        ))}

        <ScoreDisplay scores={scores} />

        <div className="submission-options">
          <h2 className="submission-options-title">Submission Methods</h2>

          <div className="submission-option">
            <h3 className="submission-option-title">
              Method A: External Wallet
            </h3>
            <ExternalWalletSubmission
              libraryResponse={response}
              scores={scores}
              isFormComplete={isFormComplete}
              onSuccess={clearFormData}
            />
          </div>

          <div className="submission-divider">— or —</div>

          <div className="submission-option">
            <h3 className="submission-option-title">
              Method B: Embedded Wallet
            </h3>
            <EmbeddedWalletSubmission
              storageKey={storageKey}
              makeStorageKey={makeStorageKey}
            />

            {user && storageKey && (
              <>
                <div
                  className={`consent-panel ${
                    showConsent ? "consent-panel-open" : "consent-panel-closed"
                  }`}
                >
                  <LegalConsentForm
                    onConfirm={() => {
                      setHasConsented(true);
                      setShowConsent(false);
                    }}
                    onCancel={() => setShowConsent(false)}
                    confirmButtonLabel="Confirm & Save to Welshare"
                  />
                </div>

                <button
                  type="submit"
                  className="form-button"
                  disabled={isSubmitting || !isFormComplete || showConsent}
                  style={{ marginTop: "1rem" }}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : hasConsented
                    ? "Submit to Welshare"
                    : "Save to Welshare"}
                </button>
              </>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-end ">
              <button
                className="wq-button wq-button-outline"
                onClick={() => {
                  toggleDebugMode();
                }}
              >
                Debug Mode: {debugMode ? "On" : "Off"}
              </button>
              <button
                className="wq-button wq-button-outline"
                onClick={() => {
                  setShowPills((o) => !o);
                }}
              >
                Choices: {showPills ? "Pills" : "Stacked"}
              </button>
              <button
                className="wq-button wq-button-outline"
                onClick={() => {
                  clearForm();
                }}
              >
                Clear form
              </button>
            </div>
            {debugMode && (
              <div className="wq-debug-section wq-debug-json">
                <code>{JSON.stringify(response, null, 2)}</code>
              </div>
            )}
          </div>
        </div>
      </form>
    </>
  );
}

// Helper: find the full coding object for a given linkId and code string
function findCodingForCode(
  items: QuestionnaireItem[],
  linkId: string,
  code: string
): Coding | undefined {
  for (const item of items) {
    if (item.linkId === linkId) {
      const option = item.answerOption?.find(
        (opt) => opt.valueCoding?.code === code
      );
      return option?.valueCoding ?? undefined;
    }
    if (item.item) {
      const found = findCodingForCode(item.item, linkId, code);
      if (found) return found;
    }
  }
  return undefined;
}
