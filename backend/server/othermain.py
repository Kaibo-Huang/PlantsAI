from flask import Flask, jsonify, Response
from flask_cors import CORS
from flask import session, redirect, url_for
from pymongo import MongoClient
import os
import requests
import json
import pprint

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

client = MongoClient("mongodb+srv://stringbot:u2ZG9kM5q8L0WaNW@plantmap.ipx3g1d.mongodb.net/")
# client = MongoClient("mongodb+srv://stringbot:u2ZG9kM5q8L0WaNW@plantmap.ipx3g1d.mongodb.net/?retryWrites=true&w=majority&tlsCAFile=r'cert.pem')")
db = client["plantmap"]
detections = db["detections"]

# detections.insert_one({
#   "type": "Feature",
#   "geometry": {
#     "type": "Point",
#     "coordinates": [125.6, 10.1]
#   },
#   "properties": {
#     "name": "Japanese Knotweed",
#     "confidence": 0.94,
#     "timestamp": "2025-07-18T22:00:00Z",
#     "imageUrl": "/detections/123.jpg",
#     "weather": {
#       "temperature": 26.1,
#       "humidity": 78
#     },
#     "soil": {
#       "moisture": 0.54,
#       "nitrogen": 13.2
#     }
#   }
# }
# )



if __name__ == "__main__":
    # app.run(debug=True, port=8000)
    pprint(view_all())
