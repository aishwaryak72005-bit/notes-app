import React, { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import {
  Plus,
  HelpCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Code2,
  PlusCircle,
  Sparkles,
  ClipboardList,
  FileText,
} from 'lucide-react';

const ManageQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [allConcepts, setAllConcepts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createQuizModal, setCreateQuizModal] = useState(false);
  const [addQuestionModal, setAddQuestionModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // 1-Click AI Quiz Generator State
  const [aiModal, setAiModal] = useState(false);
  const [aiQuizId, setAiQuizId] = useState('');
  const [aiConceptId, setAiConceptId] = useState('');
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Bulk Question Import State
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkQuizId, setBulkQuizId] = useState('');
  const [bulkRawText, setBulkRawText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');


  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    concept: '',
    time_limit_minutes: 10,
    passing_score_percentage: 70,
    difficulty_level: 'beginner',
  });

  const [questionForm, setQuestionForm] = useState({
    question_type: 'mcq',
    question_text: '',
    code_snippet: '',
    explanation: '',
    points: 1,
    options: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ],
  });

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const [res, techs, concs] = await Promise.all([
        quizService.getQuizzes(),
        contentService.getTechnologies(),
        contentService.getConcepts(),
      ]);
      setQuizzes(res);
      setTechnologies(techs);
      setAllConcepts(concs);
      if (techs.length > 0) setSelectedTech(techs[0].slug);
    } catch (err) {
      console.error(err);
      setError('Failed to load quizzes.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    const fetchMods = async () => {
      if (!selectedTech) return;
      try {
        const mods = await contentService.getModules(selectedTech);
        setModules(mods);
        if (mods.length > 0) setSelectedModule(mods[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMods();
  }, [selectedTech]);

  useEffect(() => {
    const fetchConcs = async () => {
      if (!selectedModule) return;
      try {
        const concs = await contentService.getConcepts({ module_id: selectedModule });
        setConcepts(concs);
        if (concs.length > 0) {
          setQuizForm((prev) => ({ ...prev, concept: concs[0].id }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchConcs();
  }, [selectedModule]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await quizService.createQuiz(quizForm);
      setSuccess('Quiz created successfully!');
      setCreateQuizModal(false);
      loadQuizzes();
    } catch (err) {
      setError('Failed to create quiz.');
    }
  };

  const handleOpenAddQuestion = (quizId) => {
    setSelectedQuizId(quizId);
    setQuestionForm({
      question_type: 'mcq',
      question_text: '',
      code_snippet: '',
      explanation: '',
      points: 1,
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    });
    setAddQuestionModal(true);
  };

  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      await quizService.addQuestion(selectedQuizId, questionForm);
      setSuccess('Question added to quiz!');
      setAddQuestionModal(false);
      loadQuizzes();
    } catch (err) {
      setError('Failed to add question. Please check fields.');
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await quizService.deleteQuiz(id);
      setSuccess('Quiz deleted successfully.');
      loadQuizzes();
    } catch (err) {
      setError('Failed to delete quiz.');
    }
  };

  const handleGenerateAIQuiz = async (e) => {
    e.preventDefault();
    if (!aiQuizId || !aiConceptId) {
      setError('Please select both a quiz and a concept.');
      return;
    }
    setAiGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await quizService.generateAIQuiz({
        quiz_id: aiQuizId,
        concept_id: aiConceptId,
        num_questions: aiNumQuestions,
      });
      setSuccess(res.message || 'AI Quiz generated and saved successfully!');
      setAiModal(false);
      loadQuizzes();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate AI quiz.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkQuizId || !bulkRawText.trim()) {
      setError('Target quiz and question text are required.');
      return;
    }
    setBulkImporting(true);
    setError('');
    setSuccess('');
    try {
      const res = await quizService.bulkImportQuestions(bulkQuizId, bulkRawText);
      setSuccess(res.message || 'Bulk questions imported successfully!');
      setBulkModal(false);
      setBulkRawText('');
      loadQuizzes();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to bulk import questions.');
    } finally {
      setBulkImporting(false);
    }
  };

  if (loading) return <Loader message="Loading quiz assessments..." />;


  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-dark font-serif">Quiz & Assessment Management</h1>
          <p className="text-xs text-muted mt-0.5">Generate 1-click AI quizzes, bulk paste questions, and set scoring rules.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (quizzes.length > 0) setAiQuizId(quizzes[0].id);
              if (allConcepts.length > 0) setAiConceptId(allConcepts[0].id);
              setAiModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold rounded-2xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>✨ 1-Click AI Quiz</span>
          </button>
          <button
            onClick={() => setCreateQuizModal(true)}
            className="px-4 py-2 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-2xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Quizzes List */}
      <div className="space-y-4">
        {quizzes.map((q) => (
          <div key={q.id} className="bg-white rounded-3xl p-6 shadow-card border border-sage/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sage/30">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sage/40 text-forest">
                    {q.difficulty_level}
                  </span>
                  <span className="text-xs text-muted font-medium">Pass: {q.passing_score_percentage}%</span>
                </div>
                <h2 className="text-lg font-bold text-charcoal mt-1">{q.title}</h2>
                <p className="text-xs text-muted">{q.description || 'Concept Assessment'}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setAiQuizId(q.id);
                    setAiConceptId(q.concept || '');
                    setAiModal(true);
                  }}
                  className="px-3 py-1.5 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI Generate</span>
                </button>
                <button
                  onClick={() => {
                    setBulkQuizId(q.id);
                    setBulkModal(true);
                  }}
                  className="px-3 py-1.5 bg-ivory border border-sage/60 hover:bg-sage/30 text-charcoal text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-forest" />
                  <span>Bulk Paste</span>
                </button>
                <button
                  onClick={() => handleOpenAddQuestion(q.id)}
                  className="px-3 py-1.5 bg-ivory border border-sage/60 hover:bg-sage/30 text-forest text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Manual</span>
                </button>
                <button
                  onClick={() => handleDeleteQuiz(q.id)}
                  className="p-1.5 rounded-xl hover:bg-red-50 text-red-600"
                  title="Delete Quiz"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Questions preview */}

            <div className="space-y-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Questions ({q.questions?.length || 0})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.questions?.map((ques, idx) => (
                  <div key={ques.id} className="p-3.5 rounded-2xl bg-ivory/50 border border-sage/40 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-charcoal">
                      <span>Q{idx + 1}: {ques.question_text.slice(0, 45)}...</span>
                      <span className="capitalize text-[10px] bg-white px-2 py-0.5 rounded border border-sage/50">
                        {ques.question_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted">
                      {ques.options?.length || 0} answer options configured
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Quiz Modal */}
      {createQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-dropdown border border-sage/60 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-sage/30">
              <h2 className="text-base font-bold text-charcoal">Create New Quiz</h2>
              <button onClick={() => setCreateQuizModal(false)} className="text-muted hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Quiz Title
                </label>
                <input
                  type="text"
                  required
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  placeholder="e.g. Variables & Memory Reference Quiz"
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                    Track
                  </label>
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="w-full px-3 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm"
                  >
                    {technologies.map((t) => (
                      <option key={t.id} value={t.slug}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                    Associated Concept
                  </label>
                  <select
                    value={quizForm.concept}
                    onChange={(e) => setQuizForm({ ...quizForm, concept: e.target.value })}
                    className="w-full px-3 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm"
                  >
                    {concepts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                    Passing Score %
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={quizForm.passing_score_percentage}
                    onChange={(e) => setQuizForm({ ...quizForm, passing_score_percentage: parseInt(e.target.value) || 70 })}
                    className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quizForm.time_limit_minutes}
                    onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: parseInt(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  placeholder="Test student comprehension of this technical topic..."
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage/30">
                <button
                  type="button"
                  onClick={() => setCreateQuizModal(false)}
                  className="px-4 py-2 border border-sage/60 rounded-xl text-xs font-semibold text-charcoal hover:bg-lightgrey"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest hover:bg-forest-dark text-ivory rounded-xl text-xs font-semibold shadow-sm"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {addQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-dropdown border border-sage/60 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-sage/30">
              <h2 className="text-base font-bold text-charcoal">Add Question to Quiz</h2>
              <button onClick={() => setAddQuestionModal(false)} className="text-muted hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Question Type
                </label>
                <select
                  value={questionForm.question_type}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}
                  className="w-full px-3 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold"
                >
                  <option value="mcq">Multiple Choice Questions (MCQ)</option>
                  <option value="true_false">True or False</option>
                  <option value="predict_output">Predict the Output</option>
                  <option value="find_error">Find the Error</option>
                  <option value="fill_blank">Fill in the Blanks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Question Statement
                </label>
                <textarea
                  rows="2"
                  required
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  placeholder="What is the output of the following code?"
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Code Snippet (Optional)
                </label>
                <textarea
                  rows="3"
                  value={questionForm.code_snippet}
                  onChange={(e) => setQuestionForm({ ...questionForm, code_snippet: e.target.value })}
                  placeholder={`x = 10\ny = x\nprint(y)`}
                  className="w-full px-3.5 py-2 bg-forest-dark text-sage-light font-mono text-xs border border-forest-border rounded-xl resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-2 uppercase tracking-wider">
                  Answer Options (Select the correct radio):
                </label>
                <div className="space-y-2">
                  {questionForm.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={opt.is_correct}
                        onChange={() => {
                          const updated = questionForm.options.map((o, idx) => ({
                            ...o,
                            is_correct: idx === oIdx,
                          }));
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                        className="text-forest focus:ring-forest"
                      />
                      <input
                        type="text"
                        required
                        value={opt.option_text}
                        onChange={(e) => {
                          const updated = [...questionForm.options];
                          updated[oIdx].option_text = e.target.value;
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                        placeholder={`Option ${oIdx + 1}`}
                        className="w-full px-3 py-1.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Answer Explanation
                </label>
                <textarea
                  rows="2"
                  required
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Explain why this option is correct..."
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage/30">
                <button
                  type="button"
                  onClick={() => setAddQuestionModal(false)}
                  className="px-4 py-2 border border-sage/60 rounded-xl text-xs font-semibold text-charcoal hover:bg-lightgrey"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest hover:bg-forest-dark text-ivory rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click AI Quiz Generator Modal */}
      {aiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-sage/40">
            <div className="flex items-center justify-between pb-4 border-b border-sage/30">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-forest-dark">✨ 1-Click AI Quiz Generator</h3>
                  <p className="text-xs text-muted">Generate MCQs directly from published lesson notes</p>
                </div>
              </div>
              <button
                onClick={() => setAiModal(false)}
                className="p-1 rounded-lg text-muted hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateAIQuiz} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Target Quiz Container
                </label>
                <select
                  required
                  value={aiQuizId}
                  onChange={(e) => setAiQuizId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="">Select Quiz to populate</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Source Lesson Concept
                </label>
                <select
                  required
                  value={aiConceptId}
                  onChange={(e) => setAiConceptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="">Select concept note to test</option>
                  {allConcepts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.technology_name ? `${c.technology_name} - ` : ''}{c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAiNumQuestions(num)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        aiNumQuestions === num
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-ivory text-charcoal border-sage/60 hover:bg-sage/20'
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                Gemini AI will analyze your notes, definitions, common mistakes, and code examples to create multiple-choice questions with full explanations.
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage/30">
                <button
                  type="button"
                  onClick={() => setAiModal(false)}
                  className="px-4 py-2 border border-sage/60 rounded-xl text-xs font-semibold text-charcoal hover:bg-lightgrey"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiGenerating ? 'Generating Quiz...' : 'Generate with Gemini'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Question Import Modal */}
      {bulkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-sage/40">
            <div className="flex items-center justify-between pb-4 border-b border-sage/30">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-forest-dark">📋 Bulk Question Paste</h3>
                  <p className="text-xs text-muted">Paste questions from Word, PDF, or WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setBulkModal(false)}
                className="p-1 rounded-lg text-muted hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Target Quiz
                </label>
                <select
                  required
                  value={bulkQuizId}
                  onChange={(e) => setBulkQuizId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="">Select Target Quiz</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider">
                    Paste Questions Text
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkRawText(`1. What is the output of print(type([])) in Python?\nA) <class 'list'>\nB) <class 'array'>\nC) <class 'tuple'>\nD) <class 'dict'>\nAns: A\nExp: In Python, square brackets define a built-in list object.`);
                    }}
                    className="text-[11px] text-forest underline hover:text-forest-dark"
                  >
                    Insert Example Template
                  </button>
                </div>
                <textarea
                  rows="7"
                  required
                  value={bulkRawText}
                  onChange={(e) => setBulkRawText(e.target.value)}
                  placeholder={`1. Question text here?\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\nAns: B\nExp: Explanation here...`}
                  className="w-full px-3.5 py-2.5 bg-ivory/60 border border-sage/60 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage/30">
                <button
                  type="button"
                  onClick={() => setBulkModal(false)}
                  className="px-4 py-2 border border-sage/60 rounded-xl text-xs font-semibold text-charcoal hover:bg-lightgrey"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkImporting}
                  className="px-5 py-2 bg-forest hover:bg-forest-dark text-ivory rounded-xl text-xs font-semibold shadow-sm flex items-center space-x-1.5 disabled:opacity-60"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>{bulkImporting ? 'Importing...' : 'Parse & Import'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  );
};

export default ManageQuizzesPage;
