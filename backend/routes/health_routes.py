from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint required for application monitoring."""
    return jsonify({"status": "healthy"}), 200
