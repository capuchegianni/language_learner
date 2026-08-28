import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { Lesson, LessonContent, ProposedRule, GradingResult } from '../../types';
import { Check, Copy, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

import { ProposalPhase } from './ProposalPhase';
import { ExercisePhase } from './ExercisePhase';
import { AIFeedbackDisplay } from '../../components/lesson/AIFeedbackDisplay';
import { RuleExplanation } from '../../components/lesson/RuleExplanation';
import { WordsLearned } from '../../components/lesson/WordsLearned';

export const NewLesson: React.FC = () => {
  const { id: resumeLessonId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // Phase state: 'PROPOSAL' | 'GENERATED_WORKSPACE' | 'GRADED'
  const [phase, setPhase] = useState<'PROPOSAL' | 'GENERATED_WORKSPACE' | 'GRADED'>('PROPOSAL');

  // Proposal data state
  const [proposals, setProposals] = useState<ProposedRule[]>([]);
  const [reviewRule, setReviewRule] = useState<{ id: string; title: string; explanation: string } | null>(null);
  const [selectedRuleTitle, setSelectedRuleTitle] = useState<string>('');
  const [isReviewSelection, setIsReviewSelection] = useState<boolean>(false);
  const [wordsCount, setWordsCount] = useState<number>(5);
  const [loadingProposals, setLoadingProposals] = useState<boolean>(true);

  // Lesson state
  const [generatingLesson, setGeneratingLesson] = useState<boolean>(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [activeTab, setActiveTab] = useState<'interactive' | 'raw_prompt'>('interactive');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Submission state
  const [ex1Answers, setEx1Answers] = useState<string[]>([]);
  const [ex2Answers, setEx2Answers] = useState<string[]>([]);
  const [ex3Answer, setEx3Answer] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Grading result state
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

  // Global Error state
  const [error, setError] = useState<string | null>(null);

  // Single card loading state
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const loadSavedAnswers = (lessonId: string) => {
    const saved = localStorage.getItem(`lesson_answers_${lessonId}`);
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        if (parsedSaved.ex1) setEx1Answers(parsedSaved.ex1);
        if (parsedSaved.ex2) setEx2Answers(parsedSaved.ex2);
        if (parsedSaved.ex3) setEx3Answer(parsedSaved.ex3);
      } catch (e) {
        console.error('Failed to parse saved answers', e);
      }
    } else {
      setEx1Answers([]);
      setEx2Answers([]);
      setEx3Answer('');
    }
  };

  // Fetch proposals from database/AI
  const fetchProposals = async (forceRefresh: boolean = false) => {
    try {
      setError(null);
      setLoadingProposals(true);
      const res = await api.getRuleProposals({ refresh: forceRefresh });
      setProposals(res.proposedNewRules);
      setReviewRule(res.reviewRuleOption);
      if (res.proposedNewRules.length > 0) {
        setSelectedRuleTitle(res.proposedNewRules[0].title);
        setIsReviewSelection(false);
      }
    } catch (err: any) {
      console.error('Failed to fetch rule proposals', err);
      setError(err.response?.data?.message || 'Failed to fetch AI rule proposals. Please check your AI API key and model settings.');
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleReplaceProposal = async (indexToReplace: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setError(null);
      setReplacingIndex(indexToReplace);
      const res = await api.replaceProposal(indexToReplace);
      setProposals(res.proposedNewRules);
      if (res.reviewRuleOption) {
        setReviewRule(res.reviewRuleOption);
      }
      if (selectedRuleTitle === proposals[indexToReplace]?.title && res.proposedNewRules[indexToReplace]) {
        setSelectedRuleTitle(res.proposedNewRules[indexToReplace].title);
      }
    } catch (err: any) {
      console.error('Failed to replace proposal', err);
      setError(err.response?.data?.message || 'Failed to fetch AI rule proposal. Please check your AI API key and model settings.');
    } finally {
      setReplacingIndex(null);
    }
  };

  useEffect(() => {
    if (resumeLessonId) {
      const fetchResumedLesson = async () => {
        try {
          setError(null);
          setLoadingProposals(true);
          const lesson = await api.getLessonById(resumeLessonId);
          setCurrentLesson(lesson);
          const parsed: LessonContent = JSON.parse(lesson.lessonData);
          setLessonContent(parsed);
          setSelectedRuleTitle(lesson.rule?.title || lesson.title || '');
          loadSavedAnswers(lesson.id);
          if (lesson.status === 'GRADED' && lesson.aiFeedback) {
            setGradingResult(JSON.parse(lesson.aiFeedback));
            setPhase('GRADED');
          } else {
            setPhase('GENERATED_WORKSPACE');
          }
        } catch (err: any) {
          console.error('Failed to load resumed lesson', err);
          setError('Failed to load resumed lesson.');
        } finally {
          setLoadingProposals(false);
        }
      };
      fetchResumedLesson();
    } else {
      // Reset all in-progress lesson state when returning to /lessons/new
      setPhase('PROPOSAL');
      setCurrentLesson(null);
      setLessonContent(null);
      setGradingResult(null);
      setEx1Answers([]);
      setEx2Answers([]);
      setEx3Answer('');
      setImageFiles([]);
      setImagePreviews([]);
      setSubmitting(false);
      setGeneratingLesson(false);
      fetchProposals();
    }
  }, [resumeLessonId, location.pathname]);

  const handleSelectRule = (title: string, isReview: boolean = false) => {
    setSelectedRuleTitle(title);
    setIsReviewSelection(isReview);
  };

  const handleGenerateLesson = async () => {
    if (!selectedRuleTitle) return;
    try {
      setError(null);
      setGeneratingLesson(true);
      const lesson = await api.generateLesson({
        ruleTitle: selectedRuleTitle,
        wordsCount,
        isReview: isReviewSelection,
      });
      const parsed: LessonContent = JSON.parse(lesson.lessonData);
      setLessonContent(parsed);
      loadSavedAnswers(lesson.id);
      setCurrentLesson(lesson);
      setPhase('GENERATED_WORKSPACE');
      navigate(`/lessons/${lesson.id}/resume`, { replace: true });
    } catch (err: any) {
      console.error('Error generating lesson', err);
      setError(err.response?.data?.message || 'Failed to generate lesson. Please check your AI API configuration.');
    } finally {
      setGeneratingLesson(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = [...imageFiles, ...files].slice(0, 3);

      const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 5 * 1024 * 1024) {
        alert('Total image size cannot exceed 5MB.');
        return;
      }

      setImageFiles(newFiles);
      setImagePreviews(newFiles.map(file => URL.createObjectURL(file)));
    }
  };

  const handleCopyPrompt = () => {
    if (currentLesson?.rawPrompt) {
      navigator.clipboard.writeText(currentLesson.rawPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  const handleSubmitExercises = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!currentLesson) return;

    try {
      setError(null);
      setSubmitting(true);
      const formattedEx1 = lessonContent?.exercise1.targetWords?.map((word, i) => `${word}: ${ex1Answers[i] || ''}`).join('\n') || '';
      const formattedEx2 = lessonContent?.exercise2.sentencesToTranslate?.map((sentence, i) => `${sentence}: ${ex2Answers[i] || ''}`).join('\n') || '';

      const updatedLesson = await api.submitLesson(
        currentLesson.id,
        { ex1: formattedEx1, ex2: formattedEx2, ex3: ex3Answer },
        imageFiles.length > 0 ? imageFiles : null,
      );
      setCurrentLesson(updatedLesson);
      if (updatedLesson.aiFeedback) {
        const feedback: GradingResult = JSON.parse(updatedLesson.aiFeedback);
        setGradingResult(feedback);
      }
      setPhase('GRADED');
      localStorage.removeItem(`lesson_answers_${currentLesson.id}`);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Submission failed', err);
      setError(err.response?.data?.message || 'Failed to grade submission. Please check your AI API configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentLesson?.id && phase === 'GENERATED_WORKSPACE') {
      const data = { ex1: ex1Answers, ex2: ex2Answers, ex3: ex3Answer };
      localStorage.setItem(`lesson_answers_${currentLesson.id}`, JSON.stringify(data));
    }
  }, [ex1Answers, ex2Answers, ex3Answer, currentLesson?.id, phase]);

  return (
    <div className="tutorial-lesson-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Step Indicator Header */}
      <div className="step-indicator-container">
        <div className={`step-indicator-item ${phase === 'PROPOSAL' ? 'active' : 'completed'}`}>
          <div className="step-badge">1</div>
          <span className="step-label">Pick Daily Rule</span>
          <span className="step-label-mobile">Rule</span>
        </div>
        <ChevronRight size={16} className="step-separator" />
        <div className={`step-indicator-item ${phase === 'GENERATED_WORKSPACE' ? 'active' : phase === 'GRADED' ? 'completed' : 'pending'}`}>
          <div className="step-badge">2</div>
          <span className="step-label">Practice Exercises</span>
          <span className="step-label-mobile">Exercises</span>
        </div>
        <ChevronRight size={16} className="step-separator" />
        <div className={`step-indicator-item ${phase === 'GRADED' ? 'completed' : 'pending'}`}>
          <div className="step-badge">3</div>
          <span className="step-label">AI Feedback &amp; Score</span>
          <span className="step-label-mobile">Results</span>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#fff', marginBottom: '1.5rem' }}>
          <strong style={{ color: '#fca5a5', display: 'block', marginBottom: '0.25rem' }}>AI Processing Error</strong>
          <span style={{ fontSize: '0.9rem', color: '#fecaca' }}>{error}</span>
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
        <div>
          <WordsLearned lessonContent={lessonContent} />
          <RuleExplanation lessonContent={lessonContent} />

          <div className="lesson-tab-buttons" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button className={`btn ${activeTab === 'interactive' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('interactive')}>Interactive Exercise</button>
            <button className={`btn ${activeTab === 'raw_prompt' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('raw_prompt')}>View Raw Compiled Prompt</button>
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
              clearImages={() => { setImageFiles([]); setImagePreviews([]); }}
              submitting={submitting}
              onSubmit={handleSubmitExercises}
              onBack={() => {
                if (resumeLessonId) {
                  navigate(-1);
                } else {
                  setPhase('PROPOSAL');
                }
              }}
            />
          )}

          {activeTab === 'raw_prompt' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Raw Compiled Lesson Prompt</h3>
                <button className="btn btn-primary" onClick={handleCopyPrompt}>
                  {copiedPrompt ? <Check size={18} /> : <Copy size={18} />}
                  <span>{copiedPrompt ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                This is the exact prompt formatted with your known word bank, known rules, and today's rule. You can copy it to ChatGPT, Claude, or any external AI interface if desired.
              </p>
              <pre className="code-block">
                {currentLesson?.rawPrompt}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: GRADED FEEDBACK & CORRECTIONS */}
      {phase === 'GRADED' && gradingResult && (
        <div>
          <AIFeedbackDisplay
            gradingResult={gradingResult}
            userSubmission={
              currentLesson?.userSubmission
                ? (typeof currentLesson.userSubmission === 'string'
                  ? JSON.parse(currentLesson.userSubmission)
                  : currentLesson.userSubmission)
                : null
            }
            lessonContent={lessonContent}
            title="Lesson Evaluation Complete!"
          />

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem' }}
              onClick={() => navigate('/')}
            >
              Finish Lesson & Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
