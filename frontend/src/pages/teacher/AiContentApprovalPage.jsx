import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { quizService } from '../../services/quizService';
import Loader from '../../components/common/Loader';
import {
  Sparkles,
  CheckCircle2,
  Trash2,
  BookOpen,
  HelpCircle,
  Code2,
  Filter,
  Eye,
  Check,
  X,
  Layers,
} from 'lucide-react';

const AiContentApprovalPage = () => {
  const [loading, setLoading] = useState(true);
  const [technologies, setTechnologies] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'notes'
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [techs, allQuizzes] = await Promise.all([
        contentService.getTechnologies(),
        quizService.getQuizzes(),
      ]);
      setTechnologies(techs);
      setQuizzes(allQuizzes);
      if (techs.length > 0 && !selectedTech) {
        setSelectedTech(techs[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteQuestion = async (questionId) => {
    try {
      await quizService.deleteQuestion(questionId);
      setFeedbackMsg('Question rejected and removed.');
      setTimeout(() => setFeedbackMsg(''), 3000);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader message="Loading AI Generated Content Queue..." />;

  const filteredQuizzes = quizzes.filter(
    (q) => !selectedTech || String(q.technology_id) === String(selectedTech) || String(q.concept?.module?.technology_id) === String(selectedTech)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-forest-dark text-ivory rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-sage/30">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Content Moderation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
            AI-Generated Content & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-sage/80 mt-1 max-w-xl">
            Review, edit, or reject AI-extracted topics, chapter explanations, and practice questions parsed from uploaded study materials.
          </p>
        </div>

        <div className="flex bg-white/10 backdrop-blur-xs p-1 rounded-2xl border border-white/20">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'questions' ? 'bg-forest text-ivory shadow-xs' : 'text-sage hover:text-white'
            }`}
          >
            Generated Questions ({quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0)})
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-green-50 border border-green-300 text-green-900 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Technology Filter Bar */}
      <div className="flex items-center space-x-2 bg-white p-4 rounded-2xl border border-sage/40 shadow-xs overflow-x-auto">
        <Filter className="w-4 h-4 text-forest shrink-0" />
        <span className="text-xs font-bold text-charcoal shrink-0">Filter Subject:</span>
        <button
          onClick={() => setSelectedTech('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedTech === t.id.toString()
                ? 'bg-forest text-ivory shadow-xs'
                : 'bg-ivory hover:bg-sage/40 text-charcoal border border-sage/60'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Questions Approval List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-sage/40 text-center space-y-3 shadow-card">
            <HelpCircle className="w-12 h-12 text-muted mx-auto" />
            <h3 className="text-base font-bold text-charcoal">No AI Questions to Review</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Drop course documents in the Upload Materials tab to automatically extract curriculum topics and practice quizzes.
            </p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-3xl p-6 border border-sage/40 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sage/30 pb-3">
                <div>
                  <h3 className="text-base font-bold text-forest-dark">{quiz.title}</h3>
                  <span className="text-xs text-muted">
                    {quiz.concept_title ? `Concept: ${quiz.concept_title}` : 'Module Level Quiz'} • Passing Score: {quiz.passing_score_percentage}%
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold self-start sm:self-auto">
                  {quiz.questions?.length || 0} Questions Parsed
                </span>
              </div>

              {quiz.questions && quiz.questions.length > 0 ? (
                <div className="space-y-3">
                  {quiz.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-ivory/40 border border-sage/40 space-y-2 hover:bg-ivory/80 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-md bg-forest text-ivory text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-charcoal">{q.question_text}</span>
                          </div>

                          {q.code_snippet && (
                            <div className="bg-charcoal text-ivory p-3 rounded-xl font-mono text-[11px] mt-2 overflow-x-auto">
                              <pre>{q.code_snippet}</pre>
                            </div>
                          )}

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {q.options?.map((opt, oIdx) => (
                              <div
                                key={opt.id}
                                className={`p-2 rounded-xl text-xs flex items-center space-x-2 border ${
                                  opt.is_correct
                                    ? 'bg-green-50 border-green-300 text-green-900 font-semibold'
                                    : 'bg-white border-sage/40 text-charcoal'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                    opt.is_correct ? 'bg-green-600 text-white' : 'bg-gray-100 text-muted'
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="truncate">{opt.option_text}</span>
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <div className="text-[11px] text-muted pt-1">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>

                        {/* Quick Action Button */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                            title="Reject Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted italic">No questions currently in this quiz.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AiContentApprovalPage;
