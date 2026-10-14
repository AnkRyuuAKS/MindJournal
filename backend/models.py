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
