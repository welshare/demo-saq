"use client";

// Main form component demonstrating two Welshare submission methods

import { QuestionnaireProvider } from "@welshare/questionnaire";
import type { Questionnaire } from "@welshare/questionnaire";
import questionnaireData from "../seattle_angina.json";
import QuestionnaireFormContent from "./QuestionnaireFormContent";

export default function SeattleAnginaForm() {
  return (
    <div className="form-container">
      <h1 className="form-title">{questionnaireData.title}</h1>
      <p className="form-description">
        Demo: Submit FHIR questionnaire responses to Welshare using two
        different methods.
      </p>

      <QuestionnaireProvider
        questionnaire={questionnaireData as unknown as Questionnaire}
      >
        <QuestionnaireFormContent />
      </QuestionnaireProvider>
    </div>
  );
}
