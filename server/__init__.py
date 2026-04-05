from flask import Flask
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

socketio = SocketIO(cors_allowed_origins="*")


def create_app():
    app = Flask(__name__, static_folder='../client/build', static_url_path='/')

    load_dotenv()

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")

    from . import api
    app.register_blueprint(api.bp)

    socketio.init_app(app)

    return app


app = create_app()
