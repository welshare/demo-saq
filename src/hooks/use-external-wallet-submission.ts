import { buildQuestionnaireResponse } from "@/utils/build-questionnaire-response";
import { Schemas, useWelshare, WELSHARE_API_ENVIRONMENT } from "@welshare/react";
import type { SubmissionPayload } from "@welshare/react/types";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { FormData } from "./use-seattle-angina-form";
import { SeattleAnginaScores } from "./use-seattle-angina-scores";

export const useExternalWalletSubmission = (
  formData: FormData,
  scores: SeattleAnginaScores
) => {
  const [submitted, setSubmitted] = useState(false);

  const {
    isConnected,
    openWallet,
    submitData,
    isSubmitting,
    storageKey,
  } = useWelshare({
    applicationId: process.env.NEXT_PUBLIC_WELSHARE_APP_ID || "",
    environment: process.env.NEXT_PUBLIC_WELSHARE_ENVIRONMENT as keyof typeof WELSHARE_API_ENVIRONMENT,
    callbacks: {
      onError: (error: unknown) => {
        console.error("External submission error:", error);
        const message = error instanceof Error ? error.message : String(error);
        toast.error("Submission Failed", {
          description: message,
          duration: 5000,
        });
        setSubmitted(false);
      },
      onUploaded: (payload: SubmissionPayload<unknown>) => {
        console.log("External submission successful:", payload);
        setSubmitted(true);
        toast.success("Data submitted successfully", {
          description:
            "Your data has been saved to your Welshare profile via external wallet.",
          duration: 5000,
        });
      },
    },
  });

  const submitForm = useCallback(async () => {
    if (!isConnected) {
      toast.warning("Wallet Not Connected", {
        description: "Please connect your Welshare wallet first.",
        duration: 3000,
      });
      return;
    }

    if (Object.keys(formData).length === 0) {
      toast.warning("Form Incomplete", {
        description: "Please answer at least one question before submitting.",
        duration: 3000,
      });
      return;
    }

    const response = buildQuestionnaireResponse(formData, scores);
    if (!response) {
      toast.error("Form Incomplete", {
        description: "Please answer at least one question before submitting.",
        duration: 3000,
      });
      return;
    }

    try {
      submitData(Schemas.QuestionnaireResponse, response);
    } catch (error) {
      console.error("External submission error:", error);
      toast.error("Submission Failed", {
        description:
          "There was an error submitting your data. Please try again.",
        duration: 5000,
      });
    }
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
