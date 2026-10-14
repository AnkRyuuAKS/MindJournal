import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEntry, deleteEntry, toggleFavorite } from '../api/entriesClient';
import { MOODS } from '../components/MoodSelector';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function ViewEntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEntry(id).then((d) => setEntry(d.entry)).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this entry?')) return;
    await deleteEntry(id);
    navigate('/entries');
  };

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(id);
    setEntry(result.entry);
  };

  if (loading) return <div className="flex justify-center items-center h-full p-16"><LoadingSpinner size="lg" /></div>;
  if (!entry) return <div className="p-8 text-slate-400">Entry not found.</div>;

  const mood = MOODS.find((m) => m.value === entry.mood) || MOODS[3];

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-white transition-colors text-sm">← Back</button>
      </div>

      <div className="bg-[#16162a] border border-white/5 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-sm px-3 py-1 rounded-full bg-white/5 text-slate-400">{mood.label}</span>
              {entry.is_favorite && <span className="text-yellow-400">★ Favorite</span>}
            </div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              {entry.title}
            </h1>
            <p className="text-slate-500 text-sm mt-2">{formatDate(entry.created_at)}</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
        </div>

        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/5">
            {entry.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400">#{tag}</span>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
          <Link
            to={`/entries/${entry.id}/edit`}
            className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors text-sm font-medium"
          >
            Edit Entry
          </Link>
          <button
            onClick={handleToggleFavorite}
            className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors text-sm"
          >
            {entry.is_favorite ? '★ Unfavorite' : '☆ Favorite'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm ml-auto"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
