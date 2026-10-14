from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import entries_bp
from .services import (
    create_entry, get_entries, get_entry,
    update_entry, delete_entry, toggle_favorite
)

@entries_bp.route('', methods=['POST'])
@jwt_required()
def create():
    user_id = get_jwt_identity()
    data = request.get_json(force=True, silent=True) or {}
    result = create_entry(user_id, data)
    if 'error' in result:
        return jsonify(result), 400
    return jsonify(result), 201

@entries_bp.route('', methods=['GET'])
@jwt_required()
def list_entries():
    user_id = get_jwt_identity()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    search = request.args.get('search', '')
    mood = request.args.get('mood', '')
    tag = request.args.get('tag', '')
    favorite = request.args.get('favorite', '')
    result = get_entries(user_id, page, per_page, search, mood, tag, favorite)
    return jsonify(result), 200

@entries_bp.route('/<entry_id>', methods=['GET'])
@jwt_required()
def get_one(entry_id):
    user_id = get_jwt_identity()
    result = get_entry(user_id, entry_id)
    if 'error' in result:
        return jsonify(result), 404
    return jsonify(result), 200

@entries_bp.route('/<entry_id>', methods=['PUT'])
@jwt_required()
def update(entry_id):
    user_id = get_jwt_identity()
    data = request.get_json(force=True, silent=True) or {}
    result = update_entry(user_id, entry_id, data)
    if 'error' in result:
        return jsonify(result), 404
    return jsonify(result), 200

@entries_bp.route('/<entry_id>', methods=['DELETE'])
@jwt_required()
def delete(entry_id):
    user_id = get_jwt_identity()
    result = delete_entry(user_id, entry_id)
    if 'error' in result:
        return jsonify(result), 404
    return jsonify(result), 200

@entries_bp.route('/<entry_id>/favorite', methods=['PATCH'])
@jwt_required()
def favorite(entry_id):
    user_id = get_jwt_identity()
    result = toggle_favorite(user_id, entry_id)
    if 'error' in result:
        return jsonify(result), 404
    return jsonify(result), 200
