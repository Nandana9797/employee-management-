import os

from config import Config
from flask import Flask
from flask_cors import CORS
from routes.employee_routes import employee_bp
from routes.health_routes import health_bp


def create_app():
    """Application factory for Flask employee management backend."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable Cross-Origin Resource Sharing (CORS) for local frontend interaction
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints under /api prefix
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(employee_bp, url_prefix="/api")

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
