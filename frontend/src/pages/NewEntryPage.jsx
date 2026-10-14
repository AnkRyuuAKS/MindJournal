import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEntry } from '../api/entriesClient';
import MoodSelector from '../components/MoodSelector';

export default function NewEntryPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      await createEntry({ title, content, mood, tags: tagList });
      navigate('/entries');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>New Entry</h1>
        <p className="text-slate-500 text-sm mt-1">What's on your mind today?</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Title</label>
          <input
            id="entry-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            placeholder="Give your entry a title..."
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">How are you feeling?</label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Your Thoughts</label>
          <textarea
            id="entry-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none leading-relaxed"
            placeholder="Write freely... this is your private space."
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            placeholder="e.g. gratitude, work, travel"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            id="entry-save"
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
