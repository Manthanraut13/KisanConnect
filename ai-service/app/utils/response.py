# Helper functions for standard API JSON responses across AI service endpoints
from flask import jsonify

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
