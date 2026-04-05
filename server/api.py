import json
import os
import traceback

from flask import Blueprint, request, jsonify
from flask_cors import CORS, cross_origin
from flask_socketio import emit
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from server.chatbot import generate_response
from . import socketio

bp = Blueprint('main', __name__, static_folder='../client/build', static_url_path='/')

CORS(bp, resources={r'/api/*': {'origins': '*'}})

# In-memory chat history per session (keyed by socket session id)
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
    Expects: { name, message, subreddit, openaiKey }
    """
    user_message = str(param.get('message', ''))
    subreddit = str(param.get('subreddit', ''))
    openai_key = str(param.get('openaiKey', ''))

    if not user_message or not subreddit or not openai_key:
        emit('reply', {'name': 'Bot', 'message': 'Missing required fields (message, subreddit, or API key).'})
        return

    # Emit a "thinking" status
    emit('status', {'status': 'thinking', 'message': f'Searching r/{subreddit} for relevant posts...'})

    try:
        # Get chat history for this session
        history = chat_histories.get(request.sid, [])

        # Generate response using RAG pipeline
        reply, keywords = generate_response(
            message=user_message,
            subreddit_name=subreddit,
            openai_key=openai_key,
            chat_history=history,
        )

        # Update chat history
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
        error_msg = str(e)
        if "api_key" in error_msg.lower() or "authentication" in error_msg.lower() or "invalid" in error_msg.lower():
            error_msg = "Invalid OpenAI API key. Please check your key and try again."
        else:
            error_msg = f"Something went wrong: {error_msg}"
        emit('reply', {'name': 'Bot', 'message': error_msg})


# Serve React app
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
