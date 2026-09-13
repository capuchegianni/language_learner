import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNewLessonState } from './hooks/useNewLessonState';
import {
  StepIndicator,
  ProposalPhase,
  ExercisePhase,
  RuleExplanation,
  WordsLearned,
  LessonDetail,
} from './components';
import { CodeBlock } from '../../components/CodeBlock';
import './NewLesson.css';

export const NewLesson: React.FC = () => {
  const { id: resumeLessonId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    phase,
    proposals,
    reviewRule,
    selectedRuleTitle,
    isReviewSelection,
    wordsCount,
    setWordsCount,
    loadingProposals,
    replacingIndex,
    generatingLesson,
    currentLesson,
    lessonContent,
    activeTab,
    setActiveTab,
    ex1Answers,
    setEx1Answers,
    ex2Answers,
    setEx2Answers,
    ex3Answer,
    setEx3Answer,
    imageFiles,
    imagePreviews,
    submitting,
    gradingResult,
    error,

    fetchProposals,
    handleSelectRule,
    handleReplaceProposal,
    handleGenerateLesson,
    handleImageChange,
    clearImages,
    handleSubmitExercises,
    handleBackFromExercises,
  } = useNewLessonState(resumeLessonId);

  return (
    <div className="new-lesson-container">
      {/* Step Indicator Header */}
      <StepIndicator phase={phase} />

      {/* Error Alert */}
      {error && (
        <div className="new-lesson-error-box">
          <strong className="new-lesson-error-title">AI Processing Error</strong>
          <span className="new-lesson-error-desc">{error}</span>
        </div>
      )}

      {/* PHASE 1: RULE PROPOSALS & SELECTION */}
      {phase === 'PROPOSAL' && (
        <ProposalPhase
          proposals={proposals}
          reviewRule={reviewRule}
          selectedRuleTitle={selectedRuleTitle}
          isReviewSelection={isReviewSelection}
          wordsCount={wordsCount}
          setWordsCount={setWordsCount}
          loadingProposals={loadingProposals}
          replacingIndex={replacingIndex}
          onSelectRule={handleSelectRule}
          onReplaceProposal={handleReplaceProposal}
          onGenerateLesson={handleGenerateLesson}
          generatingLesson={generatingLesson}
          fetchProposals={fetchProposals}
        />
      )}

      {/* PHASE 2: GENERATED LESSON WORKSPACE */}
      {phase === 'GENERATED_WORKSPACE' && lessonContent && (
        <div className="new-lesson-workspace-container">
          <WordsLearned lessonContent={lessonContent} />
          <RuleExplanation lessonContent={lessonContent} />

          <div className="new-lesson-tab-buttons">
            <button
              type="button"
              className={`btn ${activeTab === 'interactive' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('interactive')}
            >
              Interactive Exercise
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'raw_prompt' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('raw_prompt')}
            >
              View Raw Compiled Prompt
            </button>
          </div>

          {activeTab === 'interactive' && (
            <ExercisePhase
              lessonContent={lessonContent}
              ex1Answers={ex1Answers}
              setEx1Answers={setEx1Answers}
              ex2Answers={ex2Answers}
              setEx2Answers={setEx2Answers}
              ex3Answer={ex3Answer}
              setEx3Answer={setEx3Answer}
              imageFiles={imageFiles}
              imagePreviews={imagePreviews}
              handleImageChange={handleImageChange}
              clearImages={clearImages}
              submitting={submitting}
              onSubmit={handleSubmitExercises}
              onBack={handleBackFromExercises}
            />
          )}

          {activeTab === 'raw_prompt' && (
            <CodeBlock
              title="Raw Compiled Lesson Prompt"
              description="This is the exact prompt formatted with your known word bank, known rules, and today's rule. You can copy it to ChatGPT, Claude, or any external AI interface if desired."
              code={currentLesson?.rawPrompt || ''}
              buttonVariant="secondary"
              copyButtonLabel="Copy Prompt"
              copiedButtonLabel="Copied to Clipboard!"
            />
          )}
        </div>
      )}

      {/* PHASE 3: GRADED FEEDBACK & CORRECTIONS */}
      {phase === 'GRADED' && currentLesson && (
        <LessonDetail
          lesson={currentLesson}
          showBackBtn={false}
          showFinishBtn={true}
          feedbackTitle="Lesson Evaluation Complete!"
          onFinish={() => navigate('/')}
        />
      )}
    </div>
  );
};

export default NewLesson;
