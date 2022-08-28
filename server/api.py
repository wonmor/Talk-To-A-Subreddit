import json
import os

from flask import Blueprint, request, current_app, jsonify

from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit, join_room

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from server.extensions import multipart_download_boto3

from server.train import *
from server.reddit import *

from . import socketio

'''
█▀█ █▀▀ █▀ ▀█▀   ▄▀█ █▀█ █
█▀▄ ██▄ ▄█ ░█░   █▀█ █▀▀ █

DEVELOPED AND DESIGNED BY JOHN SEONG
'''

bp = Blueprint('main', __name__, static_folder='../client/build', static_url_path='/')

limiter = Limiter(
    current_app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# WHAT IS CORS: https://flask-cors.readthedocs.io/en/latest/

CORS(bp, resources={r'/api/*': {'origins': '*'}})

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

train = Train(debug_mode=False)

@socketio.on_error_default
def default_error_handler(e):
    '''
    This function handles all errors that occur in the socket.io connection
    
    Parameters
    ----------
    e: Exception
        The exception that was raised

    Returns
    -------
    None
    '''
    print("Error: {}".format(e))
    socketio.stop()

@socketio.on('message')
def chat(param):
    '''
    When a user joins the room, they are added to the room's list of users
    
    Parameters
    ----------
    message : dict
        A dictionary containing the room name and the user's name

    Returns
    -------
    None
    '''
    emit('reply', ({'name': 'Bot', 'message': train.send_chat(str(param['message']))}))

# For React Router Redirection Purposes...
@bp.app_errorhandler(404)   
@limiter.exempt
def not_found(e):   
    '''
    This function is used to redirect the user to the React Router page

    CANNOT STOP UNKNOWN SERVER FIX:
    https://stackoverflow.com/questions/39340650/shut-down-flask-socketio-server

    Parameters
    ----------
    e: Exception
        The exception that was raised

    Returns
    -------
    DOM File
        Returns a HTML script that contains the visual elements of the website
    '''
    return bp.send_static_file('index.html')

@bp.route('/') 
@limiter.exempt
def serve():
    '''
    This function is executed in root directory,
    redirecting to the static HTML file generated by React front-end framework
    
    Parameters
    ----------
    None

    Returns
    -------
    DOM File
        Returns a HTML script that contains the visual elements of the website
    '''
    return bp.send_static_file('index.html')

@bp.route('/api/connect', methods=['GET', 'POST'])
@limiter.exempt
@cross_origin()
def connect():
    '''
    When API call is made, this function initializes
    the chat session with the bot
    
    Parameters
    ----------
    None

    Returns
    -------
    None
    '''

    Reddit.download_kw_model()
    Train.download_nltk()

    train.start_training()

    return jsonify({"result": "success"});

'''
----------------------------------------------------------------

:: TIPS & TRICKS FOR INSTALLING GPAW (PSEUDO WAVEFUNCTION GENERATOR/CALCULATOR) IN A MACOS ENVIRONMENT ::

A MUST! ADD CONDA BUILDPACK TO HEROKU: https://elements.heroku.com/buildpacks/heroku-python/conda-buildpack

ALSO DO NOT PLACE GPAW IN THE REQUIREMENTS.TXT FILE; MOVE IT TO CONDA-REQUIREMENTS.TXT AS IT REQUIRES C DEPENDENCIES

Make sure you download libxc through brew and execute all the export commands on macOS:
https://gitlab.com/gpaw/gpaw/-/merge_requests/830/diffs#43b43d9adc91f1e38f6d186a1d173d83aaea27fd

After installing libxc through brew...

ON MAC:
1. export C_INCLUDE_PATH=/opt/homebrew/Cellar/libxc/5.2.3/include
2. export LIBRARY_PATH=/opt/homebrew/Cellar/libxc/5.2.3/lib
3. export LD_LIBRARY_PATH=/opt/homebrew/Cellar/libxc/5.2.3/lib
4. export LDFLAGS="-L/opt/homebrew/opt/openblas/lib"
5. export CPPFLAGS="-I/opt/homebrew/opt/openblas/include"

ON UBUNTU:
https://gitlab.com/gpaw/gpaw/-/blob/master/doc/platforms/Linux/ubuntu.rst#id1

After all this, execute pip3 install gpaw

----------------------------------------------------------------

:: HELPFUL LINKS ::

https://www.brown.edu/Departments/Engineering/Labs/Peterson/tips/ElectronDensity/index.html

----------------------------------------------------------------

:: HOW TO ACCESS HEROKU CLI BASH TERMINAL ::

heroku login
heroku ps:exec --app=scoreboard-backend-dev

---------------------------------------------------------------- 

:: HOW TO DOCKERIZE A REACT + FLASK STACK (REPLACE PATH WITH YOUR PROJECT PATH, DEFAULT SET TO MAC STANDARD)::

https://blog.miguelgrinberg.com/post/how-to-dockerize-a-react-flask-project
https://developer.okta.com/blog/2020/06/24/heroku-docker-react#deploy-your-react-app-to-heroku

BUILD DOCKER FILE COMMAND — SERVER:
docker build -f /Users/johnseong/Documents/GitHub/ElectronVisualized/Dockerfile.api -t electronvisualized-api .
[OPTIONAL] docker run --rm -p 5000:5000 electronvisualized-api

BUILD DOCKER FILE COMMAND — CLIENT:
docker build -f /Users/johnseong/Documents/GitHub/ElectronVisualized/Dockerfile.client -t electronvisualized-client .

DOCKER-COMPOSE:
docker-compose build
docker-compose up

HEROKU:
heroku stack:set container
heroku container:push --recursive
heroku container:release web worker // If it's DockerFile.web and DockerFile.worker...

----------------------------------------------------------------

:: ADDITIONAL REALLY HELPFUL LINKS ::

https://dev.to/ejach/how-to-deploy-a-python-flask-app-on-heroku-using-docker-mpc

HOW TO SET UP FOR MACOS & MAC APP STORE DISTRIBUTION:
https://stackoverflow.com/questions/72194861/electron-macos-app-not-available-for-testing-in-testflight

WEBRTC FLASK + REACT TUTORIAL:
https://www.100ms.live/blog/python-react-webrtc-app
https://developer.okta.com/blog/2021/07/14/socket-io-react-tutorial

----------------------------------------------------------------
'''