import { useEffect, useState } from 'react';
import { getStats, analyzeWeek, getLatestReport } from '../api/analyticsClient';
import LoadingSpinner from '../components/LoadingSpinner';

const MOODS = [
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#fbbf24' },
  { value: 'excited', emoji: '🤩', label: 'Excited', color: '#f97316' },
  { value: 'calm', emoji: '😌', label: 'Calm', color: '#22d3ee' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#94a3b8' },
  { value: 'sad', emoji: '😢', label: 'Sad', color: '#60a5fa' },
  { value: 'anxious', emoji: '😰', label: 'Anxious', color: '#a78bfa' },
  { value: 'angry', emoji: '😠', label: 'Angry', color: '#f87171' },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [statsData, reportData] = await Promise.all([
        getStats(),
        getLatestReport().catch((err) => {
          console.error('Error fetching latest report:', err);
          return { report: null };
        }),
      ]);
      setStats(statsData);
      if (reportData?.report) setReport(reportData.report);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setFetchError(err?.response?.data?.error || err?.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnalyzeWeek = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    setSuccessMessage(null);

    try {
      const data = await analyzeWeek();
      if (data?.report) {
        setReport(data.report);
        setSuccessMessage('Your weekly report was generated and saved to the database successfully!');
      } else if (data?.error) {
        setAnalysisError(data.error);
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to connect to Gemini analysis service. Please verify your GEMINI_API_KEY in backend/.env.';
      setAnalysisError(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full p-16">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (fetchError && !stats)
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <p className="text-2xl mb-2">⚠️</p>
          <h2 className="text-lg font-bold text-red-200">Unable to load analytics</h2>
          <p className="text-slate-400 text-sm mt-1">{fetchError}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );

  if (!stats) return null;

  const total = stats.total_entries || 1;

  const formatReportDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Analytics & Insights
          </h1>
          <p className="text-slate-400 text-sm mt-1">Deep dive into your emotional patterns, habits, and weekly growth</p>
        </div>

        {/* Gemini Action Button */}
        <div>
          <button
            onClick={handleAnalyzeWeek}
            disabled={analyzing}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg cursor-pointer ${
              analyzing
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                <span>Analyzing your week with Gemini...</span>
              </>
            ) : (
              <>
                <span className="text-base">✨</span>
                <span>Analyse your week with Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {analysisError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-5 py-4 rounded-xl text-sm flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-red-200">Unable to generate report</p>
            <p className="text-red-300/90 text-xs mt-0.5">{analysisError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-3.5 rounded-xl text-sm flex items-center gap-3">
          <span className="text-base">✅</span>
          <p className="text-xs font-medium text-emerald-200">{successMessage}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Entries', value: stats.total_entries, icon: '📓' },
          { label: 'Day Streak', value: `${stats.streak} days`, icon: '🔥' },
          { label: 'This Week', value: stats.entries_this_week, icon: '📅' },
          { label: 'This Month', value: stats.entries_this_month, icon: '🗓️' },
          { label: 'Favorites', value: stats.favorite_count, icon: '⭐' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#16162a] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Gemini AI Weekly Report Display */}
      {report && (
        <div className="bg-gradient-to-b from-[#1b1b36] to-[#141426] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-lg shadow-md">
                ✨
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Weekly Gemini Intelligence Report
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    LangChain + Gemini
                  </span>
                </h2>
                {report.created_at && (
                  <p className="text-xs text-slate-400 mt-0.5">Analyzed on {formatReportDate(report.created_at)}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleAnalyzeWeek}
              disabled={analyzing}
              className="text-xs text-indigo-300 hover:text-indigo-200 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg border border-white/10 transition-colors self-start sm:self-auto cursor-pointer"
            >
              🔄 Refresh Analysis
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Weekly Quote */}
            {report.weekly_quote && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <p className="text-indigo-200 text-sm sm:text-base font-medium italic">
                  "{report.weekly_quote}"
                </p>
              </div>
            )}

            {/* Executive Summary */}
            <div className="bg-[#121222] border border-white/5 rounded-2xl p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>📖</span> Weekly Summary & Reflection
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {report.summary}
              </p>
            </div>

            {/* Emotional and Mood Analysis */}
            <div className="bg-[#121222] border border-white/5 rounded-2xl p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>🧠</span> Emotional Dynamics & Mood Analysis
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {report.mood_analysis}
              </p>
            </div>

            {/* Key Themes Badges */}
            {report.key_themes && report.key_themes.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2.5">
                  Core Topics & Themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.key_themes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#1e1e38] text-slate-200 border border-indigo-400/20 shadow-sm"
                    >
                      #{theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths and Growth Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths & Positives */}
              {report.strengths_and_positives && report.strengths_and_positives.length > 0 && (
                <div className="bg-[#121222] border border-emerald-500/20 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>🌟</span> Strengths & Highlights
                  </h3>
                  <ul className="space-y-2.5">
                    {report.strengths_and_positives.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Growth / Challenges */}
              {report.areas_for_growth && report.areas_for_growth.length > 0 && (
                <div className="bg-[#121222] border border-amber-500/20 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>🌱</span> Areas for Growth & Reflection
                  </h3>
                  <ul className="space-y-2.5">
                    {report.areas_for_growth.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actionable Recommendations */}
            {report.actionable_recommendations && report.actionable_recommendations.length > 0 && (
              <div className="bg-[#121222] border border-indigo-500/20 rounded-2xl p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🎯</span> Actionable Steps for the Upcoming Week
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {report.actionable_recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-300 leading-snug">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mood breakdown */}
      <div className="bg-[#16162a] border border-white/5 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Mood Breakdown</h2>
        <div className="space-y-4">
          {MOODS.map((mood) => {
            const count = stats.mood_distribution?.[mood.value] || 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={mood.value} className="flex items-center gap-4">
                <span className="text-2xl w-8 text-center">{mood.emoji}</span>
                <span className="text-sm text-slate-300 w-20">{mood.label}</span>
                <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: mood.color }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-16 text-right">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

