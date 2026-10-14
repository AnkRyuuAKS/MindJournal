import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEntry, updateEntry } from '../api/entriesClient';
import MoodSelector from '../components/MoodSelector';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EditEntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEntry(id)
      .then((data) => {
        const e = data.entry;
        setTitle(e.title);
        setContent(e.content);
        setMood(e.mood || 'neutral');
        setTags((e.tags || []).join(', '));
      })
      .catch(() => setError('Entry not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      await updateEntry(id, { title, content, mood, tags: tagList });
      navigate(`/entries/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update entry.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full p-16"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Edit Entry</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Mood</label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Your Thoughts</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={12}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none leading-relaxed" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Tags</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            placeholder="e.g. gratitude, work" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-colors text-sm">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 text-sm">
            {saving ? 'Saving...' : 'Update Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
