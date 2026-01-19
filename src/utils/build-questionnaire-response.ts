import { FormData } from "@/hooks/use-seattle-angina-form";
import { SeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";
import questionnaireData from "../seattle_angina.json";

// Build a FHIR QuestionnaireResponse from form data and calculated scores
export interface QuestionnaireResponse {
  resourceType: "QuestionnaireResponse";
  questionnaire: string;
  status: string;
  item: Array<{
    linkId: string;
    answer?: Array<{
      valueCoding?: { system: string; code: string; display: string };
      valueDecimal?: number;
    }>;
  }>;
}

const findQuestionByLinkId = (linkId: string): any => {
  for (const item of questionnaireData.item) {
    if (item.linkId === linkId) return item;
    if (item.item) {
      for (const subItem of item.item) {
        if (subItem.linkId === linkId) return subItem;
      }
    }
  }
  return null;
};

export const buildQuestionnaireResponse = (
  formData: FormData,
  scores: SeattleAnginaScores
): QuestionnaireResponse | null => {
  if (Object.keys(formData).length === 0) return null;

  // Convert form responses to FHIR format
  const responseItems = Object.entries(formData)
    .map(([linkId, value]) => {
      const question = findQuestionByLinkId(linkId);
      if (question?.type === "choice" && typeof value === "string") {
        const option = question.answerOption?.find(
          (opt: { valueCoding?: { code: string } }) => opt.valueCoding?.code === value
        );
        return option ? { linkId, answer: [{ valueCoding: option.valueCoding }] } : null;
      }
      return null;
    })
    .filter(Boolean);

  // Add calculated scores as decimal values
  const scoreItems = [
    scores.physicalLimitationScore !== null && {
      linkId: "94960",
      answer: [{ valueDecimal: Number(scores.physicalLimitationScore.toFixed(2)) }],
    },
    scores.overallSummaryScore !== null && {
      linkId: "94963",
      answer: [{ valueDecimal: Number(scores.overallSummaryScore.toFixed(2)) }],
    },
  ].filter(Boolean);

  return {
    resourceType: "QuestionnaireResponse",
    questionnaire: process.env.NEXT_PUBLIC_WELSHARE_QUESTIONNAIRE_ID || questionnaireData.url,
    status: "completed",
    item: [...responseItems, ...scoreItems] as QuestionnaireResponse["item"],
  };
};
