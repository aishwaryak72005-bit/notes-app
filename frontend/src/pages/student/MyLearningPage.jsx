import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Terminal,
  Code2,
  Database,
  Brain,
} from 'lucide-react';

const MyLearningPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        setLoading(true);
        const data = await contentService.getTechnologies();
        setTechnologies(data.filter((t) => t.is_popular || t.name === 'Python' || t.name === 'React' || t.name === 'Django'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLearning();
  }, []);

  if (loading) return <Loader message="Loading active learning tracks..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
          My Active Learning Tracks
        </h1>
        <p className="text-sm text-muted mt-1">
          Continue where you left off across all your enrolled technical curriculum modules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {technologies.map((t) => {
          const isPython = t.name === 'Python';
          const completion = isPython ? 45 : 15;
          const currentModule = isPython ? 'Python Basics' : (t.modules?.[0]?.title || 'Fundamentals');
          const nextTopic = isPython ? 'Variables' : 'Introduction & Syntax';

          return (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-sage/40 flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] uppercase font-bold text-forest bg-sage/40 px-2.5 py-1 rounded-full border border-sage/60">
                    {t.category_name}
                  </span>
                  <span className="text-xs font-bold text-forest">{completion}% Complete</span>
                </div>

                <h2 className="text-xl font-extrabold text-charcoal mt-3">{t.name}</h2>
                <p className="text-xs text-muted mt-1 line-clamp-2">{t.description}</p>

                <div className="mt-4 p-4 rounded-2xl bg-ivory/80 border border-sage/50">
                  <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Current Module</div>
                  <div className="text-sm font-bold text-forest-dark mt-0.5">{currentModule}</div>
                  <div className="text-xs text-muted mt-1">
                    Next Concept: <strong className="text-charcoal">{nextTopic}</strong>
                  </div>

                  <div className="w-full h-2 bg-sage/40 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-forest rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  to={`/technologies/${t.slug}`}
                  className="text-xs font-semibold text-muted hover:text-charcoal"
                >
                  View Full Syllabus
                </Link>

                <Link
                  to={`/learn/${t.slug}/${t.modules?.[0]?.slug || 'basics'}/${t.modules?.[0]?.concepts?.[0]?.slug || 'variables'}`}
                  className="px-5 py-2.5 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                >
                  <PlayCircle className="w-4 h-4 text-sage" />
                  <span>Resume Course</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyLearningPage;
