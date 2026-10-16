from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import analytics_bp
from .services import get_stats, generate_weekly_report, get_latest_report

@analytics_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    result = get_stats(user_id)
    return jsonify(result), 200

@analytics_bp.route('/analyze-week', methods=['POST'])
@jwt_required()
def analyze_week():
    user_id = get_jwt_identity()
    result = generate_weekly_report(user_id)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200

@analytics_bp.route('/latest-report', methods=['GET'])
@jwt_required()
def latest_report():
    user_id = get_jwt_identity()
    result = get_latest_report(user_id)
    return jsonify(result), 200
