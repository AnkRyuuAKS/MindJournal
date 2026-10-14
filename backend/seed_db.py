
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash
from extensions import mongo_db

def seed_db():
    now = datetime.now(timezone.utc)

    # Create a sample user if one doesn't already exist
    email = "demo@mindjournal.com"

    user = mongo_db.users.find_one({"email": email})

    if not user:
        user_id = mongo_db.users.insert_one({
            "name": "Demo User",
            "email": email,
            "password_hash": generate_password_hash("Demo123!"),
            "created_at": now,
            "settings": {
                "theme": "light",
                "timezone": "Asia/Kolkata"
            }
        }).inserted_id
        print("Sample user created.")
    else:
        user_id = user["_id"]
        print("Sample user already exists.")

    # Insert sample journal entries only if none exist for this demo user
    if mongo_db.journal_entries.count_documents({"user_id": user_id}) == 0:
        entries = [
            {
                "user_id": user_id,
                "title": "My First Journal",
                "content": "Today I started building MindJournal. I want to build a habit of writing every day.",
                "mood": "happy",
                "tags": ["personal", "coding"],
                "is_favorite": True,
                "created_at": now,
                "updated_at": now
            },
            {
                "user_id": user_id,
                "title": "A Day of Learning",
                "content": "I learned how Flask connects to MongoDB and made progress on my project.",
                "mood": "motivated",
                "tags": ["learning", "college"],
                "is_favorite": False,
                "created_at": now,
                "updated_at": now
            },
            {
                "user_id": user_id,
                "title": "Things I Am Grateful For",
                "content": "I am grateful for the opportunity to learn new skills and work toward my goals.",
                "mood": "grateful",
                "tags": ["gratitude", "personal"],
                "is_favorite": False,
                "created_at": now,
                "updated_at": now
            }
        ]

        result = mongo_db.journal_entries.insert_many(entries)
        print(f"Inserted {len(result.inserted_ids)} sample journal entries.")
    else:
        print("Sample journal entries already exist; skipping insertion.")

    print("Database:", mongo_db.name)
    print("Users:", mongo_db.users.count_documents({}))
    print("Journal entries:", mongo_db.journal_entries.count_documents({}))

if __name__ == "__main__":
    seed_db()
