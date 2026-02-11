import { SeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";
import type { QuestionnaireResponse } from "@welshare/questionnaire";
import questionnaireData from "../seattle_angina.json";

// Build a submission-ready FHIR QuestionnaireResponse by taking the library's
// response object and appending calculated score items
export const buildQuestionnaireResponse = (
  libraryResponse: QuestionnaireResponse,
  scores: SeattleAnginaScores
): QuestionnaireResponse | null => {
  if (!libraryResponse.item || libraryResponse.item.length === 0) return null;

  // Filter out any existing score items (we'll re-add with calculated values)
  const scoreIds = new Set(["94960", "94961", "94962", "94963"]);
  const responseItems = libraryResponse.item.filter(
    (item) => !scoreIds.has(item.linkId)
  );

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
  ].filter(Boolean) as QuestionnaireResponse["item"] & object[];

  return {
    resourceType: "QuestionnaireResponse",
    questionnaire: process.env.NEXT_PUBLIC_WELSHARE_QUESTIONNAIRE_ID || questionnaireData.url,
    status: "completed",
    item: [...responseItems, ...scoreItems],
  };
};
