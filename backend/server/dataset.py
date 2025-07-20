import requests
import json
from pymongo import MongoClient

response = requests.get(
    "https://api.gbif.org/v1/occurrence/search",
    params={
        "kingdom": "Plantae",
        "hasCoordinate": "true",
        "limit": 500
    }
)
results = response.json()["results"]
print(results[0])

client = MongoClient("mongodb+srv://stringbot:u2ZG9kM5q8L0WaNW@plantmap.ipx3g1d.mongodb.net/")
db = client["plantmap"]
detections = db["detections"]

for r in results:
    # Only insert if coordinates are valid
    lon = r.get("decimalLongitude")
    lat = r.get("decimalLatitude")
    species = r.get("species")
    try:
        lon = float(lon)
        lat = float(lat)
    except (TypeError, ValueError):
        print(f"Invalid coordinates for result: {r}")
        continue
    if -90 <= lon <= 90 and -90 <= lat <= 90:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": {
                "alert": None,
                "favorite": None,
                "fileName": None,
                "weather": None,
                "plant": {
                    "query": None,
                    "predictedOrgans": None,
                    "language": None,
                    "preferedReferential": None,
                    "bestMatch": None,
                    "results": None,
                    "gbif": None,
                    "powo": None,
                    "iucn": None
                },
                "gemini_tips": None
            }
        }
        detections.insert_one(feature)
    else:
        print(f"Invalid coordinates for result: {r}")

# features = []
# for r in results:
#     features.append({
#         "type": "Feature",
#         "geometry": {
#             "type": "Point",
#             "coordinates": [r["decimalLongitude"], r["decimalLatitude"]]
#         },
#         "properties": {
#             "scientificName": r.get("scientificName"),
#             "family": r.get("family"),
#             "genus": r.get("genus"),
#             "country": r.get("country"),
#             "datasetKey": r.get("datasetKey")
#         }
#     })

# for feature in features:
#     client = MongoClient("mongodb+srv://stringbot:u2ZG9kM5q8L0WaNW@plantmap.ipx3g1d.mongodb.net/")
#     db = client["plantmap"]
#     detections = db["detections"]
#     # Check for valid coordinates
#     coords = feature["geometry"]["coordinates"]
#     if (
#         coords and
#         isinstance(coords[0], (int, float)) and
#         isinstance(coords[1], (int, float)) and
#         -180 <= coords[0] <= 180 and
#         -90 <= coords[1] <= 90
#     ):
#         feature.pop("_id", None)
#         detections.insert_one(feature)
#     else:
#         print(f"Invalid coordinates for feature: {feature}")

# # with open("plants.geojson", "w") as f:
# #     json.dump({ "type": "FeatureCollection", "features": features }, f, indent=2)