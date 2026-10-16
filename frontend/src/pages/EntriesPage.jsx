import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getEntries, deleteEntry, toggleFavorite } from '../api/entriesClient';
import EntryCard from '../components/EntryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { MOODS } from '../components/MoodSelector';

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mood, setMood] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEntries({
        page,
        per_page: 9,
        search,
        mood,
        favorite: favoriteOnly ? 'true' : '',
      });
      setEntries(data.entries || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Failed to load entries', e);
    } finally {
      setLoading(false);
    }
  }, [page, search, mood, favoriteOnly]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setMood('');
    setFavoriteOnly(false);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this journal entry?')) return;
    await deleteEntry(id);
    loadEntries();
  };

  const handleToggleFavorite = async (id) => {
    const result = await toggleFavorite(id);
    setEntries((prev) => prev.map((e) => (e.id === id ? result.entry : e)));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Journal Entries
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {total} {total === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Browse, search, and reflect on your past thoughts and memories.
          </p>
        </div>

        <Link
          to="/entries/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 shrink-0"
        >
          <span>✏️</span> New Entry
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#16162a] border border-white/5 rounded-2xl p-4 md:p-5 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title, thoughts, or content..."
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Favorites Filter Toggle */}
          <button
            onClick={() => {
              setFavoriteOnly((prev) => !prev);
              setPage(1);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-2 shrink-0 ${
              favoriteOnly
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm shadow-yellow-500/10'
                : 'bg-[#0f0f1a] text-slate-400 hover:text-white border-white/10 hover:border-white/20'
            }`}
          >
            <span>★</span>
            <span>Favorites only</span>
          </button>
        </div>

        {/* Mood filter pill chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
          <span className="text-xs text-slate-500 mr-1">Filter by Mood:</span>
          <button
            onClick={() => {
              setMood('');
              setPage(1);
            }}
            className={`text-xs px-3 py-1 rounded-lg transition-all ${
              mood === ''
                ? 'bg-indigo-600 text-white font-medium shadow'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All
          </button>
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => {
                setMood(mood === m.value ? '' : m.value);
                setPage(1);
              }}
              className={`text-xs px-3 py-1 rounded-lg transition-all flex items-center gap-1 border ${
                mood === m.value
                  ? 'border-indigo-500/50 bg-indigo-500/20 text-white font-medium'
                  : 'border-transparent bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Entries Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" text="Loading journal entries..." />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 bg-[#16162a] border border-white/5 rounded-2xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-3xl flex items-center justify-center mx-auto mb-4">
            📝
          </div>
          <h3
            className="text-xl font-bold text-white mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {search || mood || favoriteOnly ? 'No matching entries' : 'No journal entries yet'}
          </h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {search || mood || favoriteOnly
              ? 'Try modifying or clearing your filters to see more results.'
              : 'Write your thoughts, milestones, or memories to start building your personal journal.'}
          </p>

          {search || mood || favoriteOnly ? (
            <button
              onClick={handleClearFilters}
              className="inline-flex px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 text-xs font-semibold transition-colors"
            >
              Clear All Filters
            </button>
          ) : (
            <Link
              to="/entries/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <span>✏️</span> Write First Entry
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-[#16162a] border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors text-xs font-medium cursor-pointer"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-xs font-medium text-slate-400 bg-[#16162a] border border-white/5 rounded-xl">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-[#16162a] border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors text-xs font-medium cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
