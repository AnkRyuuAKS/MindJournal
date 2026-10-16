import os
import json
import logging
from datetime import datetime, timezone, timedelta
from collections import Counter
from bson.objectid import ObjectId
from extensions import mongo_db
from models import create_report_document


def _user_query(user_id: str) -> dict:
    """Matches user_id whether stored as string or ObjectId in MongoDB."""
    if ObjectId.is_valid(user_id):
        return {"$or": [{"user_id": str(user_id)}, {"user_id": ObjectId(user_id)}]}
    return {"user_id": str(user_id)}


def _normalize_datetime(dt):
    """Safely normalizes naive or aware datetimes or strings to UTC timezone-aware datetimes."""
    if dt is None:
        return None
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except Exception:
            return None
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    return None

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

entries_collection = mongo_db["journal_entries"]
dsa_collection = mongo_db["dsa_questions"]
reports_collection = mongo_db["analytics_reports"]

MOODS = ["happy", "excited", "calm", "sad", "anxious", "angry", "neutral"]


class WeeklyReportOutput(BaseModel):
    summary: str = Field(description="A warm, thoughtful 2-3 paragraph weekly reflection summarizing the user's journaling, mindset, and week.")
    mood_analysis: str = Field(description="A nuanced analysis of their emotional patterns, dominant feelings, shifts, and emotional balance.")
    key_themes: list[str] = Field(description="List of 3 to 5 core topics, themes, or recurring subjects mentioned in their entries.")
    strengths_and_positives: list[str] = Field(description="List of 2 to 4 positive highlights, achievements, gratitude moments, or demonstrated resilience.")
    areas_for_growth: list[str] = Field(description="List of 1 to 3 challenges, stressors, or self-care opportunities noticed.")
    actionable_recommendations: list[str] = Field(description="List of 3 to 5 practical, encouraging suggestions or habits for the upcoming week.")
    weekly_quote: str = Field(description="An uplifting, context-specific inspirational quote or takeaway for their week ahead.")


def _serialize_report(report: dict) -> dict:
    if not report:
        return None
    res = dict(report)
    if "_id" in res:
        res["id"] = str(res.pop("_id"))
    if "user_id" in res:
        res["user_id"] = str(res["user_id"])
    if isinstance(res.get("created_at"), datetime):
        res["created_at"] = res["created_at"].isoformat()
    if isinstance(res.get("updated_at"), datetime):
        res["updated_at"] = res["updated_at"].isoformat()
    return res


def get_stats(user_id: str) -> dict:
    query = _user_query(user_id)
    entries = list(entries_collection.find(query))
    total_dsa = dsa_collection.count_documents(query)
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

    entries_this_week = 0
    entries_this_month = 0
    normalized_dates = []

    for e in entries:
        dt = _normalize_datetime(e.get("created_at"))
        if dt:
            if dt >= week_ago:
                entries_this_week += 1
            if dt >= month_ago:
                entries_this_month += 1
            normalized_dates.append(dt.date())

    favorite_count = sum(1 for e in entries if e.get("is_favorite", False))

    # Calculate streak
    dates = sorted(set(normalized_dates), reverse=True)
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


def get_latest_report(user_id: str) -> dict:
    query = _user_query(user_id)
    latest = reports_collection.find_one(query, sort=[("created_at", -1)])
    return {"report": _serialize_report(latest) if latest else None}


