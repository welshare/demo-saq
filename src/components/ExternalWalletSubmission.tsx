"use client";

import { useExternalWalletSubmission } from "@/hooks/use-external-wallet-submission";
import { WelshareLogo } from "@welshare/react";
import { FormData } from "@/hooks/use-seattle-angina-form";
import { SeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";

interface ExternalWalletSubmissionProps {
  formData: FormData;
  scores: SeattleAnginaScores;
  isFormComplete: boolean;
}

export default function ExternalWalletSubmission({
  formData,
  scores,
  isFormComplete,
}: ExternalWalletSubmissionProps) {
  const {
    isConnected,
    openWallet,
    submitForm,
    isSubmitting,
    storageKey,
    submitted,
    truncateDid,
  } = useExternalWalletSubmission(formData, scores);

  return (
    <div className="external-wallet-panel">
      <div className="external-wallet-header">
        <h3 className="external-wallet-title">External Wallet Submission</h3>
        <p className="external-wallet-description">
          Connect to your Welshare wallet to submit data without logging into
          this app directly.
        </p>
      </div>

      {isConnected && storageKey && (
        <div className="wallet-info-row">
          <span className="wallet-info-label">Connected Wallet</span>
          <span className="wallet-info-value wallet-info-value-small">
            {truncateDid(storageKey)}
          </span>
        </div>
      )}

      <div className="external-wallet-actions">
        {!isConnected ? (
          <button
            type="button"
            className="custom-connect-button external-connect-button"
            onClick={openWallet}
          >
            <WelshareLogo />
            Connect Welshare Wallet
          </button>
        ) : (
          <div className="external-wallet-connected-actions">
            <button
              type="button"
              className="form-button external-submit-button"
              onClick={submitForm}
              disabled={isSubmitting || submitted || !isFormComplete}
            >
              <WelshareLogo />
              {isSubmitting
                ? "Saving..."
                : submitted
                  ? "Submitted"
                  : "Save to Welshare Profile"}
            </button>
            {!isFormComplete && (
              <p className="form-incomplete-hint">
                Please answer all questions to enable submission.
              </p>
            )}
          </div>
        )}
      </div>

      {isSubmitting && (
        <p className="submit-status">Submitting via external wallet...</p>
      )}
      {submitted && (
        <p className="external-wallet-success">
          Response saved successfully via external wallet.
        </p>
      )}
    </div>
  );
}
