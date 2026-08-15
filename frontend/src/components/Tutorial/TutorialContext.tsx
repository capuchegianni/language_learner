import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { TUTORIAL_STEPS } from './tutorialSteps';
import { TutorialContextType, TutorialStep } from './types';

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState<boolean>(true);
  const [, setInitialized] = useState<boolean>(false);

  const checkedUserRef = useRef<string | null>(null);

  // Check if tutorial is completed for current user in the database settings
  useEffect(() => {
    if (authLoading || !user) {
      setIsActive(false);
      setInitialized(false);
      checkedUserRef.current = null;
      return;
    }

    // Only run check once per authenticated user session
    if (checkedUserRef.current === user.id) return;
    checkedUserRef.current = user.id;

    const checkTutorialStatus = async () => {
      try {
        const settingsData = await api.getSettings();
        const isCompleted = settingsData.TUTORIAL_COMPLETED === 'true';
        setHasCompletedTutorial(isCompleted);

        // If not completed in database, start the tutorial automatically
        if (!isCompleted) {
          setTimeout(() => {
            setIsActive(true);
            setCurrentStepIndex(0);
            if (location.pathname !== TUTORIAL_STEPS[0].route) {
              navigate(TUTORIAL_STEPS[0].route);
            }
          }, 600);
        }
      } catch (err) {
        console.error('Failed to check tutorial status:', err);
      } finally {
        setInitialized(true);
      }
    };

    checkTutorialStatus();
  }, [user, authLoading, location.pathname, navigate]);

  const markCompleted = useCallback(async () => {
    if (!user) return;
    try {
      setHasCompletedTutorial(true);
      await api.updateSettings({ TUTORIAL_COMPLETED: 'true' });
    } catch (err) {
      console.error('Failed to update tutorial completion setting in db:', err);
    }
  }, [user]);

  const startTutorial = useCallback(
    (initialStepIndex: number = 0) => {
      const stepIdx = Math.max(0, Math.min(initialStepIndex, TUTORIAL_STEPS.length - 1));
      setCurrentStepIndex(stepIdx);
      setIsActive(true);

      const targetRoute = TUTORIAL_STEPS[stepIdx].route;
      if (location.pathname !== targetRoute) {
        navigate(targetRoute);
      }
    },
    [location.pathname, navigate],
  );

  const goToStep = useCallback(
    (index: number) => {
      if (index < 0 || index >= TUTORIAL_STEPS.length) return;
      setCurrentStepIndex(index);

      const step = TUTORIAL_STEPS[index];
      if (location.pathname !== step.route) {
        navigate(step.route);
      }
    },
    [location.pathname, navigate],
  );

  const nextStep = useCallback(() => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      setIsActive(false);
      markCompleted();
    }
  }, [currentStepIndex, goToStep, markCompleted]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, goToStep]);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
    markCompleted();
  }, [markCompleted]);

  const currentStep: TutorialStep | null = isActive ? TUTORIAL_STEPS[currentStepIndex] || null : null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        totalSteps: TUTORIAL_STEPS.length,
        steps: TUTORIAL_STEPS,
        hasCompletedTutorial,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        goToStep,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};
