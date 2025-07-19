from flask import Flask, request, jsonify
from flask import Flask, jsonify, Response, request
from flask import Flask, jsonify, Response, request, session, redirect, url_for
from flask_cors import CORS
import os
import google.generativeai as genai
import requests
import json
import re
from utils import get_weather_data, get_plantnet_data

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api_key = 'AIzaSyB3Ik2aYCuAIRRHFWIgrY6fBCxDG-RX054'
genai.configure(api_key=api_key)

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
response = model.generate_content(prompt)

# After getting response.text
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