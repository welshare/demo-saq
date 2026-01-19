/**
 * Method #1: External Wallet Submission
 * 
 * Uses @welshare/react to connect to user's existing Welshare wallet.
 * The wallet handles signing and submission - app just provides data.
 * 
 * Use this when: Users already have Welshare wallets
 */

import { buildQuestionnaireResponse } from "@/utils/build-questionnaire-response";
import { Schemas, useWelshare, WELSHARE_API_ENVIRONMENT } from "@welshare/react";
import type { SubmissionPayload } from "@welshare/react/types";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { FormData } from "./use-seattle-angina-form";
import { SeattleAnginaScores } from "./use-seattle-angina-scores";

export const useExternalWalletSubmission = (
  formData: FormData,
  scores: SeattleAnginaScores,
  onSuccess?: () => void
) => {
  const [submitted, setSubmitted] = useState(false);

  // Initialize Welshare hook with app credentials and callbacks
  const { isConnected, openWallet, submitData, isSubmitting, storageKey } =
    useWelshare({
      applicationId: process.env.NEXT_PUBLIC_WELSHARE_APP_ID || "",
      environment: process.env
        .NEXT_PUBLIC_WELSHARE_ENVIRONMENT as keyof typeof WELSHARE_API_ENVIRONMENT,
      callbacks: {
        onError: (error: unknown) => {
          console.error("Submission error:", error);
          toast.error("Submission failed");
          setSubmitted(false);
        },
        onUploaded: (payload: SubmissionPayload<unknown>) => {
          console.log("Submission successful:", payload);
          setSubmitted(true);
          toast.success("Submitted to Welshare");
          onSuccess?.();
        },
      },
    });

  const submitForm = useCallback(async () => {
    if (!isConnected) {
      toast.warning("Connect wallet first");
      return;
    }

    if (Object.keys(formData).length === 0) {
      toast.warning("Please answer questions first");
      return;
    }

    const response = buildQuestionnaireResponse(formData, scores);
    if (!response) {
      toast.error("Could not build response");
      return;
    }

    // Submit using the QuestionnaireResponse schema
    submitData(Schemas.QuestionnaireResponse, response);
  }, [isConnected, formData, scores, submitData]);

  const truncateDid = (did: string, start = 12, end = 8) =>
    `${did.slice(0, start)}...${did.slice(-end)}`;

  return {
    isConnected,
    openWallet,
    submitForm,
    isSubmitting,
    storageKey,
    submitted,
    truncateDid,
  };
};
