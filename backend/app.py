from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import jwt
from auth import auth_bp
from entries import entries_bp
from uploads import uploads_bp
from analytics import analytics_bp
from dsa import dsa_bp


def create_app():
    """Application factory for MindJournal backend."""
    app = Flask(__name__)
    app.config.from_object(Config)

    jwt.init_app(app)

    CORS(
        app,
        origins=Config.CORS_ORIGINS,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    #this bascically fetches the standalone rotues from other module and tell the app what is the rotute is
    app.register_blueprint(auth_bp)
    app.register_blueprint(entries_bp)
    app.register_blueprint(uploads_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(dsa_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "app": "MindJournal API is running!",
            "status": "success"
        }), 200

    # Global JSON error handlers so the frontend always gets JSON, never HTML
    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized – please log in again."}), 401

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({"error": "Invalid or missing authentication token."}), 422

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error.", "detail": str(e)}), 500
    return app

# f you run the script directly (e.g., executing python app.py in your terminal):
# Python assigns the string "__main__" to __name__.

# If the file is imported into another script (e.g., import app inside another file):
# Python sets __name__ equal to the file's name (e.g., "app").
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)