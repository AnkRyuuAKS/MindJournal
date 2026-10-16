import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getDSAQuestions, deleteDSAQuestion } from '../api/dsaClient';
import DSACard from '../components/DSACard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DSAPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [globalReveal, setGlobalReveal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDSAQuestions();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load DSA revision questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDSAQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error('Failed to delete question', err);
      alert('Failed to delete question. Please try again.');
    }
  };

  // Filter questions based on search query (number, heading, description, approach)
  const filteredQuestions = useMemo(() => {
    if (!search.trim()) return questions;
    const q = search.toLowerCase();
    return questions.filter(
      (item) =>
        (item.number && item.number.toLowerCase().includes(q)) ||
        (item.heading && item.heading.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.approach && item.approach.toLowerCase().includes(q))
    );
  }, [questions, search]);

  const handleToggleAll = () => {
    setGlobalReveal((prev) => (prev === true ? false : true));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              DSA Revision Cards
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {questions.length} {questions.length === 1 ? 'card' : 'cards'}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Active recall cards to revise problem patterns, approaches, and complexities.
          </p>
        </div>

        <Link
          to="/dsa/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 shrink-0"
        >
          <span>➕</span> Add Revision Question
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadQuestions}
            className="underline hover:text-red-300 ml-4 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Quick Filters Toolbar */}
      <div className="bg-[#16162a] border border-white/5 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, #number, problem details, or approach..."
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Global Reveal / Recall Mode Toggle */}
        {questions.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleAll}
              className="text-xs px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <span>{globalReveal === true ? '🙈' : '👁️'}</span>
              <span>{globalReveal === true ? 'Hide All Approaches' : 'Reveal All Approaches'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-24">
          <LoadingSpinner />
        </div>
      ) : questions.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-[#16162a] border border-white/5 rounded-2xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-3xl flex items-center justify-center mx-auto mb-4">
            🧠
          </div>
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            No Revision Cards Yet
          </h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Start building your personal DSA revision library. Capture tricky questions, algorithms, and active-recall notes.
          </p>
          <Link
            to="/dsa/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
          >
            <span>➕</span> Add Your First DSA Question
          </Link>
        </div>
      ) : filteredQuestions.length === 0 ? (
        /* No search results */
        <div className="text-center py-16 bg-[#16162a] border border-white/5 rounded-2xl p-6">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-white font-medium mb-1">No matching revision cards found</p>
          <p className="text-slate-500 text-xs mb-4">Try searching with a different keyword, question number, or pattern.</p>
          <button
            onClick={() => setSearch('')}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 transition-colors"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {filteredQuestions.map((q) => (
            <DSACard
              key={q.id}
              question={q}
              onDelete={handleDelete}
              globalReveal={globalReveal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
