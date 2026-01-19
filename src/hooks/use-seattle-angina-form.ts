/**
 * Form State Management
 *
 * Manages questionnaire form data and tracks completion status.
 * Form data is passed to both submission methods.
 *
 * Uses sessionStorage to persist form data across OAuth redirects
 * (e.g., when user logs in via Google). Data is automatically
 * cleared when the browser tab is closed.
 */

import { useState, useMemo, useEffect, useCallback } from "react";

export interface FormData {
  [key: string]: string | number;
}

const STORAGE_KEY = "seattle-angina-form-draft";

// Required question IDs from the Seattle Angina Questionnaire
const REQUIRED_QUESTION_IDS = [
  "94952", // Walking indoors
  "94953", // Gardening/vacuuming
  "94954", // Lifting heavy objects
  "94955", // Chest pain frequency
  "94956", // Nitroglycerin usage
  "94957", // Enjoyment of life
  "94959", // Satisfaction
];

const loadFormData = (): FormData => {
  if (typeof window === "undefined") return {};
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const useSeattleAnginaForm = () => {
  const [formData, setFormData] = useState<FormData>(loadFormData);

  // Persist form data to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // sessionStorage might be unavailable (e.g., private browsing)
    }
  }, [formData]);

  const handleInputChange = (linkId: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [linkId]: value }));
  };

  // Clear persisted form data (call after successful submission)
  const clearFormData = useCallback(() => {
    setFormData({});
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore errors
      }
    }
  }, []);

  const isFormComplete = useMemo(() => {
    return REQUIRED_QUESTION_IDS.every(
      (linkId) => formData[linkId] !== undefined && formData[linkId] !== ""
    );
  }, [formData]);

  return { formData, setFormData, handleInputChange, isFormComplete, clearFormData };
};
