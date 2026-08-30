import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../../../services/api';
import { Lesson, LessonContent, ProposedRule, GradingResult } from '../../../types';
import { LessonPhase } from '../components/StepIndicator';

export interface UseNewLessonStateReturn {
  phase: LessonPhase;
  setPhase: (phase: LessonPhase) => void;
  proposals: ProposedRule[];
  reviewRule: { id: string; title: string; explanation: string } | null;
  selectedRuleTitle: string;
  isReviewSelection: boolean;
  wordsCount: number;
  setWordsCount: (count: number) => void;
  loadingProposals: boolean;
  replacingIndex: number | null;
  generatingLesson: boolean;
  currentLesson: Lesson | null;
  lessonContent: LessonContent | null;
  activeTab: 'interactive' | 'raw_prompt';
  setActiveTab: (tab: 'interactive' | 'raw_prompt') => void;
  ex1Answers: string[];
  setEx1Answers: React.Dispatch<React.SetStateAction<string[]>>;
  ex2Answers: string[];
  setEx2Answers: React.Dispatch<React.SetStateAction<string[]>>;
  ex3Answer: string;
  setEx3Answer: (ans: string) => void;
  imageFiles: File[];
  imagePreviews: string[];
  submitting: boolean;
  gradingResult: GradingResult | null;
  error: string | null;

  // Actions
  fetchProposals: (forceRefresh?: boolean) => Promise<void>;
  handleSelectRule: (title: string, isReview?: boolean) => void;
  handleReplaceProposal: (indexToReplace: number, e: React.MouseEvent) => Promise<void>;
  handleGenerateLesson: () => Promise<void>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearImages: () => void;
  handleSubmitExercises: (e: React.FormEvent) => Promise<void>;
  handleBackFromExercises: () => void;
}

export function useNewLessonState(resumeLessonId?: string): UseNewLessonStateReturn {
  const navigate = useNavigate();
  const location = useLocation();

  const [phase, setPhase] = useState<LessonPhase>('PROPOSAL');
  const [proposals, setProposals] = useState<ProposedRule[]>([]);
  const [reviewRule, setReviewRule] = useState<{ id: string; title: string; explanation: string } | null>(null);
  const [selectedRuleTitle, setSelectedRuleTitle] = useState<string>('');
  const [isReviewSelection, setIsReviewSelection] = useState<boolean>(false);
  const [wordsCount, setWordsCount] = useState<number>(5);
  const [loadingProposals, setLoadingProposals] = useState<boolean>(true);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const [generatingLesson, setGeneratingLesson] = useState<boolean>(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [activeTab, setActiveTab] = useState<'interactive' | 'raw_prompt'>('interactive');

  const [ex1Answers, setEx1Answers] = useState<string[]>([]);
  const [ex2Answers, setEx2Answers] = useState<string[]>([]);
  const [ex3Answer, setEx3Answer] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSavedAnswers = useCallback((lessonId: string) => {
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
  }, []);

  const fetchProposals = useCallback(async (forceRefresh: boolean = false) => {
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
      setError(
        err.response?.data?.message ||
          'Failed to fetch AI rule proposals. Please check your AI API key and model settings.',
      );
    } finally {
      setLoadingProposals(false);
    }
  }, []);

  const handleReplaceProposal = useCallback(
    async (indexToReplace: number, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        setError(null);
        setReplacingIndex(indexToReplace);
        const res = await api.replaceProposal(indexToReplace);
        setProposals(res.proposedNewRules);
        if (res.reviewRuleOption) {
          setReviewRule(res.reviewRuleOption);
        }
        if (
          selectedRuleTitle === proposals[indexToReplace]?.title &&
          res.proposedNewRules[indexToReplace]
        ) {
          setSelectedRuleTitle(res.proposedNewRules[indexToReplace].title);
        }
      } catch (err: any) {
        console.error('Failed to replace proposal', err);
        setError(
          err.response?.data?.message ||
            'Failed to fetch AI rule proposal. Please check your AI API key and model settings.',
        );
      } finally {
        setReplacingIndex(null);
      }
    },
    [selectedRuleTitle, proposals],
  );

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
        } catch (err) {
          console.error('Failed to load resumed lesson', err);
          setError('Failed to load resumed lesson.');
        } finally {
          setLoadingProposals(false);
        }
      };
      fetchResumedLesson();
    } else {
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
  }, [resumeLessonId, location.pathname, fetchProposals, loadSavedAnswers]);

  const handleSelectRule = useCallback(
    (title: string, isReview: boolean = false) => {
      setSelectedRuleTitle(title);
      setIsReviewSelection(isReview);
    },
    [],
  );

  const handleGenerateLesson = useCallback(async () => {
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
      setError(
        err.response?.data?.message ||
          'Failed to generate lesson. Please check your AI API configuration.',
      );
    } finally {
      setGeneratingLesson(false);
    }
  }, [selectedRuleTitle, wordsCount, isReviewSelection, loadSavedAnswers, navigate]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        const newFiles = [...imageFiles, ...files].slice(0, 3);

        const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > 5 * 1024 * 1024) {
          alert('Total image size cannot exceed 5MB.');
          return;
        }

        setImageFiles(newFiles);
        setImagePreviews(newFiles.map((file) => URL.createObjectURL(file)));
      }
    },
    [imageFiles],
  );

  const clearImages = useCallback(() => {
    setImageFiles([]);
    setImagePreviews([]);
  }, []);

  const handleSubmitExercises = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentLesson) return;

      try {
        setError(null);
        setSubmitting(true);
        const formattedEx1 =
          lessonContent?.exercise1.targetWords
            ?.map((word, i) => `${word}: ${ex1Answers[i] || ''}`)
            .join('\n') || '';
        const formattedEx2 =
          lessonContent?.exercise2.sentencesToTranslate
            ?.map((sentence, i) => `${sentence}: ${ex2Answers[i] || ''}`)
            .join('\n') || '';

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
        setError(
          err.response?.data?.message ||
            'Failed to grade submission. Please check your AI API configuration.',
        );
      } finally {
        setSubmitting(false);
      }
    },
    [currentLesson, lessonContent, ex1Answers, ex2Answers, ex3Answer, imageFiles],
  );

  const handleBackFromExercises = useCallback(() => {
    if (resumeLessonId) {
      navigate(-1);
    } else {
      setPhase('PROPOSAL');
    }
  }, [resumeLessonId, navigate]);

  useEffect(() => {
    if (currentLesson?.id && phase === 'GENERATED_WORKSPACE') {
      const data = { ex1: ex1Answers, ex2: ex2Answers, ex3: ex3Answer };
      localStorage.setItem(`lesson_answers_${currentLesson.id}`, JSON.stringify(data));
    }
  }, [ex1Answers, ex2Answers, ex3Answer, currentLesson?.id, phase]);

  return {
    phase,
    setPhase,
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
  };
}
