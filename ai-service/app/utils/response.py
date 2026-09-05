# Helper functions for standard API JSON responses across AI service endpoints
import os
from functools import wraps
from flask import jsonify, request

def success_response(data=None, message="Operation completed successfully", status_code=200):
    """Return a standard success JSON envelope matching project API standards."""
    response_body = {
        "success": True,
        "message": message,
        "data": data
    }
    return jsonify(response_body), status_code

def error_response(message="An error occurred", status_code=500, errors=None):
    """Return a standard error JSON envelope matching project API standards."""
    response_body = {
        "success": False,
        "message": message
    }
    if errors:
        response_body["errors"] = errors
    return jsonify(response_body), status_code

def require_internal_secret(f):
    """Decorator to enforce internal secret header verification for protected endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        expected_secret = os.getenv('INTERNAL_SECRET', 'kisan_connect_internal_2026')
        provided_secret = (
            request.headers.get('x-internal-secret') or
            request.headers.get('x-antigravity-secret') or
            request.headers.get('X-Internal-Secret')
        )
        if expected_secret and provided_secret != expected_secret:
            return error_response(message="Unauthorized: Invalid or missing internal secret key", status_code=401)
        return f(*args, **kwargs)
    return decorated_function
