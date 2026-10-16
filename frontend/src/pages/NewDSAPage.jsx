import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createDSAQuestion } from '../api/dsaClient';

const COMMON_PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Fast & Slow Pointers',
  'DFS / Backtracking',
  'BFS / Level Order',
  'Monotonic Stack',
  'Dynamic Programming',
  'Topological Sort',
  'Trie',
  'Heap / Priority Queue',
  'Union Find',
];

export default function NewDSAPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    number: '',
    heading: '',
    description: '',
    approach: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInsertPattern = (pattern) => {
    setForm((prev) => {
      const prefix = prev.approach ? `${prev.approach.trim()}\n\n` : '';
      return {
        ...prev,
        approach: `${prefix}Pattern: ${pattern}\n- Time Complexity: O()\n- Space Complexity: O()\n- Key Intuition: `,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.heading.trim()) {
      setError('Heading / Question title is required.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await createDSAQuestion({
        number: form.number.trim(),
        heading: form.heading.trim(),
        description: form.description.trim(),
        approach: form.approach.trim(),
      });
      navigate('/dsa');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save DSA revision question.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      {/* Header and back link */}
      <div className="mb-6">
        <Link
          to="/dsa"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 mb-3 transition-colors"
        >
          <span>←</span> Back to Revision Cards
        </Link>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Add DSA Revision Question
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Save problems, key insights, and optimal approaches for rapid interview revision.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-400/80 hover:text-red-300 text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Number and Heading */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm text-slate-400 mb-1.5">
              Problem ID / #
            </label>
            <input
              type="text"
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="#1, LC-42, GFG"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors text-sm font-mono"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm text-slate-400 mb-1.5">
              Heading / Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              name="heading"
              value={form.heading}
              onChange={handleChange}
              required
              placeholder="e.g. Two Sum, Trapping Rain Water, LRU Cache..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">
            Problem Statement / Details
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Brief description of the problem, input/output examples, constraints, or tricky edge cases..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none leading-relaxed text-sm"
          />
        </div>

        {/* Approach / Revision Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm text-slate-400">
              Thinking, Approach & Complexity
            </label>
            <span className="text-xs text-slate-500">
              Revealed during revision recall
            </span>
          </div>

          {/* Quick pattern inserts */}
          <div className="mb-2.5">
            <span className="text-xs text-slate-500 block mb-1.5">
              Quick insert pattern template:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PATTERNS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handleInsertPattern(p)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition-colors"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          <textarea
            name="approach"
            value={form.approach}
            onChange={handleChange}
            rows={9}
            placeholder="Document your thought process:&#10;1. Core intuition / brute force vs optimal&#10;2. Algorithmic steps & data structure used&#10;3. Time Complexity: O(...) & Space Complexity: O(...)&#10;4. Critical gotchas & edge cases"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none leading-relaxed text-sm font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Link
            to="/dsa"
            className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            {saving ? (
              <>
                <span className="animate-spin text-sm">⏳</span> Saving...
              </>
            ) : (
              'Save Revision Card'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
