from flask import Blueprint

entries_bp = Blueprint('entries', __name__, url_prefix='/api/entries')

from . import routes
