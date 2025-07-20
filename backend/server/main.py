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
db.detections.create_index([("geometry", "2dsphere")])

@app.route('/pins/near', methods=['GET'])
def get_pins_near():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    max_distance_meters = float(request.args.get('max_distance', 1000))
    print(lat, lon, max_distance_meters)
    query = {
        "geometry": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [float(lon), float(lat)]
                },
                "$maxDistance": max_distance_meters,
                "$minDistance": 0
            }
        }
    }
    res = list(db.detections.find(query, {"_id": 0}))

    print(res)
    return res
@app.route('/pins/cluster', methods=['GET'])
def cluster_pins_grid(cell_size_meters=500):
    cell_size_meters = request.args.get('cell_size', 500)
    pipeline = [
        {
            "$group": {
                "_id": {
                    "lat": { "$trunc": [{ "$arrayElemAt": ["$geometry.coordinates", 0] }, int(cell_size_meters / 111320)] },
                    "lon": { "$trunc": [{ "$arrayElemAt": ["$geometry.coordinates", 1] }, int(cell_size_meters / 111320)] }
                },
                "count": { "$sum": 1 },
                "pins": { "$push": "$$ROOT" }
            }
        }
    ]
    return list(db.detections.aggregate(pipeline))

@app.route('/pins/bbox', methods=['GET'])
def get_pins_in_bbox(min_lat, min_lon, max_lat, max_lon):
    query = {
        "geometry.coordinates.0": { "$gte": float(min_lat), "$lte": float(max_lat) },
        "geometry.coordinates.1": { "$gte": float(min_lon), "$lte": float(max_lon) }
    }
    return list(db.detections.find(query, {"_id": 0}))

@app.route('/admin/add', methods=['POST'])
def add_pin():
    lat = request.form.get('lat')
    lon = request.form.get('lng')
    alert = request.form.get('alertForCare')
    favorite = request.form.get('favoriteOnMap')
    file = request.files.get('file')
    
    file_name = None
    file_path = None

    if file:
        UPLOAD_FOLDER = 'uploads'
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        file_name = file.filename

    # Get weather and plant data
    weather_data = get_weather_data(lat, lon)
    plant_data = get_plantnet_data([file_path]) if file_name else None

    # Get best plant name for Gemini prompt
    plant_name = "unknown"
    try:
        plant_name = plant_data.get("bestMatch", "unknown") if plant_data else "unknown"
    except Exception as e:
        print("Error extracting plant name:", e)

    # Build prompt
    model = genai.GenerativeModel("models/gemini-1.5-flash")  # ✅ this works
    prompt = (
        f"Given the weather condition: {weather_data.get('weather', [{}])[0].get('main', 'unknown')}, "
        f"location (latitude: {lat}, longitude: {lon}) and the species of the plant: {plant_name}, "
        f"provide a 50 word blurb of tips in taking care of the plant with technical gardening details. "
        f"Also, output a JSON object with the following fields: "
        f"soil_pH (number), time_between_waterings (in days, number), optimal_light_level "
        f"(string: e.g. 'full sun', 'partial shade', etc.), endangered (boolean), invasive (boolean). "
        f"Format the JSON as the last part of your response."
    )

    # Call Gemini and extract output
    blurb = ""
    gemini_data = {}

    try:
        response = model.generate_content(prompt)
        if response:
            text = response.text
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                json_str = match.group(0)
                gemini_data = json.loads(json_str)
                blurb = text[:text.find('{')].strip()
    except google.api_core.exceptions.ResourceExhausted:
        print("Gemini quota exceeded.")
    except Exception as e:
        print("Error with Gemini generation:", e)

    # Construct MongoDB document
    detection = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(lon), float(lat)]
        },
        "properties": {
            "alert": alert,
            "favorite": favorite,
            "fileName": file_name,
            "weather": weather_data,
            "plant": plant_data,
            "gemini_tips": {
                "blurb": blurb,
                "details": gemini_data
            }
        }
    }

    detections.insert_one(detection)
    return jsonify({"message": "Detection added with Gemini tips"}), 201

@app.route('/admin/search', methods=['GET', 'POST'])
def search_plants():
    query = request.args.get('q') if request.method == 'GET' else request.json.get('query')
    if not query:
        print("No query provided")
        return jsonify([])

    # Search for plants whose 'properties' fields match the query (case-insensitive)
    results = list(db.detections.find(
        {"properties.plant.bestMatch": {"$regex": query, "$options": "i"}},
        {"_id": 0, "geometry.coordinates": 1}
    ))
    # print(f"Search results for '{query}': {len(results)} found")
    # Return all results' lat/lon as [[lat, lon], ...]
    coords_list = []
    for result in results:
        if "geometry" in result and "coordinates" in result["geometry"]:
            coords = result["geometry"]["coordinates"]
            if len(coords) == 2:
                coords_list.append(coords)
    # print(f"Returning coordinates: {coords_list}")
    for coords in coords_list:
        print(f"Search result: lat={coords[0]}, lon={coords[1]}")
    return jsonify(coords_list)


@app.route("/admin/view")
def view_all():
    try:
        return jsonify(list(db.detections.find({}, {"_id": 0})))
    except Exception as e:
        print("Error viewing all detections:", e)
        return jsonify({"error": "Failed to retrieve data"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)