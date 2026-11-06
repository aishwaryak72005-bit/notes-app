import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import Loader from '../../components/common/Loader';
import {
  Bookmark,
  Trash2,
  BookOpen,
  ArrowRight,
  Clock,
  BarChart,
  Search,
} from 'lucide-react';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState('All');
  const [search, setSearch] = useState('');

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await progressService.getBookmarks();
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemove = async (conceptId) => {
    try {
      await progressService.toggleBookmark(conceptId);
      setBookmarks((prev) => prev.filter((b) => b.concept !== conceptId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader message="Loading your saved bookmarks..." />;

  const techFilters = ['All', ...new Set(bookmarks.map((b) => b.technology_name))];

  const filtered = bookmarks.filter((b) => {
    const matchesTech = selectedTech === 'All' || b.technology_name === selectedTech;
    const matchesSearch =
      b.concept_title.toLowerCase().includes(search.toLowerCase()) ||
      b.technology_name.toLowerCase().includes(search.toLowerCase()) ||
      b.module_title.toLowerCase().includes(search.toLowerCase());
    return matchesTech && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
          Bookmarked Concepts
        </h1>
        <p className="text-sm text-muted mt-1">
          Quickly review important technical topics and notes you've saved for revision.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-sage/40 shadow-card">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {techFilters.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTech(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTech === t
                  ? 'bg-forest text-ivory shadow-xs'
                  : 'bg-ivory text-muted hover:text-charcoal'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved bookmarks..."
            className="w-full pl-10 pr-4 py-2 bg-ivory/60 border border-sage/60 rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white"
          />
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-sage/40 shadow-card space-y-4">
          <Bookmark className="w-12 h-12 text-forest/40 mx-auto" />
          <h2 className="text-lg font-bold text-charcoal">No Saved Bookmarks Found</h2>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Click the bookmark icon on any concept note page to save it for quick revision.
          </p>
          <Link
            to="/technologies"
            className="inline-block px-5 py-2.5 bg-forest text-ivory text-xs font-semibold rounded-xl shadow-xs"
          >
            Explore Technologies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-sage/40 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sage/50 text-forest border border-sage/60">
                    {b.technology_name}
                  </span>
                  <button
                    onClick={() => handleRemove(b.concept)}
                    className="p-1.5 rounded-xl text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-base font-bold text-charcoal mt-3 group-hover:text-forest transition-colors">
                  {b.concept_title}
                </h2>
                <p className="text-xs text-muted mt-1">Module: {b.module_title}</p>

                <div className="flex items-center space-x-3 text-[11px] text-muted mt-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{b.estimated_minutes || 10} min</span>
                  </span>
                  <span>•</span>
                  <span className="capitalize">{b.difficulty_level || 'Beginner'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-sage/30 flex items-center justify-between">
                <Link
                  to={`/learn/${b.technology_slug}/${b.module_slug}/${b.concept_slug}`}
                  className="w-full py-2 bg-ivory hover:bg-forest hover:text-ivory text-forest text-xs font-semibold rounded-xl text-center transition-all flex items-center justify-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Concept Notes</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
