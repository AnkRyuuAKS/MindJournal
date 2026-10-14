import { Link } from 'react-router-dom';
import { MOODS } from './MoodSelector';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function EntryCard({ entry, onDelete, onToggleFavorite }) {
  const mood = MOODS.find((m) => m.value === entry.mood) || MOODS[3];

  return (
    <div className="group bg-[#16162a] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{mood.emoji}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-400">
            {mood.label}
          </span>
          {entry.is_favorite && <span className="text-yellow-400 text-sm">★</span>}
        </div>
        <span className="text-xs text-slate-500">{formatDate(entry.created_at)}</span>
      </div>

      <Link to={`/entries/${entry.id}`}>
        <h3 className="text-white font-semibold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {entry.title}
        </h3>
        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{entry.content}</p>
      </Link>

      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {entry.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={`/entries/${entry.id}/edit`}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => onToggleFavorite?.(entry.id)}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors"
        >
          {entry.is_favorite ? 'Unfavorite' : 'Favorite'}
        </button>
        <button
          onClick={() => onDelete?.(entry.id)}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors ml-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
