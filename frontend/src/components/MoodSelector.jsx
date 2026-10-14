const MOODS = [
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#fbbf24' },
  { value: 'excited', emoji: '🤩', label: 'Excited', color: '#f97316' },
  { value: 'calm', emoji: '😌', label: 'Calm', color: '#22d3ee' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#94a3b8' },
  { value: 'sad', emoji: '😢', label: 'Sad', color: '#60a5fa' },
  { value: 'anxious', emoji: '😰', label: 'Anxious', color: '#a78bfa' },
  { value: 'angry', emoji: '😠', label: 'Angry', color: '#f87171' },
];

export { MOODS };

export default function MoodSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
            value === mood.value
              ? 'border-white/30 bg-white/10 scale-105'
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
          style={value === mood.value ? { color: mood.color, borderColor: mood.color + '60' } : {}}
        >
          <span>{mood.emoji}</span>
          <span className="text-xs">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
