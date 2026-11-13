import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api, ExerciseSubmissionPayload } from '../../../services/api';
import { parseLessonContent } from '../../../services/lesson-adapter';
import { Lesson, LessonContent, ProposedRule, UsageInfo, UserSubmission } from '../../../types';
import { LessonPhase } from '../components/StepIndicator';
import { parseConjugationRow } from '../components/ExercisePhase/ExerciseOne/SubjectConjugationExercise/SubjectConjugationExercise';

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
  error: string | null;
  imageError: string | null;
  setImageError: (err: string | null) => void;
  usageInfo: UsageInfo | null;

  // Actions
  fetchProposals: (forceRefresh?: boolean) => Promise<void>;
  handleSelectRule: (title: string, isReview?: boolean) => void;
  handleReplaceProposal: (indexToReplace: number, e: React.MouseEvent) => Promise<void>;
  handleGenerateLesson: () => Promise<void>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  handleSubmitExercises: (e: React.SubmitEvent) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);

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

  const fetchUsage = useCallback(async () => {
    try {
      const usage = await api.getUsage();
      setUsageInfo(usage);
    } catch (err) {
      console.error('Failed to fetch usage info', err);
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
      if (err.response?.status === 403) {
        setError('AI access suspended.');
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to fetch AI rule proposals. Please check your AI API key and model settings.',
        );
      }
    } finally {
      await fetchUsage();
      setLoadingProposals(false);
    }
  }, [fetchUsage]);

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
        if (err.response?.status === 403) {
          setError('AI access suspended.');
        } else {
          setError(
            err.response?.data?.message ||
              'Failed to fetch AI rule proposal. Please check your AI API key and model settings.',
          );
        }
      } finally {
        await fetchUsage();
        setReplacingIndex(null);
      }
    },
    [selectedRuleTitle, proposals, fetchUsage],
  );

  useEffect(() => {
    if (resumeLessonId) {
      const fetchResumedLesson = async () => {
        try {
          setError(null);
          setLoadingProposals(true);
          const lesson = await api.getLessonById(resumeLessonId);
          setCurrentLesson(lesson);
          const parsed = parseLessonContent(lesson);
          setLessonContent(parsed);
          setSelectedRuleTitle(lesson.rule?.title || lesson.title || '');
          loadSavedAnswers(lesson.id);
          if (lesson.status === 'GRADED' && lesson.overallScore !== null) {
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
      fetchUsage();
    } else {
      setPhase('PROPOSAL');
      setCurrentLesson(null);
      setLessonContent(null);
      setEx1Answers([]);
      setEx2Answers([]);
      setEx3Answer('');
      setImageFiles([]);
      setImagePreviews([]);
      setSubmitting(false);
      setGeneratingLesson(false);
      fetchProposals();
    }
  }, [resumeLessonId, location.pathname, fetchProposals, loadSavedAnswers, fetchUsage]);

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
      const parsed = parseLessonContent(lesson);
      setLessonContent(parsed);
      loadSavedAnswers(lesson.id);
      setCurrentLesson(lesson);
      setPhase('GENERATED_WORKSPACE');
      navigate(`/lessons/${lesson.id}/resume`, { replace: true });
    } catch (err: any) {
      console.error('Error generating lesson', err);
      if (err.response?.status === 403) {
        setError('AI access suspended.');
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to generate lesson. Please check your AI API configuration.',
        );
      }
    } finally {
      await fetchUsage();
      setGeneratingLesson(false);
    }
  }, [selectedRuleTitle, wordsCount, isReviewSelection, loadSavedAnswers, navigate, fetchUsage]);

  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        const newFiles = [...imageFiles, ...files].slice(0, 3);

        const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > 5 * 1024 * 1024) {
          setImageError('Total image size cannot exceed 5MB. Please choose smaller images.');
          e.target.value = '';
          return;
        }

        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImageFiles(newFiles);
        setImagePreviews(newFiles.map((file) => URL.createObjectURL(file)));
        e.target.value = '';
      }
    },
    [imageFiles, imagePreviews],
  );

  const removeImage = useCallback((indexToRemove: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== indexToRemove));
    setImagePreviews((prevPreviews) => {
      if (prevPreviews[indexToRemove]) {
        URL.revokeObjectURL(prevPreviews[indexToRemove]);
      }
      return prevPreviews.filter((_, i) => i !== indexToRemove);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImagePreviews((prevPreviews) => {
      prevPreviews.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setImageFiles([]);
  }, []);

  const handleSubmitExercises = useCallback(
    async (e: React.SubmitEvent) => {
      e.preventDefault();
      if (!currentLesson) return;

      try {
        setError(null);
        setSubmitting(true);

        let ex1Submission: UserSubmission;
        if (
          lessonContent?.exercise1.type === 'subject_conjugation' &&
          Array.isArray(lessonContent?.exercise1.targetWords) &&
          Array.isArray(lessonContent?.exercise1.subjectPronouns) &&
          lessonContent.exercise1.subjectPronouns.length > 0
        ) {
          const activePronouns = lessonContent.exercise1.subjectPronouns;
          const grid: Record<string, string[]> = {};
          lessonContent.exercise1.targetWords.forEach((word, vIdx) => {
            grid[word] = parseConjugationRow(ex1Answers[vIdx], activePronouns);
          });
          ex1Submission = { grid };
        } else {
          ex1Submission = { answers: ex1Answers };
        }

        const exercises: ExerciseSubmissionPayload[] = [
          { exerciseNumber: 1, submission: ex1Submission },
          { exerciseNumber: 2, submission: { answers: ex2Answers } },
          { exerciseNumber: 3, submission: { text: ex3Answer } },
        ];

        const updatedLesson = await api.submitLesson(
          currentLesson.id,
          { exercises },
          imageFiles.length > 0 ? imageFiles : null,
        );
        setCurrentLesson(updatedLesson);
        setPhase('GRADED');
        localStorage.removeItem(`lesson_answers_${currentLesson.id}`);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err: any) {
        console.error('Submission failed', err);
        if (err.response?.status === 403) {
          setError('AI access suspended.');
        } else {
          setError(
            err.response?.data?.message ||
              'Failed to grade submission. Please check your AI API configuration.',
          );
        }
      } finally {
        await fetchUsage();
        setSubmitting(false);
      }
    },
    [currentLesson, lessonContent, ex1Answers, ex2Answers, ex3Answer, imageFiles, fetchUsage],
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
    error,
    imageError,
    setImageError,
    usageInfo,

    fetchProposals,
    handleSelectRule,
    handleReplaceProposal,
    handleGenerateLesson,
    handleImageChange,
    removeImage,
    clearImages,
    handleSubmitExercises,
    handleBackFromExercises,
  };
}
