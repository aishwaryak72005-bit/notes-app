import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  BookOpen,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const QuizPage = () => {
  const { conceptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [concept, setConcept] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        let targetQuiz = null;

        if (conceptId) {
          try {
            const conc = await contentService.getConcept(conceptId);
            setConcept(conc);
          } catch (e) {
            console.warn('Concept load fallback:', e);
          }

          // 1. Try finding quiz specifically created for this concept
          targetQuiz = await quizService.getQuizByConcept(conceptId);

          // 2. If not found by concept, check if the ID in URL was a direct Quiz ID
          if (!targetQuiz) {
            try {
              const direct = await quizService.getQuiz(conceptId);
              if (direct && direct.id) {
                targetQuiz = direct;
              }
            } catch (e) {
              // Not a direct quiz id
            }
          }
        }

        // 3. If still no quiz, load the first available quiz as default
        const allQuizzes = await quizService.getQuizzes();
        setAvailableQuizzes(allQuizzes);

        if (!targetQuiz && allQuizzes.length > 0) {
          targetQuiz = allQuizzes[0];
        }

        setQuiz(targetQuiz);
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [conceptId]);

  // Timer tick
  useEffect(() => {
    let interval = null;
    if (!submitted && quiz) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [submitted, quiz]);

  const handleSelectOption = (questionId, optionId) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const handleFillBlank = (questionId, text) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionId]: text,
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    try {
      const res = await quizService.submitQuiz(quiz.id, answers, timerSeconds);
      setResult(res);
      setSubmitted(true);
      if (res.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setCurrentIndex(0);
    setTimerSeconds(0);
  };

  if (loading) {
    return <Loader message="Preparing Concept Practice Quiz..." />;
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-sage/40 shadow-card text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-charcoal">Concept Quiz in Preparation</h2>
          <p className="text-xs text-muted mt-1">
            {concept ? `Questions are being compiled for ${concept.title}.` : 'Select one of our active practice quizzes below:'}
          </p>
        </div>

        {availableQuizzes.length > 0 && (
          <div className="text-left space-y-2 pt-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Available Practice Quizzes:</span>
            {availableQuizzes.slice(0, 4).map((aq) => (
              <button
                key={aq.id}
                onClick={() => {
                  setQuiz(aq);
                  setConcept({ title: aq.concept_title || aq.title });
                }}
                className="w-full p-3 rounded-2xl bg-ivory/70 border border-sage/60 hover:bg-sage/30 flex items-center justify-between text-xs font-semibold text-charcoal transition-all"
              >
                <span>{aq.title}</span>
                <span className="text-forest">Take Quiz →</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center space-x-3 pt-2">
          <Link
            to="/ai-tutor"
            className="px-4 py-2 bg-sage hover:bg-sage-dark text-forest-dark text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-forest" />
            <span>Generate AI Practice Questions</span>
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-forest text-ivory text-xs font-semibold rounded-xl"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // If Quiz Result Mode
  if (submitted && result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 shadow-card border border-sage/40 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-sage/40 text-forest shadow-xs">
            <Trophy className="w-8 h-8 text-forest" />
          </div>

          <h1 className="text-2xl font-extrabold text-charcoal">
            {result.passed ? 'Great Job! Quiz Passed' : 'Keep Practicing! Quiz Finished'}
          </h1>
          <p className="text-sm text-muted max-w-md mx-auto">
            You completed <strong>{result.quiz_title}</strong> with a score of{' '}
            <strong className="text-forest">{result.score_percentage}%</strong>.
          </p>

          {/* Result Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-xl mx-auto">
            <div className="p-3 rounded-2xl bg-ivory/80 border border-sage/50">
              <div className="text-xs text-muted font-medium">Total Questions</div>
              <div className="text-xl font-bold text-charcoal mt-0.5">{result.total_questions}</div>
            </div>
            <div className="p-3 rounded-2xl bg-green-50 border border-green-200">
              <div className="text-xs text-green-700 font-medium">Correct</div>
              <div className="text-xl font-bold text-green-800 mt-0.5">{result.correct_answers}</div>
            </div>
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
              <div className="text-xs text-red-700 font-medium">Incorrect</div>
              <div className="text-xl font-bold text-red-800 mt-0.5">{result.incorrect_answers}</div>
            </div>
            <div className="p-3 rounded-2xl bg-ivory/80 border border-sage/50">
              <div className="text-xs text-muted font-medium">Time Taken</div>
              <div className="text-xl font-bold text-charcoal mt-0.5">{formatTime(result.time_taken_seconds)}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 bg-ivory border border-sage/80 hover:bg-sage/30 text-charcoal text-xs font-semibold rounded-2xl flex items-center space-x-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>

            {concept && (
              <Link
                to={`/learn/${concept.module_title ? 'python' : 'python'}/${concept.slug || 'variables'}/${concept.slug || 'variables'}`}
                className="px-5 py-2.5 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-2xl shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <BookOpen className="w-4 h-4 text-sage" />
                <span>Return to Notes</span>
              </Link>
            )}

            <Link
              to="/progress"
              className="px-5 py-2.5 bg-white border border-sage text-forest hover:bg-sage/20 text-xs font-semibold rounded-2xl transition-all"
            >
              <span>View Learning Progress →</span>
            </Link>
          </div>
        </div>

        {/* Detailed Feedback on Every Question with Explanations */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-charcoal">Answer Breakdown & Explanations</h2>
          {result.feedback?.map((item, idx) => (
            <div
              key={item.question_id}
              className={`bg-white rounded-3xl p-6 shadow-card border ${
                item.is_correct ? 'border-green-200' : 'border-red-200'
              } space-y-3`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                    item.is_correct ? 'bg-green-600' : 'bg-red-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-charcoal">{item.question_text}</h3>
                </div>
                {item.is_correct ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800 flex items-center space-x-1 flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Correct</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 flex items-center space-x-1 flex-shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Incorrect</span>
                  </span>
                )}
              </div>

              {item.code_snippet && (
                <pre className="p-3 rounded-xl bg-forest-dark text-sage-light font-mono text-xs overflow-x-auto">
                  <code>{item.code_snippet}</code>
                </pre>
              )}

              {/* Explanation Box matching reference mockup */}
              <div className="p-3.5 rounded-2xl bg-sage/20 border border-sage/60 flex items-start space-x-2 text-xs text-forest-dark">
                <Lightbulb className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Explanation: </strong>
                  <span>{item.explanation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active Quiz Runner Screen
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Quiz Header matching Screenshot */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-sage/40">
        <div className="flex items-center justify-between pb-4 border-b border-sage/30">
          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-sage/40 text-forest uppercase tracking-wider">
              Concept Quiz
            </span>
            <h1 className="text-base sm:text-lg font-bold text-charcoal mt-1.5">{quiz.title}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-xs font-mono font-semibold text-muted bg-ivory px-3 py-1.5 rounded-xl border border-sage/50">
              <Clock className="w-3.5 h-3.5 text-forest" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted mb-1.5">
            <span>
              Question <strong className="text-forest">{currentIndex + 1}</strong> of {questions.length}
            </span>
            <span>{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2 bg-sage/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-forest rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage/40 space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-charcoal leading-snug">
            Q{currentIndex + 1}. {currentQuestion.question_text}
          </h2>

          {/* Code snippet if present (predict output / find error) */}
          {currentQuestion.code_snippet && (
            <div className="mt-3 rounded-2xl bg-forest-dark p-4 font-mono text-xs text-sage-light border border-forest-border overflow-x-auto whitespace-pre">
              <code>{currentQuestion.code_snippet}</code>
            </div>
          )}
        </div>

        {/* Options List */}
        {currentQuestion.question_type === 'fill_blank' ? (
          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
              Type Your Answer Below:
            </label>
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleFillBlank(currentQuestion.id, e.target.value)}
              placeholder="e.g. print"
              className="w-full px-4 py-3 bg-lightgrey/50 border border-sage/60 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {currentQuestion.options?.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-sage/40 border-forest text-forest-dark font-semibold shadow-xs'
                      : 'bg-ivory/40 border-sage/60 text-charcoal hover:bg-white hover:border-forest/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-forest bg-forest text-ivory'
                          : 'border-muted/50 group-hover:border-forest'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </div>
                    <span className="text-xs sm:text-sm">{opt.option_text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Quiz Navigation */}
        <div className="pt-4 border-t border-sage/30 flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-sage/60 hover:bg-ivory text-charcoal disabled:opacity-30 disabled:hover:bg-transparent flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-forest hover:bg-forest-dark text-ivory shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitQuiz}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-forest hover:bg-forest-dark text-ivory shadow-md flex items-center space-x-2 transition-all disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Final Quiz'}</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
