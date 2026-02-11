import { buildQuestionnaireResponse } from "@/utils/build-questionnaire-response";
import { usePrivy } from "@privy-io/react-auth";
import type { QuestionnaireResponse } from "@welshare/questionnaire";
import {
  QuestionnaireResponseSchema,
  resolveEnvironment,
  SessionKeyData,
  WelshareApi,
  WELSHARE_API_ENVIRONMENT,
} from "@welshare/sdk";
import { useState } from "react";
import { toast } from "sonner";
import { SeattleAnginaScores } from "./use-seattle-angina-scores";

export const useSeattleAnginaSubmission = (
  libraryResponse: QuestionnaireResponse,
  scores: SeattleAnginaScores,
  storageKey: SessionKeyData | undefined,
  onSuccess?: () => void
) => {
  const { user } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async () => {
    if (!user) {
      toast.warning("Please log in first");
      return;
    }

    if (!storageKey) {
      toast.warning("Please derive storage key first");
      return;
    }

    const response = buildQuestionnaireResponse(libraryResponse, scores);
    if (!response) {
      toast.warning("Please answer questions first");
      return;
    }

    setIsSubmitting(true);

    const submissionPayload = {
      applicationId: process.env.NEXT_PUBLIC_WELSHARE_APP_ID || "",
      timestamp: new Date().toISOString(),
      schemaId: QuestionnaireResponseSchema.schemaUid,
      submission: response,
    };

    try {
      const environment = resolveEnvironment(
        (process.env.NEXT_PUBLIC_WELSHARE_ENVIRONMENT as keyof typeof WELSHARE_API_ENVIRONMENT) ||
          "staging"
      );

      const apiResponse = await WelshareApi.submitData(
        storageKey.sessionKeyPair,
        submissionPayload,
        environment
      );

      console.log("Submission response:", apiResponse);
      toast.success("Submitted to Welshare");
      onSuccess?.();
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitForm };
};
