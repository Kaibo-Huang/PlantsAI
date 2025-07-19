from flask import Flask, jsonify, Response, request
from flask import Flask, jsonify, Response, request, session, redirect, url_for
from flask_cors import CORS
import requests
import json
from utils import get_plantnet_data, get_weather_data

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/home', methods=['GET'])
def home():

    data = {"message": "Welcome to the Flask API!"}
    return jsonify(data)

@app.route('/weather', methods=['GET'])
def weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    weather_data = get_weather_data(lat, lon)

    return jsonify(weather_data)

if __name__ == "__main__":
    app.run(debug=True, port=8000)