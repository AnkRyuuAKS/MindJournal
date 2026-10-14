from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import dsa_bp
from .services import create_question, get_questions, get_question, delete_question


@dsa_bp.route('', methods=['POST'])
@jwt_required()
def create():
    user_id = get_jwt_identity()
    data = request.get_json(force=True, silent=True) or {}
    result = create_question(user_id, data)
    if 'error' in result:
        return jsonify(result), 400
    return jsonify(result), 201


@dsa_bp.route('', methods=['GET'])
@jwt_required()
def list_questions():
    user_id = get_jwt_identity()
    return jsonify(get_questions(user_id)), 200


@dsa_bp.route('/<question_id>', methods=['GET'])
@jwt_required()
def get_one(question_id):
    user_id = get_jwt_identity()
    result = get_question(user_id, question_id)
    if 'error' in result:
        return jsonify(result), 404
    return jsonify(result), 200


@dsa_bp.route('/<question_id>', methods=['DELETE'])
@jwt_required()
def delete(question_id):
    user_id = get_jwt_identity()
    result = delete_question(user_id, question_id)
    if 'error' in result:
        return jsonify(result), 404
    return jsonify(result), 200
