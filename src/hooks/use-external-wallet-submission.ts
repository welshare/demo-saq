import { buildQuestionnaireResponse } from "@/utils/build-questionnaire-response";
import type { QuestionnaireResponse } from "@welshare/questionnaire";
import { Schemas, useWelshare, WELSHARE_API_ENVIRONMENT } from "@welshare/react";
import type { SubmissionPayload } from "@welshare/react/types";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { SeattleAnginaScores } from "./use-seattle-angina-scores";

export const useExternalWalletSubmission = (
  libraryResponse: QuestionnaireResponse,
  scores: SeattleAnginaScores,
  onSuccess?: () => void
) => {
  const [submitted, setSubmitted] = useState(false);

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

    const response = buildQuestionnaireResponse(libraryResponse, scores);
    if (!response) {
      toast.warning("Please answer questions first");
      return;
    }

    submitData(Schemas.QuestionnaireResponse, response);
  }, [isConnected, libraryResponse, scores, submitData]);

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
