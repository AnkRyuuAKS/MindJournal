
from datetime import datetime, timezone, timedelta
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
                "theme": "dark",
                "timezone": "Asia/Kolkata"
            }
        }).inserted_id
        print("Sample user created.")
    else:
        user_id = user["_id"]
        print("Sample user already exists.")

    # Insert sample journal entries if fewer than 5 exist for this demo user
    if mongo_db.journal_entries.count_documents({"user_id": user_id}) < 5:
        # Clear old demo entries to re-populate with realistic weekly sequence
        mongo_db.journal_entries.delete_many({"user_id": user_id})
        
        entries = [
            {
                "user_id": user_id,
                "title": "Starting the Week with Intent",
                "content": "Kicked off Monday with high focus. Planned my roadmap for MindJournal and began wireframing the analytics dashboard.",
                "mood": "excited",
                "tags": ["personal", "coding", "planning"],
                "is_favorite": True,
                "created_at": now - timedelta(days=6),
                "updated_at": now - timedelta(days=6)
            },
            {
                "user_id": user_id,
                "title": "Deep Dive into Backend Architecture",
                "content": "Spent several hours refining Flask blueprints and MongoDB indexing. Felt a bit overwhelmed around noon, but stepping out for fresh air helped.",
                "mood": "anxious",
                "tags": ["coding", "architecture"],
                "is_favorite": False,
                "created_at": now - timedelta(days=5),
                "updated_at": now - timedelta(days=5)
            },
            {
                "user_id": user_id,
                "title": "Breakthrough in Problem Solving",
                "content": "Solved two graph traversal problems today. The intuition clicked naturally after drawing the adjacency list on paper.",
                "mood": "happy",
                "tags": ["dsa", "learning", "algorithms"],
                "is_favorite": True,
                "created_at": now - timedelta(days=4),
                "updated_at": now - timedelta(days=4)
            },
            {
                "user_id": user_id,
                "title": "Reflecting on Work-Life Balance",
                "content": "Took an evening walk in the park. Practiced mindfulness and resisted checking code notifications for three hours. Feeling grounded.",
                "mood": "calm",
                "tags": ["mindfulness", "health", "gratitude"],
                "is_favorite": False,
                "created_at": now - timedelta(days=3),
                "updated_at": now - timedelta(days=3)
            },
            {
                "user_id": user_id,
                "title": "Connecting the Frontend UI",
                "content": "Built clean Tailwind cards and smooth state transitions in React. The interface is starting to feel very polished and responsive.",
                "mood": "excited",
                "tags": ["react", "frontend", "design"],
                "is_favorite": False,
                "created_at": now - timedelta(days=2),
                "updated_at": now - timedelta(days=2)
            },
            {
                "user_id": user_id,
                "title": "Things I Am Grateful For Today",
                "content": "Grateful for patient mentors, stable health, and the resilience to keep building even when bugs appear.",
                "mood": "happy",
                "tags": ["gratitude", "personal"],
                "is_favorite": True,
                "created_at": now - timedelta(days=1),
                "updated_at": now - timedelta(days=1)
            },
            {
                "user_id": user_id,
                "title": "Weekly Retrospective & Gemini Integration",
                "content": "Today I added LangChain and Gemini to generate weekly analytical reports! Super excited to see AI reflections on my mental growth.",
                "mood": "happy",
                "tags": ["ai", "langchain", "gemini", "milestone"],
                "is_favorite": True,
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
