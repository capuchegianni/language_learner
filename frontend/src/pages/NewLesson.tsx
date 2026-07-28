import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Lesson, LessonContent, ProposedRule, GradingResult } from '../types';
import { Sparkles, Copy, Check, Upload, Image as ImageIcon, Award, BookOpen, Send, RefreshCw, FileText, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewLessonProps {
  onLessonFinished?: () => void;
}

export const NewLesson: React.FC<NewLessonProps> = ({ onLessonFinished }) => {
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
  const [ex1Answer, setEx1Answer] = useState<string>('');
  const [ex2Answer, setEx2Answer] = useState<string>('');
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

  // Fetch proposals on component mount
  const fetchProposals = async (forceRefresh: boolean = false) => {
    try {
      setError(null);
      setLoadingProposals(true);
      let cachedData: { proposals: ProposedRule[]; reviewRule: any } | null = null;
      let titlesToExclude: string[] = [];

      const stored = localStorage.getItem('korean_proposals');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!forceRefresh) {
          cachedData = parsed;
          titlesToExclude = parsed.proposals.map((p: ProposedRule) => p.title);
        } else {
          // If force refreshing, remember the old proposals to exclude them
          titlesToExclude = parsed.proposals.map((p: ProposedRule) => p.title);
        }
      }

      const existingProposals = cachedData?.proposals || [];
      const missingCount = forceRefresh ? 3 : Math.max(0, 3 - existingProposals.length);

      if (missingCount > 0 || !cachedData?.reviewRule) {
        const res = await api.getRuleProposals(missingCount, titlesToExclude);
        const combinedProposals = forceRefresh ? res.proposedNewRules : [...existingProposals, ...res.proposedNewRules];
        const newReviewRule = res.reviewRuleOption || cachedData?.reviewRule;

        const newData = { proposals: combinedProposals, reviewRule: newReviewRule };
        localStorage.setItem('korean_proposals', JSON.stringify(newData));

        setProposals(newData.proposals);
        setReviewRule(newData.reviewRule);
        if (newData.proposals.length > 0) {
          setSelectedRuleTitle(newData.proposals[0].title);
        }
      } else {
        setProposals(cachedData!.proposals);
        setReviewRule(cachedData!.reviewRule);
        if (cachedData!.proposals.length > 0) {
          setSelectedRuleTitle(cachedData!.proposals[0].title);
        }
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
      const currentExcludeTitles = proposals.map(p => p.title);
      const res = await api.getRuleProposals(1, currentExcludeTitles);

      if (res.proposedNewRules.length > 0) {
        const newProposals = [...proposals];
        newProposals[indexToReplace] = res.proposedNewRules[0];

        setProposals(newProposals);
        localStorage.setItem('korean_proposals', JSON.stringify({ proposals: newProposals, reviewRule }));

        if (selectedRuleTitle === proposals[indexToReplace].title) {
          setSelectedRuleTitle(newProposals[indexToReplace].title);
        }
      }
    } catch (err: any) {
      console.error('Failed to replace proposal', err);
      setError(err.response?.data?.message || 'Failed to fetch AI rule proposal. Please check your AI API key and model settings.');
    } finally {
      setReplacingIndex(null);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

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
      setCurrentLesson(lesson);
      const parsed: LessonContent = JSON.parse(lesson.lessonData);
      setLessonContent(parsed);
      setPhase('GENERATED_WORKSPACE');
      localStorage.removeItem('korean_proposals');
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

  const handleSubmitExercises = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLesson) return;

    try {
      setError(null);
      setSubmitting(true);
      const updatedLesson = await api.submitLesson(
        currentLesson.id,
        { ex1: ex1Answer, ex2: ex2Answer, ex3: ex3Answer },
        imageFiles.length > 0 ? imageFiles : null,
      );
      setCurrentLesson(updatedLesson);
      if (updatedLesson.aiFeedback) {
        const feedback: GradingResult = JSON.parse(updatedLesson.aiFeedback);
        setGradingResult(feedback);
      }
      setPhase('GRADED');
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Step Indicator Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: phase === 'PROPOSAL' ? 'var(--accent-primary)' : 'var(--accent-success)' }}>
          <div className="pill pill-primary" style={{ background: phase === 'PROPOSAL' ? 'var(--accent-primary)' : 'var(--accent-success)', color: '#fff' }}>1</div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Pick Daily Rule</span>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: phase === 'GENERATED_WORKSPACE' ? 'var(--accent-primary)' : phase === 'GRADED' ? 'var(--accent-success)' : 'var(--text-muted)' }}>
          <div className="pill" style={{ background: phase === 'GENERATED_WORKSPACE' ? 'var(--accent-primary)' : phase === 'GRADED' ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)', color: '#fff' }}>2</div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Practice Exercises</span>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: phase === 'GRADED' ? 'var(--accent-success)' : 'var(--text-muted)' }}>
          <div className="pill" style={{ background: phase === 'GRADED' ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)', color: '#fff' }}>3</div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Feedback & Score</span>
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
        <div>
          <div className="glass-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Select Today's Korean Rule
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
              The AI analyzed your mastered rules and proposed 3 new daily grammar rules, or choose a random revision rule to refresh your knowledge.
            </p>

            {/* Word Count Selector */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'rgba(15,23,42,0.6)', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Target New Words:</label>
              <select
                value={wordsCount}
                onChange={(e) => setWordsCount(Number(e.target.value))}
                style={{ background: 'transparent', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
              >
                <option value={3} style={{ background: '#1e293b' }}>3 Words</option>
                <option value={5} style={{ background: '#1e293b' }}>5 Words (Standard)</option>
                <option value={7} style={{ background: '#1e293b' }}>7 Words</option>
                <option value={10} style={{ background: '#1e293b' }}>10 Words</option>
              </select>
            </div>
          </div>

          {loadingProposals ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>AI is curating rule proposals based on your rule bank...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AI Proposed New Rules:</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {proposals.map((prop, idx) => {
                  const isSelected = selectedRuleTitle === prop.title && !isReviewSelection;
                  return (
                    <div
                      key={idx}
                      className="glass-card"
                      style={{
                        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                        cursor: replacingIndex === idx ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '180px',
                        transition: 'all 0.2s ease',
                        opacity: replacingIndex === idx ? 0.7 : 1,
                      }}
                      onClick={() => {
                        if (replacingIndex !== idx) handleSelectRule(prop.title, false);
                      }}
                    >
                      {replacingIndex === idx ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <div className="spinner" style={{ marginBottom: '1rem' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generating new proposal...</span>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className="pill pill-primary">{prop.category}</span>
                                <span className="pill pill-warning">{prop.difficulty}</span>
                              </div>
                              <button
                                type="button"
                                className="btn"
                                style={{ padding: '0.25rem', background: 'transparent', color: 'var(--text-muted)' }}
                                title="Replace this proposal"
                                onClick={(e) => handleReplaceProposal(idx, e)}
                                disabled={replacingIndex !== null}
                              >
                                <RefreshCw size={14} />
                              </button>
                            </div>
                            <h4 className="kr-text" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: isSelected ? 'var(--accent-secondary)' : '#fff' }}>
                              {prop.title}
                            </h4>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              {prop.briefExplanation}
                            </p>
                          </div>
                          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>
                            {isSelected ? <Check size={16} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-color)' }} />}
                            <span>{isSelected ? 'Selected Rule' : 'Select Rule'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Spaced Repetition Review Rule Option */}
              {reviewRule && (
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Option 4: Spaced Repetition Review
                  </h3>
                  <div
                    className="glass-card"
                    style={{
                      borderColor: isReviewSelection ? 'var(--accent-warning)' : 'var(--border-color)',
                      background: isReviewSelection ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => handleSelectRule(reviewRule.title, true)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="pill pill-warning">Review Mode</span>
                        <h4 className="kr-text" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{reviewRule.title}</h4>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{reviewRule.explanation}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isReviewSelection ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {isReviewSelection ? <Check size={18} /> : <RefreshCw size={18} />}
                      <span>{isReviewSelection ? 'Selected Review' : 'Select Review'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => fetchProposals(true)}
              disabled={loadingProposals || generatingLesson}
            >
              <RefreshCw size={18} />
              <span>Refresh Proposals</span>
            </button>
            <button
              className="btn btn-primary"
              style={{ minWidth: '220px' }}
              disabled={!selectedRuleTitle || generatingLesson}
              onClick={handleGenerateLesson}
            >
              {generatingLesson ? (
                <>
                  <div className="spinner" />
                  <span>Generating Lesson...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate Lesson & Exercises</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: GENERATED WORKSPACE & EXERCISE FORM */}
      {phase === 'GENERATED_WORKSPACE' && lessonContent && (
        <div>
          {/* Dual Mode Switcher Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 className="kr-text" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {lessonContent.rule.title}
              </h2>
              <span className="pill pill-primary">{wordsCount} New Vocabulary Words</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15,23,42,0.8)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn ${activeTab === 'interactive' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setActiveTab('interactive')}
              >
                <BookOpen size={16} />
                <span>Interactive App Workspace</span>
              </button>
              <button
                className={`btn ${activeTab === 'raw_prompt' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setActiveTab('raw_prompt')}
              >
                <FileText size={16} />
                <span>View & Copy Raw Prompt</span>
              </button>
            </div>
          </div>

          {/* TAB 1: INTERACTIVE APP WORKSPACE */}
          {activeTab === 'interactive' && (
            <div>
              {/* Daily Vocabulary Cards */}
              <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={18} color="var(--accent-secondary)" />
                  <span>1. Today's {wordsCount} Daily Words</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {lessonContent.newWords?.map((w, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                      }}
                    >
                      <div className="kr-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                        {w.korean}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {w.english}
                      </div>
                      {w.pronunciation && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          [{w.pronunciation}]
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Rule Explanation */}
              <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  2. Today's Rule Breakdown & Examples
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {lessonContent.rule.explanation}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {lessonContent.rule.examples?.map((ex, idx) => (
                    <div key={idx} style={{ background: 'rgba(15,23,42,0.5)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)' }}>
                      <div className="kr-text" style={{ fontWeight: 600, color: '#fff' }}>{ex.korean}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ex.english}</div>
                    </div>
                  ))}
                </div>

                {lessonContent.rule.exceptions && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-warning)', background: 'rgba(245,158,11,0.1)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Note / Exceptions:</strong> {lessonContent.rule.exceptions}
                  </div>
                )}
              </div>

              {/* Exercises Form (Two-Step Submission) */}
              <form onSubmit={handleSubmitExercises}>
                <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--accent-primary)' }}>
                    3. Practice Exercises
                  </h3>

                  {/* Exercise 1 */}
                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#fff' }}>
                      Exercise 1: Rule Application
                    </label>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {lessonContent.exercise1.instruction} (Target: {lessonContent.exercise1.targetWords?.join(', ')})
                    </p>
                    <textarea
                      value={ex1Answer}
                      onChange={(e) => setEx1Answer(e.target.value)}
                      placeholder="Type your Korean conjugated words here..."
                      className="kr-text"
                    />
                  </div>

                  {/* Exercise 2 */}
                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#fff' }}>
                      Exercise 2: Sentence Translation (3 Sentences)
                    </label>
                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                      {lessonContent.exercise2.sentencesToTranslate?.map((s, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{s}</li>
                      ))}
                    </ul>
                    <textarea
                      value={ex2Answer}
                      onChange={(e) => setEx2Answer(e.target.value)}
                      placeholder="Type your 3 translated Korean sentences..."
                      className="kr-text"
                    />
                  </div>

                  {/* Exercise 3 */}
                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#fff' }}>
                      Exercise 3: Mini Story Translation (30-50 words)
                    </label>
                    <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', fontSize: '0.9rem', fontStyle: 'italic', border: '1px solid var(--border-color)' }}>
                      "{lessonContent.exercise3.englishTextToTranslate}"
                    </div>
                    <textarea
                      value={ex3Answer}
                      onChange={(e) => setEx3Answer(e.target.value)}
                      placeholder="Type your Korean translation of the story..."
                      className="kr-text"
                    />
                  </div>

                  {/* Multimodal Vision Upload Option */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                    <label style={{ fontWeight: 600, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <ImageIcon size={18} />
                      <span>Or Upload Photo of Handwritten Exercises (Vision AI OCR)</span>
                    </label>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      Wrote your answers in a physical notebook? Snap up to 3 photos and upload them! Vision AI will read your handwriting and evaluate it.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        <Upload size={18} />
                        <span>Choose Photo(s)</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                      </label>
                      {imageFiles.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          {imageFiles.map((f, i) => (
                            <span key={i} style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>Selected: {f.name}</span>
                          ))}
                        </div>
                      )}
                      {imageFiles.length > 0 && (
                        <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { setImageFiles([]); setImagePreviews([]); }}>
                          Clear
                        </button>
                      )}
                    </div>

                    {imagePreviews.length > 0 && (
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {imagePreviews.map((preview, i) => (
                          <img key={i} src={preview} alt={`Handwritten preview ${i + 1}`} style={{ height: '120px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color-glow)', objectFit: 'cover' }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Form Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setPhase('PROPOSAL')}
                  >
                    Back to Selection
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ minWidth: '220px' }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner" />
                        <span>AI Teacher Grading...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Submit for AI Grading</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: RAW PROMPT VIEW & COPY */}
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
          <div className="glass-card" style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'var(--gradient-glow)' }}>
            <Award size={48} style={{ color: 'var(--accent-warning)', margin: '0 auto 0.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Lesson Evaluation Complete!
            </h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: gradingResult.overallScore >= 80 ? 'var(--accent-success)' : 'var(--accent-warning)', marginBottom: '0.5rem' }}>
              {gradingResult.overallScore}%
            </div>
            <p style={{ color: 'var(--text-primary)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
              {gradingResult.generalFeedback}
            </p>
          </div>

          {/* OCR Box if image uploaded */}
          {gradingResult.handwrittenOcrText && (
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
                Vision AI OCR Handwritten Transcription:
              </h3>
              <p className="kr-text" style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }}>
                {gradingResult.handwrittenOcrText}
              </p>
            </div>
          )}

          {/* Exercise 1 Breakdown */}
          <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Exercise 1: Rule Application</h3>
              <span className="pill pill-success">{gradingResult.exercise1.score}% Score</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {gradingResult.exercise1.feedback}
            </p>
            {gradingResult.exercise1.corrections?.length > 0 && (
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Corrections & Notes:</div>
                <ul style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
                  {gradingResult.exercise1.corrections.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Exercise 2 Breakdown */}
          <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Exercise 2: Sentence Translations</h3>
              <span className="pill pill-success">{gradingResult.exercise2.score}% Score</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {gradingResult.exercise2.feedback}
            </p>
            {gradingResult.exercise2.corrections?.length > 0 && (
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Corrections & Notes:</div>
                <ul style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
                  {gradingResult.exercise2.corrections.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Exercise 3 Breakdown */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Exercise 3: Story Translation</h3>
              <span className="pill pill-success">{gradingResult.exercise3.score}% Score</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {gradingResult.exercise3.feedback}
            </p>
            {gradingResult.exercise3.corrections?.length > 0 && (
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Corrections & Notes:</div>
                <ul style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
                  {gradingResult.exercise3.corrections.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setPhase('PROPOSAL');
                fetchProposals(true);
              }}
            >
              <Sparkles size={18} />
              <span>Start Next Lesson</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
