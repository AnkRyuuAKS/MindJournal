import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEntries } from '../api/entriesClient';
import { getStats } from '../api/analyticsClient';
import LoadingSpinner from '../components/LoadingSpinner';
import EntryCard from '../components/EntryCard';
import { toggleFavorite, deleteEntry } from '../api/entriesClient';

const MOODS = [
  { value: 'happy', emoji: '😊', color: '#fbbf24' },
  { value: 'excited', emoji: '🤩', color: '#f97316' },
  { value: 'calm', emoji: '😌', color: '#22d3ee' },
  { value: 'neutral', emoji: '😐', color: '#94a3b8' },
  { value: 'sad', emoji: '😢', color: '#60a5fa' },
  { value: 'anxious', emoji: '😰', color: '#a78bfa' },
  { value: 'angry', emoji: '😠', color: '#f87171' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, entriesData] = await Promise.all([
          getStats(),
          getEntries({ page: 1, per_page: 4 }),
        ]);
        setStats(statsData);
        setRecentEntries(entriesData.entries || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await deleteEntry(id);
    setRecentEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleToggleFavorite = async (id) => {
    const result = await toggleFavorite(id);
    setRecentEntries((prev) =>
      prev.map((e) => (e.id === id ? result.entry : e))
    );
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          {greeting()}, {user?.name || 'there'} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's what's been happening in your journal</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Entries', value: stats.total_entries, icon: '📓' },
            { label: 'Day Streak', value: `${stats.streak} days`, icon: '🔥' },
            { label: 'This Week', value: stats.entries_this_week, icon: '📅' },
            { label: 'Favorites', value: stats.favorite_count, icon: '⭐' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#16162a] border border-white/5 rounded-2xl p-5">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mood distribution */}
      {stats?.mood_distribution && (
        <div className="bg-[#16162a] border border-white/5 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Mood Distribution</h2>
          <div className="flex gap-3 flex-wrap">
            {MOODS.map((mood) => {
              const count = stats.mood_distribution[mood.value] || 0;
              const total = stats.total_entries || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={mood.value} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{mood.emoji}</span>
                  <div className="w-8 bg-white/5 rounded-full overflow-hidden" style={{ height: '60px' }}>
                    <div
                      className="w-full rounded-full transition-all duration-700"
                      style={{
                        height: `${pct}%`,
                        background: mood.color,
                        marginTop: `${100 - pct}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Entries</h2>
          <Link to="/entries" className="text-sm text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>
        {recentEntries.length === 0 ? (
          <div className="text-center py-16 bg-[#16162a] border border-white/5 rounded-2xl">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-white font-medium mb-2">No entries yet</p>
            <p className="text-slate-500 text-sm mb-4">Start writing your first journal entry</p>
            <Link
              to="/entries/new"
              className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Write First Entry
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
