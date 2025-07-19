from flask import Flask, jsonify, Response
from flask_cors import CORS
from flask import session, redirect, url_for
import requests
import json

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/home', methods=['GET'])
def home():

    data = {"message": "Welcome to the Flask API!"}
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True, port=8000)