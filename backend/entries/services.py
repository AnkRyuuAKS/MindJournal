from datetime import datetime, timezone
from bson.objectid import ObjectId
from bson.errors import InvalidId
from extensions import mongo_db

entries_collection = mongo_db["journal_entries"]


def _serialize(entry):
    entry["id"] = str(entry.pop("_id"))
    if "user_id" in entry:
        entry["user_id"] = str(entry["user_id"])
    return entry


def create_entry(user_id: str, data: dict) -> dict:
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    if not title:
        return {"error": "Title is required."}
    if not content:
        return {"error": "Content is required."}
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "mood": data.get("mood", "neutral"),
        "tags": data.get("tags", []),
        "images": data.get("images", []),
        "is_favorite": False,
        "created_at": now,
        "updated_at": now,
    }
    result = entries_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"entry": _serialize(doc)}


def get_entries(user_id: str, page: int, per_page: int, search: str, mood: str, tag: str, favorite: str) -> dict:
    query = {"user_id": user_id}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
        ]
    if mood:
        query["mood"] = mood
    if tag:
        query["tags"] = tag
    if favorite == "true":
        query["is_favorite"] = True

    total = entries_collection.count_documents(query)
    skip = (page - 1) * per_page
    cursor = entries_collection.find(query).sort("created_at", -1).skip(skip).limit(per_page)
    entries = [_serialize(e) for e in cursor]
    return {
        "entries": entries,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


def get_entry(user_id: str, entry_id: str) -> dict:
    try:
        entry = entries_collection.find_one({"_id": ObjectId(entry_id), "user_id": user_id})
    except InvalidId:
        return {"error": "Invalid entry ID."}
    if not entry:
        return {"error": "Entry not found."}
    return {"entry": _serialize(entry)}


def update_entry(user_id: str, entry_id: str, data: dict) -> dict:
    try:
        oid = ObjectId(entry_id)
    except InvalidId:
        return {"error": "Invalid entry ID."}
    updates = {"updated_at": datetime.now(timezone.utc)}
    for field in ["title", "content", "mood", "tags", "images"]:
        if field in data:
            updates[field] = data[field]
    result = entries_collection.find_one_and_update(
        {"_id": oid, "user_id": user_id},
        {"$set": updates},
        return_document=True,
    )
    if not result:
        return {"error": "Entry not found."}
    return {"entry": _serialize(result)}


def delete_entry(user_id: str, entry_id: str) -> dict:
    try:
        oid = ObjectId(entry_id)
    except InvalidId:
        return {"error": "Invalid entry ID."}
    result = entries_collection.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        return {"error": "Entry not found."}
    return {"msg": "Entry deleted."}


def toggle_favorite(user_id: str, entry_id: str) -> dict:
    try:
        oid = ObjectId(entry_id)
    except InvalidId:
        return {"error": "Invalid entry ID."}
    entry = entries_collection.find_one({"_id": oid, "user_id": user_id})
    if not entry:
        return {"error": "Entry not found."}
    new_val = not entry.get("is_favorite", False)
    entries_collection.update_one({"_id": oid}, {"$set": {"is_favorite": new_val}})
    entry["is_favorite"] = new_val
    return {"entry": _serialize(entry)}
