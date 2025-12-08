'use client'

import { Schemas, useWelshare, WelshareLogo } from '@welshare/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import questionnaireData from '../seattle_angina.json';

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

interface QuestionnaireResponse {
  resourceType: 'QuestionnaireResponse';
  id?: string;
  questionnaire: string;
  status: string;
  subject?: any;
  authored?: string;
  author?: any;
  item: FormAnswer[];
}

export default function SeattleAnginaForm() {
  const [formData, setFormData] = useState<{ [key: string]: string | number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { submitData, isConnected, openWallet } = useWelshare({
    applicationId: process.env.NEXT_PUBLIC_WELSHARE_APP_ID!,
    apiBaseUrl: "http://localhost:3000",
    callbacks: {
      onUploaded: (payload) => {
        console.log('Data uploaded successfully:', payload);
        toast.success('Success!', {
          description: 'Your Seattle Angina Questionnaire response has been successfully submitted to your Welshare wallet!',
          duration: 5000,
        });
        setFormData({});
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error('Error uploading data:', error);
        // Only show error toast if we were actually submitting data
        if (isSubmitting) {
          toast.error('Submission Failed', {
            description: 'There was an error submitting your data. Please try again.',
            duration: 5000,
          });
          setIsSubmitting(false);
        }
      },
      onSessionReady: (storageKey) => {
        console.log('Session ready:', storageKey);
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.warning('Connection Required', {
        description: 'Please connect your Welshare wallet first.',
        duration: 3000,
      });
      return;
    }

    if (Object.keys(formData).length === 0) {
      toast.warning('Form Incomplete', {
        description: 'Please answer at least one question before submitting.',
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Create response items from form data
    const responseItems = Object.entries(formData).map(([linkId, value]) => {
      const questionItem = findQuestionByLinkId(linkId);
      
      if (questionItem?.type === 'choice' && typeof value === 'string') {
        const option = questionItem.answerOption?.find(opt => 
          opt.valueCoding?.code === value
        );
        
        return {
          linkId,
          answer: option ? [{
            valueCoding: option.valueCoding
          }] : undefined
        };
      } else if (questionItem?.type === 'decimal' && typeof value === 'number') {
        return {
          linkId,
          answer: [{
            valueDecimal: value
          }]
        };
      }
      
      return { linkId };
    }).filter(item => item.answer);

    // Add calculated scores to the decimal fields
    const scoreItems = [
      {
        linkId: '94960', // Physical limitation score
        answer: physicalLimitationScore !== null ? [{ valueDecimal: Number(physicalLimitationScore.toFixed(2)) }] : undefined
      },
      {
        linkId: '94961', // Symptom frequency score  
        answer: symptomFrequencyScore !== null ? [{ valueDecimal: Number(symptomFrequencyScore.toFixed(2)) }] : undefined
      },
      {
        linkId: '94962', // Quality of life score
        answer: qualityOfLifeScore !== null ? [{ valueDecimal: Number(qualityOfLifeScore.toFixed(2)) }] : undefined
      },
      {
        linkId: '94963', // Overall summary score
        answer: overallSummaryScore !== null ? [{ valueDecimal: Number(overallSummaryScore.toFixed(2)) }] : undefined
      }
    ].filter(item => item.answer);

    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      questionnaire: process.env.NEXT_PUBLIC_WELSHARE_QUESTIONNAIRE_ID || questionnaireData.url,
      status: 'completed',
      item: [...responseItems, ...scoreItems]
    };

    console.log('Submitting QuestionnaireResponse:', JSON.stringify(response, null, 2));
    
    try {
      await submitData(Schemas.QuestionnaireResponse, response);
    } catch (error) {
      console.error('Failed to submit data:', error);
      toast.error('Submission Failed', {
        description: 'There was an error submitting your data. Please try again.',
        duration: 5000,
      });
      setIsSubmitting(false);
    } 
  };

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

  const handleInputChange = (linkId: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [linkId]: value
    }));
  };

  // Seattle Angina Questionnaire scoring functions
  const calculatePhysicalLimitationScore = (responses: { [key: string]: string | number }) => {
    // Physical limitation scale is based on the activity limitations group (linkId: 94950)
    // Get responses for the 3 physical limitation questions: 94952, 94953, 94954
    const limitationQuestions = ['94952', '94953', '94954'];
    let totalScore = 0;
    let answeredQuestions = 0;

    limitationQuestions.forEach(linkId => {
      if (responses[linkId]) {
        const code = responses[linkId] as string;
        // Map LOINC codes to ordinal values (1-6, where 1 = most limited, 6 = least limited)
        const scoreMap: { [key: string]: number } = {
          'LA27701-4': 1, // Extremely limited
          'LA27702-2': 2, // Quite a bit limited  
          'LA6460-5': 3,  // Moderately limited
          'LA9605-2': 4,  // Slightly limited
          'LA27707-1': 5, // Not at all limited
          'LA27708-9': 1  // Limited for other reasons (treat as most limited)
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

  const calculateSymptomFrequencyScore = (responses: { [key: string]: string | number }) => {
    // Based on anginal frequency questions: 94955 (chest pain frequency) and 94956 (nitroglycerin frequency)
    const frequencyQuestions = ['94955', '94956'];
    let totalScore = 0;
    let answeredQuestions = 0;

    frequencyQuestions.forEach(linkId => {
      if (responses[linkId]) {
        const code = responses[linkId] as string;
        // Map frequency codes to ordinal values (1 = most frequent, 6 = least frequent)
        const scoreMap: { [key: string]: number } = {
          'LA28518-1': 1, // 4 or more times per day
          'LA25000-3': 2, // 1-3 times per day
          'LA27770-9': 3, // 3 or more times per week but not every day
          'LA13834-9': 4, // 1-2 times per week
          'LA27722-0': 5, // Less than once a week
          'LA28522-3': 6  // None over the past 4 weeks
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

  const calculateQualityOfLifeScore = (responses: { [key: string]: string | number }) => {
    // Based on disease perception question: 94957 (impact on enjoyment of life)
    if (!responses['94957']) return null;

    const code = responses['94957'] as string;
    const scoreMap: { [key: string]: number } = {
      'LA27745-1': 1, // Extremely limited enjoyment
      'LA27746-9': 2, // Limited quite a bit
      'LA27747-7': 3, // Moderately limited
      'LA27748-5': 4, // Slightly limited
      'LA27749-3': 5  // Not limited at all
    };

    const score = scoreMap[code];
    if (!score) return null;

    return ((score - 1) / (5 - 1)) * 100;
  };

  const calculateOverallSummaryScore = (physicalScore: number | null, frequencyScore: number | null, qualityScore: number | null) => {
    const scores = [physicalScore, frequencyScore, qualityScore].filter(s => s !== null) as number[];
    if (scores.length === 0) return null;
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Calculate all scores whenever form data changes
  const physicalLimitationScore = calculatePhysicalLimitationScore(formData);
  const symptomFrequencyScore = calculateSymptomFrequencyScore(formData);
  const qualityOfLifeScore = calculateQualityOfLifeScore(formData);
  const overallSummaryScore = calculateOverallSummaryScore(physicalLimitationScore, symptomFrequencyScore, qualityOfLifeScore);

  const renderQuestion = (question: any) => {
    if (question.type === 'group') {
      return (
        <div key={question.linkId} className="form-field">
          <div className="form-label">{question.text}</div>
          {question.item?.map((subQuestion: any) => renderQuestion(subQuestion))}
        </div>
      );
    }

    if (question.type === 'choice') {
      return (
        <div key={question.linkId} className="form-field">
          <label className="form-label">{question.text}</label>
          <select 
            className="form-select"
            value={formData[question.linkId] || ''}
            onChange={(e) => handleInputChange(question.linkId, e.target.value)}
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

    if (question.type === 'decimal') {
      return (
        <div key={question.linkId} className="form-field">
          <label className="form-label">{question.text}</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={formData[question.linkId] || ''}
            onChange={(e) => handleInputChange(question.linkId, parseFloat(e.target.value))}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="form-container">
      <h1 className="form-title">{questionnaireData.title}</h1>
      
      {!isConnected && (
        <div className="form-field" style={{ textAlign: 'center' }}>
          <p className="form-label">Connect your Welshare wallet to submit responses:</p>
          <div className="flex flex-col items-center gap-2">
            <button onClick={openWallet} className="custom-connect-button">
              <WelshareLogo />
              Connect your welshare health wallet! 
            </button>
          </div>
        </div>
      )}
      
      {isConnected && (
        <div className="form-field" style={{ textAlign: 'center' }}>
          <p className="form-label">✅ Wallet Connected! You can now fill out the form:</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {questionnaireData.item.filter(item => item.type !== 'decimal').map(item => renderQuestion(item))}
        
        {/* Show calculated scores */}
        {(physicalLimitationScore !== null || symptomFrequencyScore !== null || qualityOfLifeScore !== null || overallSummaryScore !== null) && (
          <div className="form-field">
            <h3 className="form-label" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              📊 Calculated Scores (0-100 scale)
            </h3>
            
            {physicalLimitationScore !== null && (
              <div style={{ marginBottom: '0.5rem', color: '#00ff00' }}>
                <strong>Physical Limitation Score:</strong> {physicalLimitationScore.toFixed(1)}
              </div>
            )}
            
            {symptomFrequencyScore !== null && (
              <div style={{ marginBottom: '0.5rem', color: '#00ff00' }}>
                <strong>Symptom Frequency Score:</strong> {symptomFrequencyScore.toFixed(1)}
              </div>
            )}
            
            {qualityOfLifeScore !== null && (
              <div style={{ marginBottom: '0.5rem', color: '#00ff00' }}>
                <strong>Quality of Life Score:</strong> {qualityOfLifeScore.toFixed(1)}
              </div>
            )}
            
            {overallSummaryScore !== null && (
              <div style={{ marginBottom: '0.5rem', color: '#00ff00', fontWeight: 'bold' }}>
                <strong>Overall Summary Score:</strong> {overallSummaryScore.toFixed(1)}
              </div>
            )}
            
            <p style={{ fontSize: '0.9rem', color: '#00ff00', opacity: 0.8, marginTop: '0.5rem' }}>
              Higher scores indicate better health status. Scores are automatically calculated and included in your submission.
            </p>
          </div>
        )}
        
        <div className="form-field">
          <button 
            type="submit" 
            className="form-button"
            disabled={!isConnected || isSubmitting}
            style={{ 
              opacity: isConnected && !isSubmitting ? 1 : 0.5,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <WelshareLogo />
            {isSubmitting ? 'Submitting...' : "Submit to Welshare Wallet"}
          </button>
          {!isConnected && !isSubmitting && (
            <p style={{ color: '#00ff00', marginTop: '0.5rem' }}>
              Connect your wallet to enable submission
            </p>
          )}
          {isSubmitting && (
            <p style={{ color: '#00ff00', marginTop: '0.5rem' }}>
              Submitting your response...
            </p>
          )}
        </div>
      </form>
    </div>
  );
}