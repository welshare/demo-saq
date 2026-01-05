import { buildQuestionnaireResponse } from "@/utils/build-questionnaire-response";
import { usePrivy } from "@privy-io/react-auth";
import {
  QuestionnaireResponseSchema,
  resolveEnvironment,
  SessionKeyData,
  WelshareApi,
  WelshareApiEnvironment,
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
      toast.warning("Connection Required", {
        description: "Please connect a wallet first.",
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

    if (!storageKey) {
      toast.warning("Storage Key Required", {
        description: "Please derive a storage key before submitting.",
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

    setIsSubmitting(true);

    const submissionPayload = {
      applicationId: process.env.NEXT_PUBLIC_WELSHARE_APP_ID || "",
      timestamp: new Date().toISOString(),
      schemaId: QuestionnaireResponseSchema.schemaUid,
      submission: response,
    };

    try {
      const environment = resolveEnvironment(
        process.env.NEXT_PUBLIC_WELSHARE_ENVIRONMENT || "staging"
      );
      const apiResponse = await WelshareApi.submitData(
        storageKey.sessionKeyPair,
        submissionPayload,
        environment
      );

      console.log("Submission Response:", apiResponse);
      toast.success("Data submitted successfully", {
        description:
          "Your data has been successfully submitted to your Welshare profile.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Failed to submit data:", error);
      toast.error("Submission Failed", {
        description:
          "There was an error submitting your data. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitForm,
  };
};
