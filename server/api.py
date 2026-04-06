import traceback

from flask import Blueprint, request, jsonify
from flask_cors import CORS, cross_origin
from flask_socketio import emit

from server.chatbot import generate_response
from . import socketio

bp = Blueprint('main', __name__, static_folder='../client/build', static_url_path='/')

CORS(bp, resources={r'/api/*': {'origins': '*'}})

# In-memory chat history per session
chat_histories = {}


@socketio.on_error_default
def default_error_handler(e):
    print(f"SocketIO Error: {e}")
    traceback.print_exc()


@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    chat_histories[request.sid] = []


@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    chat_histories.pop(request.sid, None)


@socketio.on('message')
def chat(param):
    """
    Handle incoming chat message.
    Expects: { name, message, subreddit }
    """
    user_message = str(param.get('message', ''))
    subreddit = str(param.get('subreddit', ''))

    if not user_message or not subreddit:
        emit('reply', {'name': 'Bot', 'message': 'Missing required fields (message or subreddit).'})
        return

    emit('status', {'status': 'thinking', 'message': f'Searching r/{subreddit} for relevant posts...'})

    try:
        history = chat_histories.get(request.sid, [])

        reply, keywords = generate_response(
            message=user_message,
            subreddit_name=subreddit,
            chat_history=history,
        )

        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": reply})
        chat_histories[request.sid] = history

        emit('reply', {
            'name': f'r/{subreddit}',
            'message': reply,
            'keywords': keywords,
        })

    except Exception as e:
        print(f"Chat error: {e}")
        traceback.print_exc()
        emit('reply', {'name': 'Bot', 'message': f"Something went wrong: {e}"})


@bp.app_errorhandler(404)
def not_found(e):
    return bp.send_static_file('index.html')


@bp.route('/')
def serve():
    return bp.send_static_file('index.html')


@bp.route('/api/health', methods=['GET'])
@cross_origin()
def health():
    return jsonify({"status": "ok"})
