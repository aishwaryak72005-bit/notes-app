import React, { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Filter,
  Code2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PracticeQuestionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [technologies, setTechnologies] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Load available technologies for filtering
  useEffect(() => {
    const init = async () => {
      try {
        const techs = await contentService.getTechnologies();
        setTechnologies(techs);
      } catch (err) {
        console.error('Failed to load technologies:', err);
      }
    };
    init();
  }, []);

  // Fetch practice questions when filter changes
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = selectedTech ? { technology_id: selectedTech } : {};
        const data = await quizService.getPracticeQuestions(params);
        setQuestions(data);
        setCurrentIndex(0);
        setSelectedOption(null);
        setResult(null);
      } catch (err) {
        console.error('Failed to fetch practice questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedTech]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = async (optionId) => {
    if (result || checking) return; // Prevent changing after submitted
    setSelectedOption(optionId);
    setChecking(true);
    try {
      const res = await quizService.checkPracticeAnswer(currentQ.id, optionId);
      setResult(res);
      setScore((prev) => ({
        correct: prev.correct + (res.is_correct ? 1 : 0),
        total: prev.total + 1,
      }));
      if (res.is_correct) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error('Failed to check answer:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setResult(null);
    } else {
      // Loop or re-fetch
      setSelectedOption(null);
      setResult(null);
      setCurrentIndex(0);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setResult(null);
    setScore({ correct: 0, total: 0 });
  };

  if (loading && questions.length === 0) {
    return <Loader message="Loading interactive practice questions..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 selection:bg-brand selection:text-white">
      {/* Header Banner */}
      <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-semibold mb-2 font-small">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Untimed Casual Learning Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
            Interactive Practice Questions
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl font-sans">
            Test and sharpen your understanding topic-by-topic. Get instant validation, code breakdown, and detailed explanations on every question.
          </p>
        </div>

        {/* Score Pill */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[130px] w-full sm:w-auto">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block font-small">Practice Score</span>
          <span className="text-2xl font-black text-white font-heading">
            {score.correct} <span className="text-xs font-normal text-gray-400">/ {score.total}</span>
          </span>
          <span className="block text-[10px] text-brand mt-0.5 font-small font-medium">
            {score.total > 0 ? `${Math.round((score.correct / score.total) * 100)}% accuracy` : 'Ready to start'}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300 font-small">
          <Filter className="w-4 h-4 text-brand" />
          <span>Filter by Subject:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTech('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTech === ''
                ? 'bg-brand text-white shadow-lg shadow-brand/20'
                : 'bg-[#181924] hover:bg-white/10 text-gray-300 border border-white/10'
            }`}
          >
            All Subjects
          </button>
          {technologies.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTech(t.id.toString())}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTech === t.id.toString()
                  ? 'bg-brand text-white shadow-lg shadow-brand/20'
                  : 'bg-[#181924] hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      {!currentQ ? (
        <div className="bg-[#111827] rounded-3xl p-10 border border-white/10 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white font-heading">No Practice Questions for this Filter</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto font-sans">
            Uploaded course documents for this subject may still be processing, or you can switch to another subject.
          </p>
          <button
            onClick={() => setSelectedTech('')}
            className="px-5 py-2.5 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition-all font-heading"
          >
            View All Subjects
          </button>
        </div>
      ) : (
        <div className="bg-[#111827] rounded-3xl p-5 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          {/* Top Question Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand/20 text-brand text-xs font-bold font-small">
                {currentQ.technology_name}
              </span>
              <span className="text-xs text-gray-400 font-medium font-sans">
                • {currentQ.concept_title}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-400 font-small">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed font-heading">
              {currentQ.question_text}
            </h2>

            {currentQ.code_snippet && (
              <div className="bg-[#090A0F] text-amber-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-white/10">
                <pre>{currentQ.code_snippet}</pre>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === opt.id;
              const isCorrectOpt = result && result.correct_option_id === opt.id;
              const isWrongSelection = result && isSelected && !result.is_correct;

              let optionClasses = 'bg-[#181924] border-white/10 text-gray-200 hover:bg-white/5 hover:border-brand/40';
              if (result) {
                if (isCorrectOpt) {
                  optionClasses = 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50';
                } else if (isWrongSelection) {
                  optionClasses = 'bg-red-500/10 border-red-500 text-red-300 ring-2 ring-red-500/50';
                } else {
                  optionClasses = 'bg-[#181924]/40 border-white/5 text-gray-500 opacity-60';
                }
              } else if (isSelected) {
                optionClasses = 'bg-brand/10 border-brand text-brand ring-2 ring-brand/50';
              }

              return (
                <button
                  key={opt.id}
                  disabled={result !== null || checking}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${optionClasses}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-heading ${
                      isCorrectOpt
                        ? 'bg-emerald-500 text-white'
                        : isWrongSelection
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-brand text-white'
                        : 'bg-[#111827] border border-white/10 text-gray-300'
                    }`}
                  >
                    {isCorrectOpt ? '✓' : isWrongSelection ? '✗' : letter}
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5 font-sans">
                    {opt.option_text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instant Feedback Explanation Box */}
          {result && (
            <div
              className={`p-5 rounded-2xl border transition-all animate-fade-in ${
                result.is_correct
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm mb-2 font-heading">
                {result.is_correct ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400">Spot On! Correct Answer.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="text-amber-400">
                      Not quite. Correct answer: {result.correct_option_text}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-300 font-sans">
                {result.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 flex items-center space-x-1.5 transition-all font-sans"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Over</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!result}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all font-heading ${
                result
                  ? 'bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/20'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeQuestionsPage;
