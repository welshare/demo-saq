import { FormData } from "./use-seattle-angina-form";

export interface SeattleAnginaScores {
  physicalLimitationScore: number | null;
  overallSummaryScore: number | null;
}

// Example: Calculate scores from questionnaire responses to include in submission
export const useSeattleAnginaScores = (formData: FormData): SeattleAnginaScores => {
  // Physical limitation: average of activity limitation responses (94952, 94953, 94954)
  // Response codes map to 1-5 scale where higher = less limited
  const limitationIds = ["94952", "94953", "94954"];
  const scores = limitationIds
    .map((id) => {
      const code = formData[id] as string;
      // Simple ordinal mapping: first option = 1, last = 5
      const codeToScore: Record<string, number> = {
        "LA27701-4": 1, "LA27702-2": 2, "LA6460-5": 3,
        "LA9605-2": 4, "LA27707-1": 5, "LA27708-9": 1,
      };
      return codeToScore[code] ?? null;
    })
    .filter((s): s is number => s !== null);

  const physicalLimitationScore = scores.length > 0
    ? ((scores.reduce((a, b) => a + b, 0) / scores.length - 1) / 4) * 100
    : null;

  // Overall summary: just use physical limitation for simplicity
  const overallSummaryScore = physicalLimitationScore;

  return { physicalLimitationScore, overallSummaryScore };
};
