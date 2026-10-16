from datetime import datetime, timezone
from extensions import mongo_db

users = mongo_db["users"]
journal_entries = mongo_db["journal_entries"]


def create_user_document(name, email, password_hash):
    now = datetime.now(timezone.utc)
    return {
        "name": name,
        "email": email.lower().strip(),
        "password_hash": password_hash,
        "created_at": now,
        "settings": {
            "theme": "dark",
            "timezone": "Asia/Kolkata",
        },
    }


def create_entry_document(
    user_id,
    title,
    content,
    mood="neutral",
    tags=None,
    images=None,
):
    now = datetime.now(timezone.utc)
    return {
        "user_id": user_id,
        "title": title,
        "content": content,
        "mood": mood,
        "tags": tags or [],
        "images": images or [],
        "is_favorite": False,
        "created_at": now,
        "updated_at": now,
    }


analytics_reports = mongo_db["analytics_reports"]


def create_report_document(
    user_id,
    summary,
    mood_analysis,
    key_themes=None,
    strengths_and_positives=None,
    areas_for_growth=None,
    actionable_recommendations=None,
    weekly_quote="",
    stats_snapshot=None,
):
    now = datetime.now(timezone.utc)
    return {
        "user_id": user_id,
        "summary": summary,
        "mood_analysis": mood_analysis,
        "key_themes": key_themes or [],
        "strengths_and_positives": strengths_and_positives or [],
        "areas_for_growth": areas_for_growth or [],
        "actionable_recommendations": actionable_recommendations or [],
        "weekly_quote": weekly_quote,
        "stats_snapshot": stats_snapshot or {},
        "created_at": now,
        "updated_at": now,
    }
