import { useState, useEffect } from 'react';
import { getDSAQuestions, createDSAQuestion, deleteDSAQuestion } from '../api/dsaClient';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function DSAPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    number: '',
    heading: '',
    description: '',
    approach: '',
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getDSAQuestions();
      setQuestions(data.questions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = await createDSAQuestion(form);
      setQuestions((q) => [data.question, ...q]);
      setForm({ number: '', heading: '', description: '', approach: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    await deleteDSAQuestion(id);
    setQuestions((q) => q.filter((x) => x.id !== id));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            DSA Questions
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track problems, approaches & learnings</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          {showForm ? '✕ Cancel' : '+ Add Question'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#16162a] border border-white/10 rounded-2xl p-6 mb-6 space-y-4"
        >
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <div className="w-28">
              <label className="block text-xs text-slate-500 mb-1.5">Number / ID</label>
              <input
                name="number"
                value={form.number}
                onChange={handleChange}
                placeholder="#1 / LC-42"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1.5">Heading *</label>
              <input
                name="heading"
                value={form.heading}
                onChange={handleChange}
                required
                placeholder="Two Sum, Merge Intervals…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe the problem…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Thinking & Approach</label>
            <textarea
              name="approach"
              value={form.approach}
              onChange={handleChange}
              rows={5}
              placeholder="Walk through your thought process, patterns noticed, time/space complexity…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none leading-relaxed"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Question'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading…</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 bg-[#16162a] border border-white/5 rounded-2xl">
          <p className="text-4xl mb-3">🧠</p>
          <p className="text-white font-medium mb-1">No questions yet</p>
          <p className="text-slate-500 text-sm">Add your first DSA problem above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-[#16162a] border border-white/5 rounded-2xl overflow-hidden transition-all duration-200 hover:border-emerald-500/20"
            >
              {/* Row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                {q.number && (
                  <span className="shrink-0 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    {q.number}
                  </span>
                )}
                <p className="flex-1 text-sm font-medium text-white truncate">{q.heading}</p>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-600">
                    {new Date(q.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                    className="text-slate-600 hover:text-red-400 transition-colors text-sm"
                    title="Delete"
                  >
                    🗑
                  </button>
                  <span className={`text-slate-500 text-xs transition-transform duration-200 ${expanded === q.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Expanded */}
              {expanded === q.id && (
                <div className="px-5 pb-5 border-t border-white/5 space-y-4 pt-4">
                  {q.description && (
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Description</p>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{q.description}</p>
                    </div>
                  )}
                  {q.approach && (
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Thinking & Approach</p>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-white/3 rounded-xl p-3">{q.approach}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
