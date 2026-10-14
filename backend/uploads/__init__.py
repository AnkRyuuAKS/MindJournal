from flask import Blueprint

uploads_bp = Blueprint('uploads', __name__, url_prefix='/api/uploads')

from . import routes
