from flask_jwt_extended import JWTManager

# MongoDB connection is initialized in this module
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize MongoDB client
mongo_client = MongoClient(
    os.getenv("MONGO_URI", "mongodb://localhost:27017/mindjournal"),
    serverSelectionTimeoutMS=5000,
)

# Database reference
mongo_db = mongo_client["MindJournal"]

# Initialize JWT manager (Flask-JWT-Extended)
jwt = JWTManager()

# In‑memory token blocklist for logout (revoked JWTs)
jwt_blocklist = set()

# Callback to check if a JWT has been revoked
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload) -> bool:
    jti = jwt_payload.get("jti")
    return jti in jwt_blocklist
