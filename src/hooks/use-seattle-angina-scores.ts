import { FormData } from "./use-seattle-angina-form";

export interface SeattleAnginaScores {
  physicalLimitationScore: number | null;
  symptomFrequencyScore: number | null;
  qualityOfLifeScore: number | null;
  overallSummaryScore: number | null;
}

export const useSeattleAnginaScores = (formData: FormData): SeattleAnginaScores => {
  const calculatePhysicalLimitationScore = (responses: FormData) => {
    // Physical limitation scale is based on the activity limitations group (linkId: 94950)
    // Get responses for the 3 physical limitation questions: 94952, 94953, 94954
    const limitationQuestions = ["94952", "94953", "94954"];
    let totalScore = 0;
    let answeredQuestions = 0;

    limitationQuestions.forEach((linkId) => {
      if (responses[linkId]) {
        const code = responses[linkId] as string;
        // Map LOINC codes to ordinal values (1-6, where 1 = most limited, 6 = least limited)
        const scoreMap: { [key: string]: number } = {
          "LA27701-4": 1, // Extremely limited
          "LA27702-2": 2, // Quite a bit limited
          "LA6460-5": 3, // Moderately limited
          "LA9605-2": 4, // Slightly limited
          "LA27707-1": 5, // Not at all limited
          "LA27708-9": 1, // Limited for other reasons (treat as most limited)
        };
        if (scoreMap[code]) {
          totalScore += scoreMap[code];
          answeredQuestions++;
        }
      }
    });

    if (answeredQuestions === 0) return null;

    // Calculate mean score and transform to 0-100 scale
    const meanScore = totalScore / answeredQuestions;
    return ((meanScore - 1) / (5 - 1)) * 100;
  };

  const calculateSymptomFrequencyScore = (responses: FormData) => {
    // Based on anginal frequency questions: 94955 (chest pain frequency) and 94956 (nitroglycerin frequency)
    const frequencyQuestions = ["94955", "94956"];
    let totalScore = 0;
    let answeredQuestions = 0;

    frequencyQuestions.forEach((linkId) => {
      if (responses[linkId]) {
        const code = responses[linkId] as string;
        // Map frequency codes to ordinal values (1 = most frequent, 6 = least frequent)
        const scoreMap: { [key: string]: number } = {
          "LA28518-1": 1, // 4 or more times per day
          "LA25000-3": 2, // 1-3 times per day
          "LA27770-9": 3, // 3 or more times per week but not every day
          "LA13834-9": 4, // 1-2 times per week
          "LA27722-0": 5, // Less than once a week
          "LA28522-3": 6, // None over the past 4 weeks
        };
        if (scoreMap[code]) {
          totalScore += scoreMap[code];
          answeredQuestions++;
        }
      }
    });

    if (answeredQuestions === 0) return null;

    const meanScore = totalScore / answeredQuestions;
    return ((meanScore - 1) / (6 - 1)) * 100;
  };

  const calculateQualityOfLifeScore = (responses: FormData) => {
    // Based on disease perception question: 94957 (impact on enjoyment of life)
    if (!responses["94957"]) return null;

    const code = responses["94957"] as string;
    const scoreMap: { [key: string]: number } = {
      "LA27745-1": 1, // Extremely limited enjoyment
      "LA27746-9": 2, // Limited quite a bit
      "LA27747-7": 3, // Moderately limited
      "LA27748-5": 4, // Slightly limited
      "LA27749-3": 5, // Not limited at all
    };

    const score = scoreMap[code];
    if (!score) return null;

    return ((score - 1) / (5 - 1)) * 100;
  };

  const calculateOverallSummaryScore = (
    physicalScore: number | null,
    frequencyScore: number | null,
    qualityScore: number | null
  ) => {
    const scores = [physicalScore, frequencyScore, qualityScore].filter(
      (s) => s !== null
    ) as number[];
    if (scores.length === 0) return null;

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const physicalLimitationScore = calculatePhysicalLimitationScore(formData);
  const symptomFrequencyScore = calculateSymptomFrequencyScore(formData);
  const qualityOfLifeScore = calculateQualityOfLifeScore(formData);
  const overallSummaryScore = calculateOverallSummaryScore(
    physicalLimitationScore,
    symptomFrequencyScore,
    qualityOfLifeScore
  );

  return {
    physicalLimitationScore,
    symptomFrequencyScore,
    qualityOfLifeScore,
    overallSummaryScore,
  };
};

