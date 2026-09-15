import React from 'react';
import { ExerciseOneComponentProps } from './types';
import { SubjectConjugationExercise } from './SubjectConjugationExercise/SubjectConjugationExercise';
import { WordInflectionExercise } from './WordInflectionExercise/WordInflectionExercise';
import { AgreementExercise } from './AgreementExercise/AgreementExercise';
import { SentenceTransformationExercise } from './SentenceTransformationExercise/SentenceTransformationExercise';
import { ClauseCombinationExercise } from './ClauseCombinationExercise/ClauseCombinationExercise';
import { ClozePatternExercise } from './ClozePatternExercise/ClozePatternExercise';
import { ContrastPairExercise } from './ContrastPairExercise/ContrastPairExercise';
import './shared.css';

export const ExerciseOneDispatcher: React.FC<ExerciseOneComponentProps> = (props) => {
  const { type, targetWords } = props;

  // Resolve type or detect based on content heuristics for backwards compatibility
  const resolvedType = React.useMemo(() => {
    if (type) return type;

    // Heuristics for older lessons without an explicit type field
    if (targetWords.some((w) => w.includes(' / '))) {
      return 'clause_connector_combination';
    }
    if (targetWords.some((w) => w.includes('___') || (w.includes('(') && w.includes(')')))) {
      if (targetWords.some((w) => w.includes('fem') || w.includes('masc') || w.includes('plur') || w.includes('sing'))) {
        return 'gender_number_agreement';
      }
      return 'cloze_pattern_insertion';
    }
    return 'stem_ending_inflection';
  }, [type, targetWords]);

  switch (resolvedType) {
    case 'subject_conjugation':
      return <SubjectConjugationExercise {...props} />;

    case 'gender_number_agreement':
      return <AgreementExercise {...props} />;

    case 'sentence_transformation':
      return <SentenceTransformationExercise {...props} />;

    case 'clause_connector_combination':
      return <ClauseCombinationExercise {...props} />;

    case 'cloze_pattern_insertion':
      return <ClozePatternExercise {...props} type={resolvedType} />;

    case 'contrast_pair_usage':
      return <ContrastPairExercise {...props} type={resolvedType} />;

    case 'stem_ending_inflection':
    case 'particle_case_attachment':
    case 'creative_sentence_production':
    default:
      return <WordInflectionExercise {...props} type={resolvedType} />;
  }
};
