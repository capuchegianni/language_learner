export interface ExerciseOneComponentProps {
  instruction: string;
  targetWords: string[];
  type?: string;
  subjectPronouns?: string[];
  answers: string[];
  onAnswerChange: (index: number, value: string) => void;
}
