import { useState } from "react";

export interface FormData {
  [key: string]: string | number;
}

export const useSeattleAnginaForm = () => {
  const [formData, setFormData] = useState<FormData>({});

  const handleInputChange = (linkId: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [linkId]: value,
    }));
  };

  return {
    formData,
    setFormData,
    handleInputChange,
  };
};

