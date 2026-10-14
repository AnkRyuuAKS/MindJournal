import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getEntries, deleteEntry, toggleFavorite } from '../api/entriesClient';
import EntryCard from '../components/EntryCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const MOOD_FILTERS = [
  { value: '', label: 'All Moods' },
  { value: 'happy', label: '😊 Happy' },
  { value: 'excited', label: '🤩 Excited' },
  { value: 'calm', label: '😌 Calm' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'sad', label: '😢 Sad' },
  { value: 'anxious', label: '😰 Anxious' },
  { value: 'angry', label: '😠 Angry' },
];

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mood, setMood] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEntries({ page, per_page: 9, search, mood });
      setEntries(data.entries || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, mood]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await deleteEntry(id);
    loadEntries();
  };

  const handleToggleFavorite = async (id) => {
    const result = await toggleFavorite(id);
    setEntries((prev) => prev.map((e) => (e.id === id ? result.entry : e)));
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Journal Entries</h1>
          <p className="text-slate-500 text-sm mt-1">{total} entries total</p>
        </div>
        <Link
          to="/entries/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          ✏️ New Entry
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} placeholder="Search entries..." />
        </div>
        <select
          value={mood}
          onChange={(e) => { setMood(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
        >
          {MOOD_FILTERS.map((m) => (
            <option key={m.value} value={m.value} className="bg-[#16162a]">{m.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 bg-[#16162a] border border-white/5 rounded-2xl">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-white font-medium mb-2">No entries found</p>
          <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 disabled:opacity-40 transition-colors text-sm"
          >
            ← Prev
          </button>
          <span className="px-4 py-2 text-sm text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 disabled:opacity-40 transition-colors text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
