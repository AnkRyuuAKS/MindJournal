import { useState, useEffect } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DSACard({ question, onDelete, globalReveal = null }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync with global reveal/hide toggle when changed
  useEffect(() => {
    if (globalReveal !== null) {
      setRevealed(globalReveal);
    }
  }, [globalReveal]);

  const handleCopyApproach = async () => {
    if (!question.approach) return;
    try {
      await navigator.clipboard.writeText(question.approach);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${question.heading}"?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(question.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group bg-[#16162a] border border-white/5 hover:border-emerald-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 animate-fade-in flex flex-col justify-between">
      <div>
        {/* Top bar: Question number, date, delete */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {question.number ? (
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {question.number}
              </span>
            ) : (
              <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-white/5 text-slate-500">
                DSA
              </span>
            )}
            <span className="text-xs text-slate-500">{formatDate(question.created_at)}</span>
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm opacity-70 group-hover:opacity-100"
            title="Delete question"
          >
            🗑️
          </button>
        </div>

        {/* Heading */}
        <h3 className="text-lg font-semibold text-white mb-2.5 group-hover:text-emerald-400 transition-colors leading-snug">
          {question.heading}
        </h3>

        {/* Problem Description */}
        {question.description && (
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Problem Details</p>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-white/2 p-3 rounded-xl border border-white/5">
              {question.description}
            </p>
          </div>
        )}
      </div>

      {/* Active Recall / Approach Section */}
      <div className="mt-2 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>💡</span> Approach & Intuition
          </span>
          <button
            onClick={() => setRevealed((prev) => !prev)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 ${
              revealed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <span>{revealed ? '🙈 Hide Approach' : '👁️ Reveal Approach'}</span>
          </button>
        </div>

        {revealed ? (
          <div className="animate-fade-in mt-3">
            {question.approach ? (
              <div className="relative">
                <pre className="text-xs sm:text-sm text-slate-200 font-mono bg-[#0f0f1a] border border-white/10 rounded-xl p-3.5 whitespace-pre-wrap break-words leading-relaxed overflow-x-auto max-h-72 overflow-y-auto">
                  {question.approach}
                </pre>
                <button
                  onClick={handleCopyApproach}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                  title="Copy Approach"
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            ) : (
              <p className="text-xs italic text-slate-500 bg-white/2 p-3 rounded-xl border border-white/5">
                No approach was recorded for this problem.
              </p>
            )}
          </div>
        ) : (
          <div
            onClick={() => setRevealed(true)}
            className="cursor-pointer py-3 px-3 rounded-xl bg-white/2 hover:bg-white/5 border border-dashed border-white/10 text-center transition-colors text-xs text-slate-500 hover:text-slate-400"
          >
            💭 Test your recall! What data structure, pattern, and complexity would you use? Click to reveal.
          </div>
        )}
      </div>
    </div>
  );
}
