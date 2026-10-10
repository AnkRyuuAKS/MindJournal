Here’s a clean **MindJournal** file structure for a **React + Flask + PostgreSQL (Neon) + Docker** project.

```text
mindjournal/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── extensions.py
│   ├── models.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── migrations/
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   ├── entry_routes.py
│   │   ├── tag_routes.py
│   │   ├── mood_routes.py
│   │   ├── upload_routes.py
│   │   ├── analytics_routes.py
│   │   └── ai_routes.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── entry_service.py
│   │   ├── upload_service.py
│   │   ├── analytics_service.py
│   │   └── ai_service.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── validators.py
│   │   └── helpers.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_entries.py
│       └── test_analytics.py
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   └── icons/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   ├── axios.js
│       │   ├── authApi.js
│       │   ├── entryApi.js
│       │   ├── tagApi.js
│       │   ├── analyticsApi.js
│       │   └── aiApi.js
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useEntries.js
│       │   └── useDebounce.js
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── NewEntry.jsx
│       │   ├── EntryDetails.jsx
│       │   ├── EditEntry.jsx
│       │   ├── Calendar.jsx
│       │   ├── Tags.jsx
│       │   ├── Analytics.jsx
│       │   └── Settings.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── EntryCard.jsx
│       │   ├── MoodSelector.jsx
│       │   ├── TagInput.jsx
│       │   ├── SearchBar.jsx
│       │   ├── DateFilter.jsx
│       │   ├── MoodChart.jsx
│       │   ├── StreakCard.jsx
│       │   ├── AiSummaryCard.jsx
│       │   ├── ImageUploader.jsx
│       │   ├── EmptyState.jsx
│       │   ├── Loader.jsx
│       │   └── ProtectedRoute.jsx
│       ├── utils/
│       │   ├── date.js
│       │   ├── mood.js
│       │   └── formatters.js
│       └── styles/
│           └── index.css
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Backend purpose

| File/Folder | Purpose |
|---|---|
| `app.py` | Creates Flask app, registers routes, starts server |
| `config.py` | Reads Neon DB URL, JWT keys, Cloudinary keys |
| `extensions.py` | Initializes SQLAlchemy, Migrate, JWT, CORS |
| `models.py` | User, Entry, Tag, Mood, Attachment models |
| `routes/` | API endpoint files |
| `services/` | Business logic, kept separate from routes |
| `migrations/` | Flask-Migrate/Alembic database migrations |
| `tests/` | Pytest tests for auth, entries, and analytics |

## Frontend purpose

| File/Folder | Purpose |
|---|---|
| `src/api/` | Axios calls to Flask backend |
| `src/context/` | Login state and dark-mode state |
| `src/pages/` | Main screens |
| `src/components/` | Reusable UI pieces |
| `src/hooks/` | Reusable React logic |
| `src/utils/` | Date, mood, and formatting helpers |
| `public/manifest.json` | PWA install support |

## Important models

```text
User
- id
- email
- password_hash
- created_at

Entry
- id
- user_id
- title
- content
- mood
- entry_date
- is_pinned
- is_archived
- created_at
- updated_at

Tag
- id
- user_id
- name

EntryTag
- entry_id
- tag_id

Attachment
- id
- entry_id
- image_url
- public_id
- created_at
```

## Example API routes

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/entries
POST   /api/entries
GET    /api/entries/<id>
PUT    /api/entries/<id>
DELETE /api/entries/<id>

GET    /api/entries/search?q=college
GET    /api/entries/calendar?month=10&year=2026

GET    /api/tags
POST   /api/tags

GET    /api/analytics/moods
GET    /api/analytics/streak
GET    /api/analytics/weekly-summary

POST   /api/uploads/image
POST   /api/ai/weekly-summary
```

## Start command

From the project root:

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask db init
flask db migrate -m "initial models"
flask db upgrade
flask run
```

Then in another terminal:

```bash
cd frontend
npm install
npm run dev
```

This structure is clean enough for a portfolio project and scalable if you later add AI summaries, image uploads, PWA, and analytics.