from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# Set your Gemini API key
api_key = 'AIzaSyB3Ik2aYCuAIRRHFWIgrY6fBCxDG-RX054'
genai.configure(api_key=api_key)

@app.route('/gemini/location', methods=['POST'])
def gemini_location():
    data = request.json
    lat = data.get('lat')
    lng = data.get('lng')
    if lat is None or lng is None:
        return jsonify({'error': 'Missing lat/lng'}), 400

    prompt = f"Given the following coordinates: latitude {lat}, longitude {lng}, provide an itemized list of 10 optimal plants (without explanations as to the plants themselves, and do not include the title **Plants** there) to grow and general technical tips (of which do not exceed a total of 100 words and do not inclue the title **Technical Tips** there) for that area)"


    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content(prompt)
        return jsonify({'response': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8001, debug=True) 