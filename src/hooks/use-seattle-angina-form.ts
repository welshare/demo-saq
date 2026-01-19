import { useState, useMemo } from "react";

export interface FormData {
  [key: string]: string | number;
}

// All required choice question linkIds from the Seattle Angina Questionnaire
const REQUIRED_QUESTION_IDS = [
  "94952", // Walking indoors on level ground
  "94953", // Gardening, vacuuming or carrying groceries
  "94954", // Lifting or moving heavy objects
  "94955", // Chest pain frequency
  "94956", // Nitroglycerin usage
  "94957", // Enjoyment of life limitation
  "94959", // Satisfaction with current state
];

export const useSeattleAnginaForm = () => {
  const [formData, setFormData] = useState<FormData>({});

  const handleInputChange = (linkId: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [linkId]: value,
    }));
  };

  const isFormComplete = useMemo(() => {
    return REQUIRED_QUESTION_IDS.every(
      (linkId) => formData[linkId] !== undefined && formData[linkId] !== ""
    );
  }, [formData]);

  return {
    formData,
    setFormData,
    handleInputChange,
    isFormComplete,
  };
};

