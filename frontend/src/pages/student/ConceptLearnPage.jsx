import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { progressService } from '../../services/progressService';
import CodeBlock from '../../components/notes/CodeBlock';
import Loader from '../../components/common/Loader';
import {
  BookOpen,
  Bookmark,
  Sparkles,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Code,
  Terminal,
  FileText,
  Clock,
  BarChart,
  ArrowRight,
  Share2,
  Download,
  ExternalLink,
  Lock,
  Eye,
} from 'lucide-react';


const ConceptLearnPage = () => {
  const { techSlug, moduleSlug, conceptSlug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [techData, setTechData] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeConcept, setActiveConcept] = useState(null);
  const [note, setNote] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [mobileTopicsOpen, setMobileTopicsOpen] = useState(false);

  useEffect(() => {
    const fetchConceptNotes = async () => {
      try {
        setLoading(true);
        // 1. Fetch technology details with modules & concepts
        const currentTechSlug = techSlug || 'python';
        const tech = await contentService.getTechnology(currentTechSlug);
        setTechData(tech);

        // 2. Determine active module
        const modules = tech.modules || [];
        const currentMod = modules.find((m) => m.slug === moduleSlug) || modules[0];
        setActiveModule(currentMod);

        if (currentMod && currentMod.concepts?.length > 0) {
          // 3. Determine active concept
          const currentConceptShort = currentMod.concepts.find((c) => c.slug === conceptSlug) || currentMod.concepts[0];
          
          // Fetch full concept with note
          const fullConcept = await contentService.getConcept(currentConceptShort.id);
          setActiveConcept(fullConcept);
          setNote(fullConcept.note);

          // 4. Fetch bookmark & progress status
          try {
            const isMarked = await progressService.checkBookmark(fullConcept.id);
            setIsBookmarked(isMarked);
            const status = await progressService.checkProgress(fullConcept.id);
            setIsCompleted(status.is_completed);
          } catch (e) {
            console.warn('Progress check error:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load concept notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConceptNotes();
  }, [techSlug, moduleSlug, conceptSlug]);

  const handleToggleBookmark = async () => {
    if (!activeConcept) return;
    try {
      const res = await progressService.toggleBookmark(activeConcept.id);
      setIsBookmarked(res.bookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeConcept) return;
    setMarkingComplete(true);
    try {
      await progressService.markComplete(activeConcept.id);
      setIsCompleted(true);
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  // Find previous and next concepts
  const currentConcepts = activeModule?.concepts || [];
  const currentIndex = currentConcepts.findIndex((c) => c.id === activeConcept?.id);
  const prevConcept = currentIndex > 0 ? currentConcepts[currentIndex - 1] : null;
  const nextConcept = currentIndex < currentConcepts.length - 1 ? currentConcepts[currentIndex + 1] : null;

  const navigateToConcept = (concept) => {
    navigate(`/learn/${techData?.slug}/${activeModule?.slug}/${concept.slug}`);
    setMobileTopicsOpen(false);
  };

  if (loading) {
    return <Loader message="Opening Technical Concept Notes..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto selection:bg-brand selection:text-white">
      {/* Breadcrumb Header matching SyntaxHawk theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 font-sans">
          <Link to="/technologies" className="hover:text-brand transition-colors">Technologies</Link>
          <span>/</span>
          <Link to={`/technologies/${techData?.slug}`} className="hover:text-brand font-semibold text-white transition-colors">
            {techData?.name}
          </Link>
          <span>/</span>
          <span className="text-gray-300">{activeModule?.title}</span>
          <span>/</span>
          <span className="text-brand font-bold">{activeConcept?.title}</span>
        </div>

        {/* Action Buttons: Ask AI & Practise Quiz */}
        <div className="flex items-center space-x-2">
          <Link
            to={`/ai-tutor?concept=${activeConcept?.id}&title=${encodeURIComponent(activeConcept?.title || '')}`}
            className="px-3.5 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border border-brand/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Ask AI Tutor</span>
          </Link>

          <Link
            to={`/quiz/${activeConcept?.id}`}
            className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-brand/20 transition-all font-heading"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Practise Quiz</span>
          </Link>
        </div>
      </div>

      {/* Mobile Toggle Button for Topics */}
      <button
        onClick={() => setMobileTopicsOpen(!mobileTopicsOpen)}
        className="lg:hidden w-full flex items-center justify-between p-3.5 bg-[#111827] border border-white/10 rounded-2xl text-xs font-semibold text-white hover:border-brand/40 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-brand" />
          <span>{activeModule?.title} — Topics ({currentConcepts.length})</span>
        </div>
        <span className="text-brand text-[11px] font-bold font-small">
          {mobileTopicsOpen ? 'Hide Topics ▲' : 'Browse Topics ▼'}
        </span>
      </button>

      {/* Main Learning Workspace Split: Concepts Navigator on Left, Rich Note on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Module Concepts Sidebar Navigator */}
        <div className={`${mobileTopicsOpen ? 'block' : 'hidden'} lg:block bg-[#111827] rounded-3xl p-5 shadow-xl border border-white/10 space-y-4`}>
          <div className="pb-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-small">Module</span>
              <h2 className="text-sm font-bold text-white font-heading">{activeModule?.title}</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand/20 text-brand font-small">
              {currentConcepts.length} Topics
            </span>
          </div>

          <div className="space-y-1 max-h-[60vh] lg:max-h-none overflow-y-auto">
            {currentConcepts.map((conc, idx) => {
              const isActive = conc.id === activeConcept?.id;
              return (
                <button
                  key={conc.id}
                  onClick={() => navigateToConcept(conc)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-brand/15 text-brand font-bold shadow-xs border border-brand/40'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-brand text-white' : 'bg-[#181924] text-gray-400 border border-white/5'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="truncate">{conc.title}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10">
            <Link
              to={`/technologies/${techData?.slug}`}
              className="text-xs text-brand font-semibold hover:underline block text-center font-sans"
            >
              ← Back to All Modules
            </Link>
          </div>
        </div>

        {/* Right: Notes Viewer */}
        <div className="lg:col-span-3 bg-[#111827] rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/10 space-y-6">
          {/* Header Row: Title, Prev/Next Navigation, Bookmark */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-brand/20 text-brand uppercase tracking-wider font-small">
                Concept Notes
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-heading">
                {note?.title || activeConcept?.title}
              </h1>
              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1.5 font-small">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeConcept?.estimated_minutes || 10} min read</span>
                </span>
                <span className="flex items-center space-x-1">
                  <BarChart className="w-3.5 h-3.5" />
                  <span className="capitalize">{activeConcept?.difficulty_level || 'Beginner'}</span>
                </span>
              </div>
            </div>

            {/* Quick Actions (Bookmark + Prev/Next Controls) */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleBookmark}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this Concept'}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isBookmarked
                    ? 'bg-brand/20 text-brand border-brand/50'
                    : 'bg-[#181924] text-gray-400 border-white/10 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <div className="flex items-center space-x-1 bg-[#181924] rounded-2xl p-1 border border-white/10">
                <button
                  disabled={!prevConcept}
                  onClick={() => prevConcept && navigateToConcept(prevConcept)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Previous Concept"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!nextConcept}
                  onClick={() => nextConcept && navigateToConcept(nextConcept)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Next Concept"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 1. Simple Definition */}
          {note?.definition && (
            <div className="p-4 sm:p-5 rounded-2xl bg-brand/10 border border-brand/30">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand mb-1 font-small">
                Definition
              </h2>
              <p className="text-sm sm:text-base font-medium text-white leading-relaxed font-sans">
                {note.definition}
              </p>
            </div>
          )}

          {/* 2. Syntax */}
          {note?.syntax && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-small">
                Syntax
              </h2>
              <div className="p-3.5 rounded-2xl bg-[#181924] border border-white/10 font-mono text-xs sm:text-sm text-brand font-semibold overflow-x-auto">
                <code>{note.syntax}</code>
              </div>
            </div>
          )}

          {/* 3. Code Example & Expected Output */}
          {note?.code_example && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-small">
                Code Example
              </h2>
              <CodeBlock
                code={note.code_example}
                language={note.code_language || 'python'}
                title={`${techData?.slug || 'code'}_example.${note.code_language === 'python' ? 'py' : 'js'}`}
              />

              {note?.expected_output && (
                <div className="mt-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-small">
                    Expected Output
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-[#090A0F] text-emerald-400 font-mono text-xs border border-white/10 whitespace-pre overflow-x-auto">
                    {note.expected_output}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Detailed Explanation */}
          {note?.explanation && (
            <div className="space-y-2 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-small">
                Detailed Explanation
              </h2>
              <div
                className="text-sm text-gray-300 leading-relaxed space-y-3 prose prose-invert max-w-none font-sans"
                dangerouslySetInnerHTML={{ __html: note.explanation }}
              />
            </div>
          )}

          {/* 5. Real-World Analogy */}
          {note?.real_world_analogy && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 font-small">
                  Real-World Analogy
                </h2>
                <p className="text-xs sm:text-sm text-amber-200 leading-relaxed font-sans">
                  {note.real_world_analogy}
                </p>
              </div>
            </div>
          )}

          {/* 6. Common Mistakes */}
          {note?.common_mistakes && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1 font-small">
                  Common Mistakes to Avoid
                </h2>
                <p className="text-xs sm:text-sm text-red-200 leading-relaxed whitespace-pre-line font-sans">
                  {note.common_mistakes}
                </p>
              </div>
            </div>
          )}

          {/* 7. Important Points */}
          {note?.important_points && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 font-small">
                  Key Takeaways & Best Practices
                </h2>
                <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed whitespace-pre-line font-sans">
                  {note.important_points}
                </p>
              </div>
            </div>
          )}

          {/* 8. Interview Corner */}
          {note?.interview_questions && (
            <div className="p-5 rounded-2xl bg-[#181924] border border-brand/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand text-white uppercase tracking-wider font-small">
                    Interview Corner
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                    Top Technical Interview Questions
                  </h2>
                </div>
                <Link
                  to="/ai-tutor"
                  state={{ prompt: `Can you quiz me on ${activeConcept?.title || 'this topic'} interview questions?` }}
                  className="text-[11px] font-semibold text-brand hover:underline flex items-center space-x-1 font-small"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Practice with AI Tutor →</span>
                </Link>
              </div>
              <div className="text-xs sm:text-sm text-gray-200 whitespace-pre-line leading-relaxed font-sans bg-[#090A0F] p-4 rounded-xl border border-white/5">
                {note.interview_questions}
              </div>
            </div>
          )}

          {/* 9. Online Document Viewer & Downloadable Resource */}
          {note?.resource_url && (
            <div className="p-5 rounded-2xl bg-[#181924] border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block font-heading">
                    Original Study Document ({note.resource_url.split('.').pop().toUpperCase()})
                  </span>
                  <span className="text-[11px] text-gray-400 break-all font-sans">{note.resource_url}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowDocViewer(!showDocViewer)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand" />
                    <span>{showDocViewer ? 'Hide Document Reader' : '📖 Read Online'}</span>
                  </button>

                  {note.allow_download !== false ? (
                    <a
                      href={note.resource_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand/20 transition-colors font-heading"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  ) : (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white/5 text-gray-400 text-xs font-medium rounded-xl border border-white/5">
                      <Lock className="w-3.5 h-3.5 text-gray-500" />
                      <span>Downloads Restricted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* In-Browser Document Viewer Pane */}
              {showDocViewer && (
                <div className="pt-3 border-t border-white/10">
                  <div className="bg-[#090A0F] rounded-2xl p-2 border border-white/10">
                    <iframe
                      src={
                        note.resource_url.toLowerCase().endsWith('.pdf')
                          ? note.resource_url
                          : `https://docs.google.com/viewer?url=${encodeURIComponent(
                              note.resource_url.startsWith('http')
                                ? note.resource_url
                                : window.location.origin + note.resource_url
                            )}&embedded=true`
                      }
                      className="w-full h-[360px] sm:h-[520px] rounded-xl border border-white/10"
                      title="Online Document Reader"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completion Bar & Navigation Footer */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleMarkComplete}
              disabled={isCompleted || markingComplete}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/20 font-heading'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isCompleted ? 'Topic Completed ✓' : markingComplete ? 'Saving...' : 'Mark as Completed'}</span>
            </button>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              {prevConcept && (
                <button
                  onClick={() => navigateToConcept(prevConcept)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all font-sans"
                >
                  ← {prevConcept.title}
                </button>
              )}
              {nextConcept && (
                <button
                  onClick={() => navigateToConcept(nextConcept)}
                  className="px-4 py-2 bg-brand/20 hover:bg-brand/30 text-brand border border-brand/30 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 font-heading"
                >
                  <span>Next: {nextConcept.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptLearnPage;
