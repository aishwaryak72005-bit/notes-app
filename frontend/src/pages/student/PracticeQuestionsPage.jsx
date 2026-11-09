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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-forest-dark text-ivory rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-sage/30">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest text-sage text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sage" />
            <span>Untimed Casual Learning Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
            Interactive Practice Questions
          </h1>
          <p className="text-xs sm:text-sm text-sage/80 mt-1 max-w-xl">
            Test and sharpen your understanding topic-by-topic. Get instant validation, code breakdown, and detailed explanations on every question.
          </p>
        </div>

        {/* Score Pill */}
        <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-4 text-center min-w-[130px]">
          <span className="text-[10px] uppercase font-bold text-sage/80 tracking-wider block">Practice Score</span>
          <span className="text-2xl font-black text-white">
            {score.correct} <span className="text-xs font-normal text-sage/70">/ {score.total}</span>
          </span>
          <span className="block text-[10px] text-sage/80 mt-0.5">
            {score.total > 0 ? `${Math.round((score.correct / score.total) * 100)}% accuracy` : 'Ready to start'}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sage/40 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-semibold text-charcoal">
          <Filter className="w-4 h-4 text-forest" />
          <span>Filter by Subject:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTech('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTech === ''
                ? 'bg-forest text-ivory shadow-xs'
                : 'bg-ivory hover:bg-sage/40 text-charcoal border border-sage/60'
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
                  ? 'bg-forest text-ivory shadow-xs'
                  : 'bg-ivory hover:bg-sage/40 text-charcoal border border-sage/60'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      {!currentQ ? (
        <div className="bg-white rounded-3xl p-10 border border-sage/40 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-charcoal">No Practice Questions for this Filter</h2>
          <p className="text-xs text-muted max-w-md mx-auto">
            Uploaded course documents for this subject may still be processing, or you can switch to another subject.
          </p>
          <button
            onClick={() => setSelectedTech('')}
            className="px-5 py-2.5 bg-forest text-ivory text-xs font-bold rounded-xl hover:bg-forest-dark transition-all"
          >
            View All Subjects
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage/40 shadow-card space-y-6">
          {/* Top Question Info */}
          <div className="flex items-center justify-between border-b border-sage/30 pb-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold">
                {currentQ.technology_name}
              </span>
              <span className="text-xs text-muted font-medium">
                • {currentQ.concept_title}
              </span>
            </div>
            <span className="text-xs font-semibold text-muted">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-charcoal leading-relaxed">
              {currentQ.question_text}
            </h2>

            {currentQ.code_snippet && (
              <div className="bg-charcoal text-ivory p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-gray-700">
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

              let optionClasses = 'bg-ivory/60 border-sage/60 text-charcoal hover:bg-sage/30';
              if (result) {
                if (isCorrectOpt) {
                  optionClasses = 'bg-green-50 border-green-500 text-green-900 ring-2 ring-green-400';
                } else if (isWrongSelection) {
                  optionClasses = 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-300';
                } else {
                  optionClasses = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
                }
              } else if (isSelected) {
                optionClasses = 'bg-forest/10 border-forest text-forest-dark ring-2 ring-forest';
              }

              return (
                <button
                  key={opt.id}
                  disabled={result !== null || checking}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${optionClasses}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCorrectOpt
                        ? 'bg-green-600 text-white'
                        : isWrongSelection
                        ? 'bg-red-600 text-white'
                        : isSelected
                        ? 'bg-forest text-white'
                        : 'bg-white border border-sage/60 text-charcoal'
                    }`}
                  >
                    {isCorrectOpt ? '✓' : isWrongSelection ? '✗' : letter}
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
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
                  ? 'bg-green-50/80 border-green-300 text-green-950'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm mb-2">
                {result.is_correct ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-green-800">Spot On! Correct Answer.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="text-amber-800">
                      Not quite. Correct answer: {result.correct_option_text}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-charcoal/90">
                {result.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-sage/30">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-charcoal hover:bg-ivory flex items-center space-x-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Over</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!result}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                result
                  ? 'bg-forest hover:bg-forest-dark text-ivory shadow-xs'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
