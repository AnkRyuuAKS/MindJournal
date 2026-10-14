from datetime import datetime, timezone
from bson.objectid import ObjectId
from bson.errors import InvalidId
from extensions import mongo_db

dsa_collection = mongo_db["dsa_questions"]


def _serialize(doc):
    doc["id"] = str(doc.pop("_id"))
    if "user_id" in doc:
        doc["user_id"] = str(doc["user_id"])
    return doc


def create_question(user_id: str, data: dict) -> dict:
    heading = data.get("heading", "").strip()
    description = data.get("description", "").strip()
    approach = data.get("approach", "").strip()
    if not heading:
        return {"error": "Heading is required."}
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "number": data.get("number", "").strip(),
        "heading": heading,
        "description": description,
        "approach": approach,
        "created_at": now,
    }
    result = dsa_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"question": _serialize(doc)}


def get_questions(user_id: str) -> dict:
    cursor = dsa_collection.find({"user_id": user_id}).sort("created_at", -1)
    return {"questions": [_serialize(q) for q in cursor]}


def get_question(user_id: str, question_id: str) -> dict:
    try:
        doc = dsa_collection.find_one({"_id": ObjectId(question_id), "user_id": user_id})
    except InvalidId:
        return {"error": "Invalid ID."}
    if not doc:
        return {"error": "Not found."}
    return {"question": _serialize(doc)}


def delete_question(user_id: str, question_id: str) -> dict:
    try:
        oid = ObjectId(question_id)
    except InvalidId:
        return {"error": "Invalid ID."}
    result = dsa_collection.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        return {"error": "Not found."}
    return {"msg": "Deleted."}
