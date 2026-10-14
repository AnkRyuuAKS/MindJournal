from flask import request, jsonify, make_response
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, get_jwt,
    create_access_token, set_access_cookies, unset_jwt_cookies
)

from . import auth_bp
from .services import register_user, authenticate_user, logout_token, get_current_user

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '')
    email = data.get('email', '')
    password = data.get('password', '')
    result = register_user(name, email, password)
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    # Auto-login: issue JWT cookie AND return token in body for header-based auth
    access_token = create_access_token(identity=result['user']['id'])
    resp = make_response(jsonify({'user': result['user'], 'access_token': access_token}), 201)
    set_access_cookies(resp, access_token)
    return resp

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '')
    password = data.get('password', '')
    result = authenticate_user(email, password)
    if 'error' in result:
        return jsonify({'error': result['error']}), 401
    access_token = result['access_token']
    resp = make_response(jsonify({'user': result['user'], 'access_token': access_token}), 200)
    set_access_cookies(resp, access_token)
    return resp

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    logout_token(jti)
    resp = make_response(jsonify({'msg': 'Logged out'}), 200)
    unset_jwt_cookies(resp)
    return resp

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = get_current_user(user_id)
    if 'error' in user:
        return jsonify({'error': user['error']}), 404
    return jsonify({'user': user}), 200
