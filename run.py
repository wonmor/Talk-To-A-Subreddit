from server import create_app, socketio, api

import os

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000)) 
    socketio.run(app, host="0.0.0.0", debug=True, port=port)
    
'''
HOW TO FIX FLASK-SOCKETIO NOT WORKING ERROR:
https://stackoverflow.com/questions/65293084/flask-socketio-server-side-not-receivng-events
'''