import { FormData } from "@/hooks/use-seattle-angina-form";
import { SeattleAnginaScores } from "@/hooks/use-seattle-angina-scores";
import questionnaireData from "../seattle_angina.json";

interface FormAnswer {
  linkId: string;
  answer?: Array<{
    valueCoding?: {
      system: string;
      code: string;
      display: string;
    };
    valueDecimal?: number;
  }>;
}

export interface QuestionnaireResponse {
  resourceType: "QuestionnaireResponse";
  id?: string;
  questionnaire: string;
  status: string;
  subject?: any;
  authored?: string;
  author?: any;
  item: FormAnswer[];
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
  if (Object.keys(formData).length === 0) {
    return null;
  }

  // Create response items from form data
  const responseItems = Object.entries(formData)
    .map(([linkId, value]) => {
      const questionItem = findQuestionByLinkId(linkId);

      if (questionItem?.type === "choice" && typeof value === "string") {
        const option = questionItem.answerOption?.find(
          (opt: { valueCoding?: { code: string } }) =>
            opt.valueCoding?.code === value
        );

        return {
          linkId,
          answer: option
            ? [
                {
                  valueCoding: option.valueCoding,
                },
              ]
            : undefined,
        };
      } else if (
        questionItem?.type === "decimal" &&
        typeof value === "number"
      ) {
        return {
          linkId,
          answer: [
            {
              valueDecimal: value,
            },
          ],
        };
      }

      return { linkId };
    })
    .filter((item) => item.answer);

  // Add calculated scores to the decimal fields
  const scoreItems = [
    {
      linkId: "94960", // Physical limitation score
      answer:
        scores.physicalLimitationScore !== null
          ? [
              {
                valueDecimal: Number(
                  scores.physicalLimitationScore.toFixed(2)
                ),
              },
            ]
          : undefined,
    },
    {
      linkId: "94961", // Symptom frequency score
      answer:
        scores.symptomFrequencyScore !== null
          ? [
              {
                valueDecimal: Number(scores.symptomFrequencyScore.toFixed(2)),
              },
            ]
          : undefined,
    },
    {
      linkId: "94962", // Quality of life score
      answer:
        scores.qualityOfLifeScore !== null
          ? [
              {
                valueDecimal: Number(scores.qualityOfLifeScore.toFixed(2)),
              },
            ]
          : undefined,
    },
    {
      linkId: "94963", // Overall summary score
      answer:
        scores.overallSummaryScore !== null
          ? [
              {
                valueDecimal: Number(scores.overallSummaryScore.toFixed(2)),
              },
            ]
          : undefined,
    },
  ].filter((item) => item.answer);

  return {
    resourceType: "QuestionnaireResponse",
    questionnaire:
      process.env.NEXT_PUBLIC_WELSHARE_QUESTIONNAIRE_ID ||
      questionnaireData.url,
    status: "completed",
    item: [...responseItems, ...scoreItems],
  };
};

