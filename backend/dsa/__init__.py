from flask import Blueprint

dsa_bp = Blueprint('dsa', __name__, url_prefix='/api/dsa')

from . import routes
