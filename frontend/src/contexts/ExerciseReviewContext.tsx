import React, { createContext, useContext, useMemo, useState } from 'react';
import { GradingResult, StructuredCorrection } from '../types';
import { CorrectionModal } from '../components/GradedPrimitives/CorrectionModal';

export interface ExerciseReviewContextValue {
  isReviewMode: boolean;
  gradingResult?: GradingResult | null;
  getCorrectionsForInput: (exerciseNumber: number, inputId: string) => StructuredCorrection[];
  hasLegacyCorrections: (exerciseNumber: number) => boolean;
  getLegacyCorrections: (exerciseNumber: number) => string[];
  openCorrectionModal: (correction: StructuredCorrection | StructuredCorrection[]) => void;
  closeCorrectionModal: () => void;
  activeCorrection: StructuredCorrection | StructuredCorrection[] | null;
}

const ExerciseReviewContext = createContext<ExerciseReviewContextValue>({
  isReviewMode: false,
  gradingResult: null,
  getCorrectionsForInput: () => [],
  hasLegacyCorrections: () => false,
  getLegacyCorrections: () => [],
  openCorrectionModal: () => {},
  closeCorrectionModal: () => {},
  activeCorrection: null,
});

export interface ExerciseReviewProviderProps {
  isReviewMode?: boolean;
  gradingResult?: GradingResult | null;
  children: React.ReactNode;
}

export const ExerciseReviewProvider: React.FC<ExerciseReviewProviderProps> = ({
  isReviewMode = false,
  gradingResult = null,
  children,
}) => {
  const [activeCorrection, setActiveCorrection] = useState<StructuredCorrection | StructuredCorrection[] | null>(null);

  const openCorrectionModal = (correction: StructuredCorrection | StructuredCorrection[]) => {
    setActiveCorrection(correction);
  };

  const closeCorrectionModal = () => {
    setActiveCorrection(null);
  };

  const value = useMemo<ExerciseReviewContextValue>(() => {
    const getExerciseFeedback = (exerciseNumber: number) => {
      if (!gradingResult) return null;
      if (exerciseNumber === 1) return gradingResult.exercise1;
      if (exerciseNumber === 2) return gradingResult.exercise2;
      if (exerciseNumber === 3) return gradingResult.exercise3;
      return null;
    };

    const getCorrectionsForInput = (exerciseNumber: number, inputId: string): StructuredCorrection[] => {
      const ex = getExerciseFeedback(exerciseNumber);
      if (!ex || !Array.isArray(ex.corrections) || ex.hasLegacyCorrections) return [];
      return ex.corrections.filter((c) => c && c.inputId === inputId);
    };

    const hasLegacyCorrections = (exerciseNumber: number): boolean => {
      const ex = getExerciseFeedback(exerciseNumber);
      return !!ex?.hasLegacyCorrections;
    };

    const getLegacyCorrections = (exerciseNumber: number): string[] => {
      const ex = getExerciseFeedback(exerciseNumber);
      return ex?.legacyCorrections || [];
    };

    return {
      isReviewMode,
      gradingResult,
      getCorrectionsForInput,
      hasLegacyCorrections,
      getLegacyCorrections,
      openCorrectionModal,
      closeCorrectionModal,
      activeCorrection,
    };
  }, [isReviewMode, gradingResult, activeCorrection]);

  return (
    <ExerciseReviewContext.Provider value={value}>
      {children}
      <CorrectionModal
        isOpen={Boolean(activeCorrection)}
        correction={activeCorrection}
        onClose={closeCorrectionModal}
      />
    </ExerciseReviewContext.Provider>
  );
};

export const useExerciseReview = (): ExerciseReviewContextValue => {
  return useContext(ExerciseReviewContext);
};

