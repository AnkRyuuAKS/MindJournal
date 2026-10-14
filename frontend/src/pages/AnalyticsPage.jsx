import { useEffect, useState } from 'react';
import { getStats } from '../api/analyticsClient';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full p-16"><LoadingSpinner size="lg" /></div>;
  if (!stats) return null;

  const total = stats.total_entries || 1;

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Insights from your journaling habits</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Entries', value: stats.total_entries, icon: '📓' },
          { label: 'Day Streak', value: `${stats.streak} days`, icon: '🔥' },
          { label: 'This Week', value: stats.entries_this_week, icon: '📅' },
          { label: 'This Month', value: stats.entries_this_month, icon: '🗓️' },
          { label: 'Favorites', value: stats.favorite_count, icon: '⭐' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#16162a] border border-white/5 rounded-2xl p-5">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mood breakdown */}
      <div className="bg-[#16162a] border border-white/5 rounded-2xl p-6 mb-8">
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
