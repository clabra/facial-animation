from flask import Flask, request, abort, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
import time
import os
import logger
import json

app = Flask(__name__)

CORS(app, expose_headers='Authorization')

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['UPLOAD_EXTENSIONS'] = {'.wav', '.mp3', '.mp4'}
app.config['STATIC_SOURCE'] = 'static/obama2.json'

@app.route('/time')
def get_current_time():
    return{'time': time.time()}

@app.route('/upload', methods=['POST'])
def file_upload():
    # save the file
    file = request.files['file'] 
    filename = secure_filename(file.filename)

    if filename != '':
        file_ext = os.path.splitext(filename)[1]
        if file_ext not in app.config['UPLOAD_EXTENSIONS']:
            abort(400)

    destination="/".join([app.config['UPLOAD_FOLDER'], filename])
    file.save(destination)

    #pass the file to the ml model

    # return the output
    json_file = json.load(open(app.config['STATIC_SOURCE']))
    return jsonify(json_file)

if __name__ == "__main__":
    app.run(debug=True)