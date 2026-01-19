"use client";

import { FormData } from "@/hooks/use-seattle-angina-form";

interface QuestionnaireRendererProps {
  questionnaireData: any;
  formData: FormData;
  onInputChange: (linkId: string, value: string | number) => void;
}

export default function QuestionnaireRenderer({
  questionnaireData,
  formData,
  onInputChange,
}: QuestionnaireRendererProps) {
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

  const renderQuestion = (question: any) => {
    if (question.type === "group") {
      return (
        <div key={question.linkId} className="form-field">
          <div className="form-label">{question.text}</div>
          {question.item?.map((subQuestion: any) =>
            renderQuestion(subQuestion)
          )}
        </div>
      );
    }

    if (question.type === "choice") {
      return (
        <div key={question.linkId} className="form-field">
          <label className="form-label">{question.text}</label>
          <select
            className="form-select"
            value={formData[question.linkId] || ""}
            onChange={(e) => onInputChange(question.linkId, e.target.value)}
          >
            <option value="">Select an option...</option>
            {question.answerOption?.map((option: any, idx: number) => (
              <option key={idx} value={option.valueCoding?.code}>
                {option.valueCoding?.display}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (question.type === "decimal") {
      return (
        <div key={question.linkId} className="form-field">
          <label className="form-label">{question.text}</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={formData[question.linkId] || ""}
            onChange={(e) =>
              onInputChange(question.linkId, parseFloat(e.target.value))
            }
          />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {questionnaireData.item
        .filter((item: any) => item.type !== "decimal")
        .map((item: any) => renderQuestion(item))}
    </>
  );
}

