import { Link } from 'react-router-dom';
import { MOODS } from './MoodSelector';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getWordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function EntryCard({ entry, onDelete, onToggleFavorite }) {
  const mood = MOODS.find((m) => m.value === entry.mood) || MOODS[3];
  const wordCount = getWordCount(entry.content);

  return (
    <div className="group bg-[#16162a] border border-white/5 hover:border-indigo-500/40 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 animate-fade-in flex flex-col justify-between">
      <div>
        {/* Top bar: Mood badge, Date, and Favorite Star */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5"
              style={{
                backgroundColor: `${mood.color}15`,
                color: mood.color,
                border: `1px solid ${mood.color}35`,
              }}
            >
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </span>
            <span className="text-[11px] text-slate-500">{formatDate(entry.created_at)}</span>
          </div>

          <button
            onClick={() => onToggleFavorite?.(entry.id)}
            className={`p-1.5 rounded-lg transition-colors text-base ${
              entry.is_favorite
                ? 'text-yellow-400 hover:text-yellow-300'
                : 'text-slate-600 hover:text-yellow-400 opacity-60 group-hover:opacity-100'
            }`}
            title={entry.is_favorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            ★
          </button>
        </div>

        {/* Title & Preview */}
        <Link to={`/entries/${entry.id}`} className="block group/link">
          <h3 className="text-white font-semibold text-lg mb-2 group-hover/link:text-indigo-400 transition-colors line-clamp-1">
            {entry.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed mb-3">
            {entry.content}
          </p>
        </Link>

        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer bar: Word count & Action buttons */}
      <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
        <span>{wordCount} words</span>

        <div className="flex items-center gap-2">
          <Link
            to={`/entries/${entry.id}/edit`}
            className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
          >
            ✏️ Edit
          </Link>
          <button
            onClick={() => onDelete?.(entry.id)}
            className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
