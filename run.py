from server import create_app

import socketio

import os

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000)) 
    socketio.run(app, debug=True, port=port)

# https://strapi.io/blog/how-to-create-a-chat-bot-assistant-using-next-js-tailwind-css-and-strapi?utm_source=reddit&utm_medium=nextjs&utm_campaign=blog