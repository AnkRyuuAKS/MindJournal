from datetime import datetime, timezone
from extensions import mongo_db, jwt_blocklist
from .utils import hash_password, check_password
from .validators import validate_registration_input
from flask_jwt_extended import create_access_token, get_jwt_identity, get_jwt
from bson.objectid import ObjectId

users_collection = mongo_db["users"]

def register_user(name: str, email: str, password: str) -> dict:
    """Register a new user."""
    validation = validate_registration_input(name, email, password)
    if validation.get('error'):
        return {"error": validation['error']}
    if users_collection.find_one({"email": email.lower().strip()}):
        return {"error": "Email already registered."}
    password_hash = hash_password(password)
    now = datetime.now(timezone.utc)
    user_doc = {
        "name": name.strip(),
        "email": email.lower().strip(),
        "password_hash": password_hash,
        "created_at": now,
        "updated_at": now,
    }
    result = users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return {"user": {"id": str(user_doc["_id"]), "email": email.lower().strip(), "name": name.strip()}}

def authenticate_user(email: str, password: str) -> dict:
    """Check credentials and return JWT if valid."""
    user = users_collection.find_one({"email": email.lower().strip()})
    if not user:
        return {"error": "Invalid email or password."}
    if not check_password(password, user["password_hash"]):
        return {"error": "Invalid email or password."}
    access_token = create_access_token(identity=str(user["_id"]))
    return {
        "access_token": access_token,
        "user": {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", "")}
    }

def logout_token(jti: str):
    """Add a token's jti to the blocklist."""
    jwt_blocklist.add(jti)
    return {"msg": "Successfully logged out."}

def get_current_user(user_id: str) -> dict:
    """Return the current authenticated user's info."""
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"error": "User not found."}
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", "")}
