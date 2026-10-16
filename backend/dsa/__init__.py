from flask import Blueprint

dsa_bp = Blueprint('dsa', __name__, url_prefix='/api/dsa')

# When app.py imports dsa_bp, Python creates the Blueprint, but it doesn't execute the code inside routes.py"
from . import routes
