import re
from email_validator import validate_email, EmailNotValidError

def validate_registration_input(name: str, email: str, password: str) -> dict:
    """Validate name, email and password for registration."""
    if not name or len(name.strip()) < 2:
        return {"error": "Name must be at least 2 characters."}
    try:
        # check_deliverability=False skips DNS/MX lookup — just checks format
        validate_email(email, check_deliverability=False)
    except EmailNotValidError as e:
        return {"error": str(e)}
    if len(password) < 8:
        return {"error": "Password must be at least 8 characters long."}
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        return {"error": "Password must contain letters and numbers."}
    return {}
