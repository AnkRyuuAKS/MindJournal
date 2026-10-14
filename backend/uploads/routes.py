import os
import uuid
from flask import request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required
from . import uploads_bp

ALLOWED = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED


@uploads_bp.route('', methods=['POST'])
@jwt_required()
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))
    url = f"/api/uploads/{filename}"
    return jsonify({'url': url, 'filename': filename}), 201


@uploads_bp.route('/<filename>', methods=['GET'])
def serve(filename):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_folder, filename)


@uploads_bp.route('/<filename>', methods=['DELETE'])
@jwt_required()
def delete_file(filename):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    path = os.path.join(upload_folder, filename)
    if os.path.exists(path):
        os.remove(path)
        return jsonify({'msg': 'File deleted'}), 200
    return jsonify({'error': 'File not found'}), 404
