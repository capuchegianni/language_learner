export type StepPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
export type ScrollBlock = 'start' | 'center' | 'end' | 'top' | 'none';

export interface TutorialStep {
  id: string;
  targetSelector: string;
  route: string;
  badge: string;
  title: string;
  description: string;
  placement?: StepPlacement;
  iconName?: string;
  highlightPadding?: number;
  scrollBlock?: ScrollBlock;
  scrollOffset?: number;
}


export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface TutorialContextType {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TutorialStep | null;
  totalSteps: number;
  steps: TutorialStep[];
  hasCompletedTutorial: boolean;
  startTutorial: (initialStepIndex?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  goToStep: (index: number) => void;
}
