from datetime import datetime, timezone, timedelta
from collections import Counter
from extensions import mongo_db

entries_collection = mongo_db["journal_entries"]
dsa_collection = mongo_db["dsa_questions"]

MOODS = ["happy", "excited", "calm", "sad", "anxious", "angry", "neutral"]


def get_stats(user_id: str) -> dict:
    entries = list(entries_collection.find({"user_id": user_id}))
    total_dsa = dsa_collection.count_documents({"user_id": user_id})
    total = len(entries)
    if total == 0:
        return {
            "total_entries": 0,
            "total_dsa": total_dsa,
            "streak": 0,
            "mood_distribution": {m: 0 for m in MOODS},
            "entries_this_week": 0,
            "entries_this_month": 0,
            "favorite_count": 0,
        }

    mood_counter = Counter(e.get("mood", "neutral") for e in entries)
    mood_distribution = {m: mood_counter.get(m, 0) for m in MOODS}

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    entries_this_week = sum(1 for e in entries if e.get("created_at") and e["created_at"] >= week_ago)
    entries_this_month = sum(1 for e in entries if e.get("created_at") and e["created_at"] >= month_ago)
    favorite_count = sum(1 for e in entries if e.get("is_favorite", False))

    # Calculate streak
    dates = sorted(
        set(e["created_at"].date() for e in entries if e.get("created_at")),
        reverse=True,
    )
    streak = 0
    check = now.date()
    for d in dates:
        if d == check or d == check - timedelta(days=1):
            streak += 1
            check = d
        else:
            break

    return {
        "total_entries": total,
        "total_dsa": total_dsa,
        "streak": streak,
        "mood_distribution": mood_distribution,
        "entries_this_week": entries_this_week,
        "entries_this_month": entries_this_month,
        "favorite_count": favorite_count,
    }
