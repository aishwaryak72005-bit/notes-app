import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import {
  Layers,
  Terminal,
  BookOpen,
  ChevronRight,
  Clock,
  BarChart,
  CheckCircle2,
  PlayCircle,
  FolderTree,
} from 'lucide-react';

const TechnologyDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tech, setTech] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTech = async () => {
      try {
        setLoading(true);
        const data = await contentService.getTechnology(slug);
        setTech(data);
      } catch (err) {
        console.error('Failed to load tech details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTech();
  }, [slug]);

  if (loading) {
    return <Loader message="Loading curriculum modules..." />;
  }

  if (!tech) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-charcoal">Technology Not Found</h2>
        <Link to="/technologies" className="mt-4 inline-block text-sm text-forest font-semibold underline">
          Return to Technologies
        </Link>
      </div>
    );
  }

  const modules = tech.modules || [];
  const firstModule = modules[0];
  const firstConcept = firstModule?.concepts?.[0];

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-muted">
        <Link to="/technologies" className="hover:text-forest">Technologies</Link>
        <span>/</span>
        <span className="text-forest font-bold">{tech.name}</span>
      </div>

      {/* Hero Card */}
      <div className="bg-forest-dark text-ivory rounded-3xl p-6 sm:p-10 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sage/20 text-sage border border-sage/30 uppercase tracking-wider">
            {tech.category_name}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {tech.name} Curriculum
          </h1>
          <p className="text-sm text-sage/90 leading-relaxed">
            {tech.description}
          </p>
          <div className="flex items-center space-x-5 text-xs text-sage/80 pt-2 font-medium">
            <span>{modules.length} Learning Modules</span>
            <span>•</span>
            <span>{tech.total_concepts || 20} Technical Concepts</span>
          </div>
        </div>

        {firstConcept && (
          <Link
            to={`/learn/${tech.slug}/${firstModule.slug}/${firstConcept.slug}`}
            className="px-6 py-3.5 bg-sage hover:bg-white text-forest-dark font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 flex-shrink-0"
          >
            <PlayCircle className="w-5 h-5 text-forest" />
            <span>Start Learning Track</span>
          </Link>
        )}
      </div>

      {/* Modules & Concepts List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-charcoal flex items-center space-x-2">
          <FolderTree className="w-5 h-5 text-forest" />
          <span>Curriculum Modules</span>
        </h2>

        {modules.map((mod, index) => (
          <div
            key={mod.id}
            className="bg-white rounded-3xl p-6 shadow-card border border-sage/40 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-sage/30">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-forest/10 text-forest font-extrabold text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold text-charcoal">{mod.title}</h3>
                  <p className="text-xs text-muted mt-0.5">{mod.description}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted">
                {mod.concepts?.length || 0} Concepts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mod.concepts?.map((c, cIdx) => (
                <Link
                  key={c.id}
                  to={`/learn/${tech.slug}/${mod.slug}/${c.slug}`}
                  className="p-3.5 rounded-2xl bg-ivory/60 hover:bg-sage/20 border border-sage/50 hover:border-forest/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="text-xs font-mono font-bold text-muted group-hover:text-forest">
                      {index + 1}.{cIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-charcoal group-hover:text-forest truncate">
                      {c.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-forest group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnologyDetailPage;
