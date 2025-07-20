import json
from pymongo import MongoClient
from pprint import pprint

# Path to the GeoJSON file
GEOJSON_PATH = r"c:\Users\yroeh\Downloads\global_plant_detections_50.geojson"

# MongoDB connection
client = MongoClient("mongodb+srv://stringbot:u2ZG9kM5q8L0WaNW@plantmap.ipx3g1d.mongodb.net/")
db = client["plantmap"]
collection = db["detections"]
# print(collection.find_one())

# Load GeoJSON
with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
    geojson = json.load(f)
    pprint(geojson)

count = 0
for feature in geojson["features"]:
    coords = feature["geometry"].get("coordinates", [])
    # Only insert if coordinates are valid
    if len(coords) == 2 and all(isinstance(x, (int, float)) for x in coords):
        lon, lat = coords  # coords are [longitude, latitude] in GeoJSON
        doc = {
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]  # longitude first!
            },
            "properties": feature["properties"]
        }
        # pprint(doc)
        collection.insert_one(doc)
        count += 1
print(f"Inserted {count} points into MongoDB.")
