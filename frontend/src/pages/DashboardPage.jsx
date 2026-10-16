import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEntries, toggleFavorite, deleteEntry } from '../api/entriesClient';
import { getDSAQuestions, deleteDSAQuestion } from '../api/dsaClient';
import { getStats } from '../api/analyticsClient';
import LoadingSpinner from '../components/LoadingSpinner';
import EntryCard from '../components/EntryCard';
import DSACard from '../components/DSACard';

const MOODS = [
  { value: 'happy', emoji: '😊', color: '#fbbf24' },
  { value: 'excited', emoji: '🤩', color: '#f97316' },
  { value: 'calm', emoji: '😌', color: '#22d3ee' },
  { value: 'neutral', emoji: '😐', color: '#94a3b8' },
  { value: 'sad', emoji: '😢', color: '#60a5fa' },
  { value: 'anxious', emoji: '😰', color: '#a78bfa' },
  { value: 'angry', emoji: '😠', color: '#f87171' },
];

const PER_PAGE = 4;

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  // Paginated feeds
  const [entries, setEntries] = useState([]);
  const [dsaList, setDsaList] = useState([]);
  const [entriesPage, setEntriesPage] = useState(1);
  const [dsaPage, setDsaPage] = useState(1);
  const [hasMoreEntries, setHasMoreEntries] = useState(true);
  const [hasMoreDSA, setHasMoreDSA] = useState(true);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Tab filter: 'all' | 'entries' | 'dsa'
  const [activeTab, setActiveTab] = useState('all');

  const sentinelRef = useRef(null);

  // Load initial data
  useEffect(() => {
    const initLoad = async () => {
      setLoadingInitial(true);
      try {
        const [statsData, entriesData, dsaData] = await Promise.allSettled([
          getStats(),
          getEntries({ page: 1, per_page: PER_PAGE }),
          getDSAQuestions({ page: 1, per_page: PER_PAGE }),
        ]);

        if (statsData.status === 'fulfilled') {
          setStats(statsData.value);
        }

        if (entriesData.status === 'fulfilled') {
          const eData = entriesData.value;
          const initialEntries = eData.entries || [];
          setEntries(initialEntries);
          const totalE = eData.total || initialEntries.length;
          setHasMoreEntries(initialEntries.length < totalE && initialEntries.length > 0);
        }

        if (dsaData.status === 'fulfilled') {
          const dData = dsaData.value;
          const initialDSA = dData.questions || [];
          setDsaList(initialDSA);
          const totalD = dData.total || initialDSA.length;
          setHasMoreDSA(initialDSA.length < totalD && initialDSA.length > 0);
        }
      } catch (err) {
        console.error('Error during initial dashboard load:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    initLoad();
  }, []);

  // Fetch more items on scroll down
  const loadMore = useCallback(async () => {
    if (loadingInitial || loadingMore) return;

    const shouldFetchEntries = (activeTab === 'all' || activeTab === 'entries') && hasMoreEntries;
    const shouldFetchDSA = (activeTab === 'all' || activeTab === 'dsa') && hasMoreDSA;

    if (!shouldFetchEntries && !shouldFetchDSA) return;

    setLoadingMore(true);
    try {
      const promises = [];
      const nextEPage = entriesPage + 1;
      const nextDPage = dsaPage + 1;

      if (shouldFetchEntries) {
        promises.push(
          getEntries({ page: nextEPage, per_page: PER_PAGE }).then((data) => {
            const newEntries = data.entries || [];
            if (newEntries.length === 0) {
              setHasMoreEntries(false);
            } else {
              setEntries((prev) => {
                const existingIds = new Set(prev.map((e) => e.id));
                const filtered = newEntries.filter((e) => !existingIds.has(e.id));
                return [...prev, ...filtered];
              });
              setEntriesPage(nextEPage);
              if (entries.length + newEntries.length >= (data.total || 0)) {
                setHasMoreEntries(false);
              }
            }
          })
        );
      }

      if (shouldFetchDSA) {
        promises.push(
          getDSAQuestions({ page: nextDPage, per_page: PER_PAGE }).then((data) => {
            const newDSA = data.questions || [];
            if (newDSA.length === 0) {
              setHasMoreDSA(false);
            } else {
              setDsaList((prev) => {
                const existingIds = new Set(prev.map((q) => q.id));
                const filtered = newDSA.filter((q) => !existingIds.has(q.id));
                return [...prev, ...filtered];
              });
              setDsaPage(nextDPage);
              if (dsaList.length + newDSA.length >= (data.total || 0)) {
                setHasMoreDSA(false);
              }
            }
          })
        );
      }

      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Error loading more dashboard items:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    loadingInitial,
    loadingMore,
    activeTab,
    hasMoreEntries,
    hasMoreDSA,
    entriesPage,
    dsaPage,
    entries.length,
    dsaList.length,
  ]);

  // Setup Intersection Observer for infinite scrolling
  useEffect(() => {
    if (loadingInitial || loadingMore) return;

    const hasMore =
      (activeTab === 'all' && (hasMoreEntries || hasMoreDSA)) ||
      (activeTab === 'entries' && hasMoreEntries) ||
      (activeTab === 'dsa' && hasMoreDSA);

    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadingInitial, loadingMore, hasMoreEntries, hasMoreDSA, activeTab, loadMore]);

  // Combine items into sorted feed
  const feedItems = useMemo(() => {
    const taggedEntries = entries.map((e) => ({ ...e, _feedType: 'entry' }));
    const taggedDSA = dsaList.map((q) => ({ ...q, _feedType: 'dsa' }));

    if (activeTab === 'entries') return taggedEntries;
    if (activeTab === 'dsa') return taggedDSA;

    return [...taggedEntries, ...taggedDSA].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [entries, dsaList, activeTab]);

  const handleDeleteEntry = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setStats((prev) =>
      prev ? { ...prev, total_entries: Math.max(0, (prev.total_entries || 1) - 1) } : prev
    );
  };

  const handleToggleFavorite = async (id) => {
    const result = await toggleFavorite(id);
    setEntries((prev) => prev.map((e) => (e.id === id ? result.entry : e)));
  };

  const handleDeleteDSA = async (id) => {
    await deleteDSAQuestion(id);
    setDsaList((prev) => prev.filter((q) => q.id !== id));
    setStats((prev) =>
      prev ? { ...prev, total_dsa: Math.max(0, (prev.total_dsa || 1) - 1) } : prev
    );
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalEntriesCount = stats?.total_entries ?? entries.length;
  const totalDSACount = stats?.total_dsa ?? dsaList.length;

  const currentTabHasMore =
    activeTab === 'all'
      ? hasMoreEntries || hasMoreDSA
      : activeTab === 'entries'
      ? hasMoreEntries
      : hasMoreDSA;

  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center h-full min-h-[70vh]">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {greeting()}, {user?.name || 'there'} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Your unified hub for daily journaling and DSA problem revisions.
          </p>
        </div>

        {/* Create buttons for BOTH Entries and DSA */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/entries/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <span>✏️</span> Create Entry
          </Link>
          <Link
            to="/dsa/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
          >
            <span>🧠</span> Add DSA Revision
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#16162a] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-2xl">📓</span>
            <Link to="/entries" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </div>
          <p className="text-2xl font-bold text-white">{totalEntriesCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Journal Entries</p>
        </div>

        <div className="bg-[#16162a] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-2xl">🧠</span>
            <Link to="/dsa" className="text-xs text-emerald-400 hover:text-emerald-300">
              View cards →
            </Link>
          </div>
          <p className="text-2xl font-bold text-white">{totalDSACount}</p>
          <p className="text-xs text-slate-500 mt-0.5">DSA Revision Cards</p>
        </div>

        <div className="bg-[#16162a] border border-white/5 rounded-2xl p-5">
          <p className="text-2xl mb-1.5">🔥</p>
          <p className="text-2xl font-bold text-white">{stats?.streak ?? 0} days</p>
          <p className="text-xs text-slate-500 mt-0.5">Writing Streak</p>
        </div>

        <div className="bg-[#16162a] border border-white/5 rounded-2xl p-5">
          <p className="text-2xl mb-1.5">⭐</p>
          <p className="text-2xl font-bold text-white">{stats?.favorite_count ?? 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">Favorites</p>
        </div>
      </div>

      {/* Mood distribution (if entries exist) */}
      {stats?.mood_distribution && totalEntriesCount > 0 && (
        <div className="bg-[#16162a] border border-white/5 rounded-2xl p-6 mb-8">
          <h2 className="text-base font-semibold text-white mb-4">Mood Balance</h2>
          <div className="flex gap-4 flex-wrap">
            {MOODS.map((mood) => {
              const count = stats.mood_distribution[mood.value] || 0;
              const total = stats.total_entries || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={mood.value} className="flex flex-col items-center gap-1.5">
                  <span className="text-xl">{mood.emoji}</span>
                  <div
                    className="w-7 bg-white/5 rounded-full overflow-hidden"
                    style={{ height: '50px' }}
                  >
                    <div
                      className="w-full rounded-full transition-all duration-700"
                      style={{
                        height: `${pct}%`,
                        background: mood.color,
                        marginTop: `${100 - pct}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stream / Feed Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Activity Feed
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scroll down to continuously load more entries and DSA revisions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#16162a] border border-white/5 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Items ({entries.length + dsaList.length})
          </button>
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'entries'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📓 Entries ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab('dsa')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dsa'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧠 DSA Cards ({dsaList.length})
          </button>
        </div>
      </div>

      {/* Content Stream */}
      {feedItems.length === 0 ? (
        /* Empty State with Both Options */
        <div className="bg-[#16162a] border border-white/5 rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto my-6">
          <p className="text-4xl mb-3">✨</p>
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your dashboard is ready!
          </h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            You don't have any journal entries or DSA revisions yet. Get started by creating either one below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-white/2 border border-white/5 flex flex-col justify-between items-center hover:border-indigo-500/30 transition-all">
              <span className="text-3xl mb-2">📓</span>
              <h4 className="text-white font-semibold mb-1">Journal Entry</h4>
              <p className="text-xs text-slate-500 mb-4 text-center">
                Reflect on your day, record feelings and ideas.
              </p>
              <Link
                to="/entries/new"
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                + Write Entry
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-white/2 border border-white/5 flex flex-col justify-between items-center hover:border-emerald-500/30 transition-all">
              <span className="text-3xl mb-2">🧠</span>
              <h4 className="text-white font-semibold mb-1">DSA Revision</h4>
              <p className="text-xs text-slate-500 mb-4 text-center">
                Track tricky problems, pattern intuitions, and complexities.
              </p>
              <Link
                to="/dsa/new"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                + Add DSA Question
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid of Feed Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {feedItems.map((item) => {
              if (item._feedType === 'entry') {
                return (
                  <div key={`entry-${item.id}`} className="relative flex flex-col">
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-indigo-400">
                      <span>📓</span> Journal Entry
                    </div>
                    <EntryCard
                      entry={item}
                      onDelete={handleDeleteEntry}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                );
              }

              return (
                <div key={`dsa-${item.id}`} className="relative flex flex-col">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                    <span>🧠</span> DSA Revision Card
                  </div>
                  <DSACard
                    question={item}
                    onDelete={handleDeleteDSA}
                  />
                </div>
              );
            })}
          </div>

          {/* Loading More & Infinite Scroll Sentinel */}
          <div className="pt-4 pb-8 flex flex-col items-center justify-center">
            {loadingMore ? (
              <div className="py-4 flex items-center gap-2 text-slate-400 text-sm">
                <span className="animate-spin">⏳</span>
                <span>Fetching more items...</span>
              </div>
            ) : currentTabHasMore ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={loadMore}
                  className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
                >
                  ↓ Load More
                </button>
                <div ref={sentinelRef} className="h-6 w-full" />
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                ✓ You're all caught up with your entries and DSA revisions.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
