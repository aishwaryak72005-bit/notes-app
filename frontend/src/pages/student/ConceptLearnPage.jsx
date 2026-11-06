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
  };

  if (loading) {
    return <Loader message="Opening Technical Concept Notes..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Breadcrumb Header matching mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sage/40">
        <div className="flex items-center space-x-2 text-xs text-muted">
          <Link to="/technologies" className="hover:text-forest">Technologies</Link>
          <span>/</span>
          <Link to={`/technologies/${techData?.slug}`} className="hover:text-forest font-semibold text-charcoal">
            {techData?.name}
          </Link>
          <span>/</span>
          <span>{activeModule?.title}</span>
          <span>/</span>
          <span className="text-forest font-bold">{activeConcept?.title}</span>
        </div>

        {/* Action Buttons: Ask AI & Practise Quiz */}
        <div className="flex items-center space-x-2">
          <Link
            to={`/ai-tutor?concept=${activeConcept?.id}&title=${encodeURIComponent(activeConcept?.title || '')}`}
            className="px-3.5 py-2 bg-sage/50 hover:bg-sage text-forest-dark rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border border-sage"
          >
            <Sparkles className="w-3.5 h-3.5 text-forest" />
            <span>Ask AI Tutor</span>
          </Link>

          <Link
            to={`/quiz/${activeConcept?.id}`}
            className="px-4 py-2 bg-forest hover:bg-forest-dark text-ivory rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sage" />
            <span>Practise Quiz</span>
          </Link>
        </div>
      </div>

      {/* Main Learning Workspace Split: Concepts Navigator on Left, Rich Note on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Module Concepts Sidebar Navigator (Matching Screenshot) */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-sage/40 space-y-4">
          <div className="pb-3 border-b border-sage/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Module</span>
              <h2 className="text-sm font-bold text-forest-dark">{activeModule?.title}</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sage/40 text-forest">
              {currentConcepts.length} Topics
            </span>
          </div>

          <div className="space-y-1">
            {currentConcepts.map((conc, idx) => {
              const isActive = conc.id === activeConcept?.id;
              return (
                <button
                  key={conc.id}
                  onClick={() => navigateToConcept(conc)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-sage/70 text-forest-dark font-bold shadow-xs border border-sage'
                      : 'text-charcoal hover:bg-ivory hover:text-forest'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-forest text-ivory' : 'bg-lightgrey text-muted'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="truncate">{conc.title}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-forest flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-sage/30">
            <Link
              to={`/technologies/${techData?.slug}`}
              className="text-xs text-forest font-semibold hover:underline block text-center"
            >
              ← Back to All Modules
            </Link>
          </div>
        </div>

        {/* Right: Notes Viewer (Matching Concept Notes in Screenshot) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage/40 space-y-6">
          {/* Header Row: Title, Prev/Next Navigation, Bookmark */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/30">
            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-sage/40 text-forest uppercase tracking-wider">
                Concept Notes
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal mt-2">
                {note?.title || activeConcept?.title}
              </h1>
              <div className="flex items-center space-x-4 text-xs text-muted mt-1.5">
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
                    ? 'bg-amber-50 text-amber-600 border-amber-300'
                    : 'bg-white text-muted border-sage/60 hover:text-charcoal hover:bg-sage/20'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <div className="flex items-center space-x-1 bg-ivory rounded-2xl p-1 border border-sage/50">
                <button
                  disabled={!prevConcept}
                  onClick={() => prevConcept && navigateToConcept(prevConcept)}
                  className="p-1.5 rounded-xl hover:bg-white text-charcoal disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Previous Concept"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!nextConcept}
                  onClick={() => nextConcept && navigateToConcept(nextConcept)}
                  className="p-1.5 rounded-xl hover:bg-white text-charcoal disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Next Concept"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 1. Simple Definition */}
          {note?.definition && (
            <div className="p-4 sm:p-5 rounded-2xl bg-sage/20 border border-sage/60">
              <h2 className="text-xs font-bold uppercase tracking-wider text-forest mb-1">
                Definition
              </h2>
              <p className="text-sm sm:text-base font-medium text-charcoal leading-relaxed">
                {note.definition}
              </p>
            </div>
          )}

          {/* 2. Syntax */}
          {note?.syntax && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Syntax
              </h2>
              <div className="p-3.5 rounded-2xl bg-lightgrey/60 border border-sage/60 font-mono text-xs sm:text-sm text-forest-dark font-semibold">
                <code>{note.syntax}</code>
              </div>
            </div>
          )}

          {/* 3. Code Example & Expected Output */}
          {note?.code_example && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Code Example
              </h2>
              <CodeBlock
                code={note.code_example}
                language={note.code_language || 'python'}
                title={`${techData?.slug || 'code'}_example.${note.code_language === 'python' ? 'py' : 'js'}`}
              />

              {note?.expected_output && (
                <div className="mt-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                    Expected Output
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-forest-deep text-sage-light font-mono text-xs border border-forest-border/40 whitespace-pre">
                    {note.expected_output}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Detailed Explanation */}
          {note?.explanation && (
            <div className="space-y-2 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
                Detailed Explanation
              </h2>
              <div
                className="text-sm text-charcoal leading-relaxed space-y-3 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: note.explanation }}
              />
            </div>
          )}

          {/* 5. Real-World Analogy */}
          {note?.real_world_analogy && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                  Real-World Analogy
                </h2>
                <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                  {note.real_world_analogy}
                </p>
              </div>
            </div>
          )}

          {/* 6. Common Mistakes */}
          {note?.common_mistakes && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-50/70 border border-red-200/80 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-red-900 mb-1">
                  Common Mistakes to Avoid
                </h2>
                <p className="text-xs sm:text-sm text-red-950 leading-relaxed whitespace-pre-line">
                  {note.common_mistakes}
                </p>
              </div>
            </div>
          )}

          {/* 7. Important Points */}
          {note?.important_points && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                  Key Takeaways & Best Practices
                </h2>
                <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-line">
                  {note.important_points}
                </p>
              </div>
            </div>
          )}

          {/* Completion Bar & Navigation Footer */}
          <div className="pt-6 border-t border-sage/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleMarkComplete}
              disabled={isCompleted || markingComplete}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                isCompleted
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-forest hover:bg-forest-dark text-ivory shadow-sm'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isCompleted ? 'Topic Completed ✓' : markingComplete ? 'Saving...' : 'Mark as Completed'}</span>
            </button>

            <div className="flex items-center space-x-3">
              {prevConcept && (
                <button
                  onClick={() => navigateToConcept(prevConcept)}
                  className="px-4 py-2 border border-sage/60 rounded-xl text-xs font-semibold text-charcoal hover:bg-ivory transition-all"
                >
                  ← {prevConcept.title}
                </button>
              )}
              {nextConcept && (
                <button
                  onClick={() => navigateToConcept(nextConcept)}
                  className="px-4 py-2 bg-sage hover:bg-sage-dark text-forest-dark rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
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
