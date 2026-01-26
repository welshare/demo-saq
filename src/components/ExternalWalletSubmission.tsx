"use client";

// Method #1: External Wallet Submission
// User connects their own Welshare wallet via @welshare/react

import { useExternalWalletSubmission } from "@/hooks/use-external-wallet-submission";
import { WelshareLogo } from "@welshare/react";
import { LegalConsentForm } from "@welshare/questionnaire";
import { FormData } from "@/hooks/use-seattle-angina-form";
import { SeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";
import { useState } from "react";

interface ExternalWalletSubmissionProps {
  formData: FormData;
  scores: SeattleAnginaScores;
  isFormComplete: boolean;
  onSuccess?: () => void;
}

export default function ExternalWalletSubmission({
  formData,
  scores,
  isFormComplete,
  onSuccess,
}: ExternalWalletSubmissionProps) {
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const {
    isConnected,
    openWallet,
    submitForm,
    isSubmitting,
    storageKey,
    submitted,
    truncateDid,
  } = useExternalWalletSubmission(formData, scores, onSuccess);

  const handleSubmitClick = () => {
    if (hasConsented) {
      submitForm();
    } else {
      setShowConsent(true);
    }
  };

  return (
    <div>
      {isConnected && storageKey && (
        <div className="wallet-info-row" style={{ marginBottom: "1rem" }}>
          <span className="wallet-info-label">Connected</span>
          <span className="wallet-info-value">{truncateDid(storageKey)}</span>
        </div>
      )}

      {!isConnected ? (
        <button
          type="button"
          className="custom-connect-button"
          onClick={openWallet}
        >
          <WelshareLogo />
          Connect Welshare Wallet
        </button>
      ) : (
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
                submitForm();
              }}
              onCancel={() => setShowConsent(false)}
              confirmButtonLabel="Confirm & Save to Welshare"
            />
          </div>

          <button
            type="button"
            className="form-button"
            onClick={handleSubmitClick}
            disabled={
              isSubmitting || submitted || !isFormComplete || showConsent
            }
          >
            <WelshareLogo />
            {isSubmitting
              ? "Saving..."
              : submitted
              ? "Submitted"
              : "Save to Welshare"}
          </button>
        </>
      )}

      {submitted && (
        <p className="external-wallet-success" style={{ marginTop: "0.5rem" }}>
          Submitted successfully.
        </p>
      )}
    </div>
  );
}
