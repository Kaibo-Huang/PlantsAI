from flask import Flask, request, jsonify
from flask import Flask, jsonify, Response, request
from flask import Flask, jsonify, Response, request, session, redirect, url_for
from flask_cors import CORS
import os
import google.generativeai as genai
import requests
import json
import re
import google.api_core.exceptions
from utils import get_weather_data, get_plantnet_data
from pymongo import MongoClient

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api_key = 'AIzaSyB6fEHUqwOnsEibGm6P6rz42h4ZzizufhQ'
genai.configure(api_key=api_key)

client = MongoClient("mongodb+srv://stringbot:u2ZG9kM5q8L0WaNW@plantmap.ipx3g1d.mongodb.net/")
db = client["plantmap"]
detections = db["detections"]

# pulls weather temperature, geographic location in coordinates, and species of plant
latitude = 43.772915
longitude = -79.499285

# Get weather data
weather_data = get_weather_data(latitude, longitude)
weather = weather_data.get('weather', [{}])[0].get('main', 'unknown')

# Get plant data (you'll need to provide image path)
# For now, using a default plant name - you can modify this based on your needs
plant = "moneytree"  # This could be extracted from plant identification results
model = genai.GenerativeModel('gemini-1.5-flash-8b')
prompt = (
    "Given the weather condition: " + weather +
    ", location (latitude: " + str(latitude) + ", longitude: " + str(longitude) + 
    ") and the species of the plant: " + plant +
    ", provide a 50 word blurb of tips in taking care of the plant with technical gardening details. "
    "Also, output a JSON object with the following fields: "
    "soil_pH (number), time_between_waterings (in days, number), optimal_light_level (string: e.g. 'full sun', 'partial shade', etc.), endangered (boolean true or false, according to canadian sources), invasive (boolean true or false, according to canadian sources). "
    "Format the JSON as the last part of your response."
)
try:
    response = model.generate_content(prompt)
except google.api_core.exceptions.ResourceExhausted as e:
    print("Gemini API quota exceeded. Please wait for quota reset or upgrade your plan.")
    response = None

if response:
    text = response.text

    # Find JSON in the response (assuming it's the last code block)
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        json_str = match.group(0)
        try:
            data = json.loads(json_str)
            # Save to file
            with open('plant_care.json', 'w') as f:
                json.dump(data, f, indent=2)
            
            # Extract the blurb (everything before the JSON)
            blurb = text[:text.find('{')].strip()
            
            # Print only the formatted values and blurb
            print(f"Soil pH: {data.get('soil_pH', 'N/A')}")
            print(f"Watering Frequency: {data.get('time_between_waterings', 'N/A')} Days")
            print(f"Optimal Light Levels: {data.get('optimal_light_level', 'N/A')}")
            print(f"Endangered: {data.get('endangered', 'N/A')}")
            print(f"Invasive: {data.get('invasive', 'N/A')}")
            print("\n" + blurb)
        except json.JSONDecodeError:
            print("Could not decode JSON from Gemini response.")
    else:
        print("No JSON found in Gemini response.")
else:
    print("No Gemini response due to quota limits.")

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

@app.route('/plantnet', methods=['POST'])
def plantnet():
    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400

    file_paths = []
    UPLOAD_FOLDER = 'uploads'
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    for file in request.files.getlist('files'):
        file_path = os.path.join('uploads', file.filename)
        file.save(file_path)
        file_paths.append(file_path)

    plant_data = get_plantnet_data(file_paths)

    return jsonify(plant_data)

# @app.route('/admin/add', methods=['POST'])
# def add_pin():
#     data = request.json
#     if not data:
#         print("No data provided for insertion.")
#         return jsonify({"error": "No data provided"}), 400
#     try:
#         lat = data['lat']
#         lon = data['lng']
#         data = {
#             "type": "Feature",
#             "geometry": {
#                 "type": "Point",
#                 "coordinates": [lat, lon]
#             },
#             "properties": {
#                 "alert": data['alertForCare'],
#                 "favorite": data['favoriteOnMap'],
#                 # 'fileName': data['fileName'],
#                 "weather": jsonify(get_weather_data(lat, lon)),
#                 "plant": jsonify(get_plantnet_data([data['fileName']])),
#             }
#         }
#         detections.insert_one(data)
#         print("Data inserted successfully:", data)
#         return jsonify({"message": "Detection added successfully"}), 201
#     except Exception as e:
#         print("Error inserting data:", e)
#         return jsonify({"error": str(e)}), 500
@app.route('/admin/add', methods=['POST'])
def add_pin():
    lat = request.form.get('lat')
    lon = request.form.get('lng')
    alert = request.form.get('alertForCare')
    favorite = request.form.get('favoriteOnMap')
    file = request.files.get('file')
    file_name = None
    if file:
        UPLOAD_FOLDER = 'uploads'
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        file_name = file.filename

    data = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(lat), float(lon)]
        },
        "properties": {
        "alert": alert,
        "favorite": favorite,
        "fileName": file_name,
        "weather": get_weather_data(lat, lon),
        "plant": get_plantnet_data([file_path]) if file_name else None
        }
    }
    detections.insert_one(data)
    return jsonify({"message": "Detection added successfully"}), 201

@app.route("/admin/view")
def view_all():
    return jsonify(list(db.detections.find({}, {"_id": 0})))

if __name__ == "__main__":
    app.run(debug=True, port=8000)