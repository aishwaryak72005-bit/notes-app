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
} from 'lucide-react';

const ManageQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createQuizModal, setCreateQuizModal] = useState(false);
  const [addQuestionModal, setAddQuestionModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

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
      const res = await quizService.getQuizzes();
      setQuizzes(res);
      const techs = await contentService.getTechnologies();
      setTechnologies(techs);
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

  if (loading) return <Loader message="Loading quiz assessments..." />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-dark">Quiz & Assessment Management</h1>
          <p className="text-xs text-muted mt-0.5">Create concept quizzes, manage answer options, and set explanations.</p>
        </div>

        <button
          onClick={() => setCreateQuizModal(true)}
          className="px-4 py-2 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-2xl shadow-sm flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
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

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenAddQuestion(q.id)}
                  className="px-3.5 py-1.5 bg-ivory border border-sage/60 hover:bg-sage/30 text-forest text-xs font-semibold rounded-xl flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Question</span>
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
    </div>
  );
};

export default ManageQuizzesPage;
