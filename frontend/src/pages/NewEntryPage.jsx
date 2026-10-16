import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createEntry } from '../api/entriesClient';
import MoodSelector, { MOODS } from '../components/MoodSelector';

const SUGGESTED_TAGS = ['gratitude', 'reflection', 'productivity', 'ideas', 'goals', 'personal', 'milestone'];

export default function NewEntryPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Stats: Word count & reading time
  const stats = useMemo(() => {
    const text = content.trim();
    if (!text) return { words: 0, readTime: '< 1 min' };
    const words = text.split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return {
      words,
      readTime: `~${mins} min read`,
    };
  }, [content]);

  const handleAddTag = (tag) => {
    const currentTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      setTags([...currentTags, tag].join(', '));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your entry.');
      return;
    }
    if (!content.trim()) {
      setError('Please write some thoughts before saving.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      await createEntry({ title: title.trim(), content: content.trim(), mood, tags: tagList });
      navigate('/entries');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  // Allow Ctrl+Enter or Cmd+Enter to quickly submit
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const selectedMoodObj = MOODS.find((m) => m.value === mood) || MOODS[3];

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in" onKeyDown={handleKeyDown}>
      {/* Header with back navigation and date badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <Link
            to="/entries"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 mb-2 transition-colors"
          >
            <span>←</span> Back to All Entries
          </Link>
          <h1
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            New Journal Entry
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Capture your reflections in a peaceful, private space.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#16162a] border border-white/10 px-3.5 py-1.5 rounded-xl text-xs text-slate-300">
          <span>📅</span>
          <span>{todayFormatted}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-400/80 hover:text-red-200 text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#16162a] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Title <span className="text-indigo-400">*</span>
          </label>
          <input
            id="entry-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="w-full bg-[#0f0f1a] border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all text-base md:text-lg font-medium"
            placeholder="What's the highlight or headline of your day?"
          />
        </div>

        {/* Mood Selector */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center justify-between mb-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Mood
            </label>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${selectedMoodObj.color}20`,
                color: selectedMoodObj.color,
                border: `1px solid ${selectedMoodObj.color}40`,
              }}
            >
              {selectedMoodObj.emoji} {selectedMoodObj.label}
            </span>
          </div>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Content with live word count */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Thoughts <span className="text-indigo-400">*</span>
            </label>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{stats.words} words</span>
              <span>•</span>
              <span>{stats.readTime}</span>
            </div>
          </div>
          <textarea
            id="entry-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            className="w-full bg-[#0f0f1a] border border-white/10 focus:border-indigo-500 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none transition-all resize-none leading-relaxed text-sm md:text-base font-sans"
            placeholder="Write freely... what happened today? What made you smile, what challenged you, or what did you learn?"
          />
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            <span>💡</span> Pro tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">Ctrl + Enter</kbd> to quickly save your entry.
          </p>
        </div>

        {/* Tags with quick suggestions */}
        <div className="pt-2 border-t border-white/5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-all text-sm"
            placeholder="e.g. gratitude, deep work, workout, weekend"
          />

          {/* Tag suggestion chips */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
            <span className="text-[11px] text-slate-500 mr-1">Suggested:</span>
            {SUGGESTED_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleAddTag(t)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30 transition-colors"
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => navigate('/entries')}
            className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            id="entry-save"
            type="submit"
            disabled={saving}
            className="px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all disabled:opacity-50 text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <span className="animate-spin text-sm">⏳</span> Saving...
              </>
            ) : (
              <>
                <span>💾</span> Save Journal Entry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
