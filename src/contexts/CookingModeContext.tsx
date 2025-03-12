
import React, { createContext, useContext, useState } from 'react';
import { Step } from '@/types/Recipe';

interface CookingModeContextType {
  isActive: boolean;
  currentStep: number;
  startCooking: () => void;
  stopCooking: () => void;
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStepIndex: (index: number) => void;
}

const CookingModeContext = createContext<CookingModeContextType | undefined>(undefined);

export function CookingModeProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startCooking = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const stopCooking = () => {
    setIsActive(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const setCurrentStepIndex = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <CookingModeContext.Provider value={{
      isActive,
      currentStep,
      startCooking,
      stopCooking,
      nextStep,
      previousStep,
      setCurrentStepIndex,
    }}>
      {children}
    </CookingModeContext.Provider>
  );
}

export const useCookingMode = () => {
  const context = useContext(CookingModeContext);
  if (context === undefined) {
    throw new Error('useCookingMode must be used within a CookingModeProvider');
  }
  return context;
};
