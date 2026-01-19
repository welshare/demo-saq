/**
 * Method #2: Embedded Wallet Submission
 * 
 * Uses Privy for authentication + @welshare/sdk for direct API submission.
 * App creates and manages wallet on behalf of user.
 * 
 * Use this when: Onboarding users who don't have Welshare wallets yet
 */

import { buildQuestionnaireResponse } from "@/utils/build-questionnaire-response";
import { usePrivy } from "@privy-io/react-auth";
import {
  QuestionnaireResponseSchema,
  resolveEnvironment,
  SessionKeyData,
  WelshareApi,
  WELSHARE_API_ENVIRONMENT,
} from "@welshare/sdk";
import { useState } from "react";
import { toast } from "sonner";
import { FormData } from "./use-seattle-angina-form";
import { SeattleAnginaScores } from "./use-seattle-angina-scores";

export const useSeattleAnginaSubmission = (
  formData: FormData,
  scores: SeattleAnginaScores,
  storageKey: SessionKeyData | undefined
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

    if (Object.keys(formData).length === 0) {
      toast.warning("Please answer questions first");
      return;
    }

    const response = buildQuestionnaireResponse(formData, scores);
    if (!response) {
      toast.error("Could not build response");
      return;
    }

    setIsSubmitting(true);

    // Build submission payload with app ID, schema, and data
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
      
      // Submit directly via Welshare API using derived session key
      const apiResponse = await WelshareApi.submitData(
        storageKey.sessionKeyPair,
        submissionPayload,
        environment
      );

      console.log("Submission response:", apiResponse);
      toast.success("Submitted to Welshare");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitForm };
};
