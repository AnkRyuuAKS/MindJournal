from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import analytics_bp
from .services import get_stats

@analytics_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    result = get_stats(user_id)
    return jsonify(result), 200