def generate_weekly_report(user_id: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {
            "error": "Gemini API key is not configured. Please add GEMINI_API_KEY (or GOOGLE_API_KEY) in backend/.env to enable AI analysis."
        }

    stats = get_stats(user_id)
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    query = _user_query(user_id)
    all_user_entries = list(entries_collection.find(query).sort("created_at", -1))

    # Filter entries from the past 7 days using timezone-safe comparison
    recent_entries = [
        e for e in all_user_entries
        if _normalize_datetime(e.get("created_at")) and _normalize_datetime(e.get("created_at")) >= week_ago
    ]

    # Fallback to recent entries if the past 7 days have fewer than 2 entries
    if len(recent_entries) < 2:
        if all_user_entries:
            recent_entries = all_user_entries[:10]

    if not recent_entries:
        return {
            "error": "No journal entries found to analyze. Please write at least one journal entry first."
        }

    formatted_entries = []
    for e in recent_entries:
        dt = _normalize_datetime(e.get("created_at"))
        date_str = dt.strftime("%A, %b %d, %Y") if dt else str(e.get("created_at", ""))
        formatted_entries.append({
            "date": date_str,
            "title": e.get("title", "Untitled"),
            "mood": e.get("mood", "neutral"),
            "tags": e.get("tags", []),
            "content": e.get("content", ""),
        })

    # Optional DSA learning stats for richer context
    dsa_cursor = dsa_collection.find(query).sort("created_at", -1).limit(5)
    dsa_items = [
        {
            "title": d.get("title"),
            "difficulty": d.get("difficulty"),
            "status": d.get("status"),
        }
        for d in dsa_cursor
    ]

    try:
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            api_key=api_key,
            temperature=0.7,
        )

        parser = JsonOutputParser(pydantic_object=WeeklyReportOutput)

        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You are an empathetic, emotionally perceptive, and encouraging AI journaling coach and analytics analyst for MindJournal.\n"
                "Your mission is to analyze the user's weekly journaling entries, emotional distribution, consistency/streak habits, and learning progress.\n"
                "Synthesize meaningful reflections, identifying emotional patterns, core themes, key personal strengths, gentle growth opportunities, actionable wellness recommendations for the upcoming week, and an inspiring quote.\n"
                "You MUST respond ONLY with valid JSON conforming to the schema below. Do not include markdown codeblock wrappers or any extra text outside the JSON.\n\n"
                "{format_instructions}"
            ),
            (
                "user",
                "Here is the user's journaling and habit data:\n\n"
                "--- Analytics & Habit Metrics ---\n"
                "- Total Entries: {total_entries}\n"
                "- Current Streak: {streak} days\n"
                "- Entries Logged This Week: {entries_this_week}\n"
                "- Mood Distribution: {mood_distribution}\n"
                "- DSA Problems Solved: {total_dsa}\n\n"
                "--- User's Recent Journal Entries ---\n"
                "{entries_json}\n\n"
                "--- DSA / Problem Solving Activity ---\n"
                "{dsa_json}\n\n"
                "Please analyze their week deeply and produce a structured, empathetic weekly report."
            ),
        ])

        chain = prompt | llm | parser

        result = chain.invoke({
            "format_instructions": parser.get_format_instructions(),
            "total_entries": stats.get("total_entries", 0),
            "streak": stats.get("streak", 0),
            "entries_this_week": stats.get("entries_this_week", 0),
            "mood_distribution": json.dumps(stats.get("mood_distribution", {})),
            "total_dsa": stats.get("total_dsa", 0),
            "entries_json": json.dumps(formatted_entries, indent=2),
            "dsa_json": json.dumps(dsa_items, indent=2),
        })

        # Persist report in MongoDB
        report_doc = create_report_document(
            user_id=user_id,
            summary=result.get("summary", ""),
            mood_analysis=result.get("mood_analysis", ""),
            key_themes=result.get("key_themes", []),
            strengths_and_positives=result.get("strengths_and_positives", []),
            areas_for_growth=result.get("areas_for_growth", []),
            actionable_recommendations=result.get("actionable_recommendations", []),
            weekly_quote=result.get("weekly_quote", ""),
            stats_snapshot={
                "total_entries": stats.get("total_entries", 0),
                "streak": stats.get("streak", 0),
                "entries_this_week": stats.get("entries_this_week", 0),
                "mood_distribution": stats.get("mood_distribution", {}),
                "total_dsa": stats.get("total_dsa", 0),
            },
        )

        insert_res = reports_collection.insert_one(report_doc)
        report_doc["_id"] = insert_res.inserted_id

        return {"report": _serialize_report(report_doc)}

    except Exception as e:
        logger.exception("Error generating weekly report with Gemini and LangChain")
        return {
            "error": f"Failed to generate analysis with Gemini: {str(e)}"
        }
