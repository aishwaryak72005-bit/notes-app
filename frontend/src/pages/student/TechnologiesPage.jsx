import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import {
  Search,
  Code2,
  Terminal,
  Database,
  Layers,
  Cpu,
  Brain,
  Sparkles,
  ChevronRight,
  FileCode,
} from 'lucide-react';

const TechnologiesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInitial = searchParams.get('search') || '';

  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchInitial);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        setLoading(true);
        const data = await contentService.getTechnologies();
        setTechnologies(data);
      } catch (err) {
        console.error('Failed to load technologies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTechs();
  }, []);

  const getTechIcon = (techName) => {
    const name = techName.toLowerCase();
    if (name.includes('python')) return <Terminal className="w-7 h-7 text-blue-500" />;
    if (name.includes('javascript') || name.includes('js')) return <FileCode className="w-7 h-7 text-yellow-500" />;
    if (name.includes('react')) return <Code2 className="w-7 h-7 text-cyan-500" />;
    if (name.includes('django')) return <Layers className="w-7 h-7 text-emerald-600" />;
    if (name.includes('sql') || name.includes('mysql') || name.includes('postgres')) return <Database className="w-7 h-7 text-blue-600" />;
    if (name.includes('machine') || name.includes('deep') || name.includes('ai')) return <Brain className="w-7 h-7 text-purple-600" />;
    if (name.includes('llm') || name.includes('nlp')) return <Sparkles className="w-7 h-7 text-indigo-500" />;
    return <Code2 className="w-7 h-7 text-forest" />;
  };

  if (loading) {
    return <Loader message="Browsing IT Technologies catalog..." />;
  }

  const categories = ['All', ...new Set(technologies.map((t) => t.category_name))];

  const filtered = technologies.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category_name === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
          Technologies Curriculum
        </h1>
        <p className="text-sm text-muted mt-1">
          Explore complete developer tracks from fundamental programming to advanced AI/ML.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-sage/40 shadow-card">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-forest text-ivory shadow-xs'
                  : 'bg-ivory text-muted hover:text-charcoal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search technologies..."
            className="w-full pl-10 pr-4 py-2 bg-ivory/60 border border-sage/60 rounded-xl text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Technologies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((tech) => (
          <div
            key={tech.id}
            onClick={() => navigate(`/technologies/${tech.slug}`)}
            className="bg-white rounded-3xl p-6 border border-sage/40 shadow-card hover:shadow-card-hover hover:border-forest/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-ivory/80 border border-sage/40 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  {getTechIcon(tech.name)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sage/40 text-forest border border-sage/60">
                  {tech.category_name}
                </span>
              </div>

              <h2 className="text-lg font-bold text-charcoal mt-4 group-hover:text-forest transition-colors">
                {tech.name}
              </h2>
              <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                {tech.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-sage/30 flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal">
                {tech.total_modules || 1} Modules • {tech.total_concepts || 5} Concepts
              </span>
              <span className="text-forest font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Learn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnologiesPage;
