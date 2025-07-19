from pprint import pprint
import json
import requests
import os
from dotenv import load_dotenv
load_dotenv()  # take environment variables


"""get plant
format file paths in a list"""
def get_plantnet_data(file_paths):
    plantnet_key = os.getenv("PLANTNET_API_KEY")   # Your API key here
    PROJECT = "all"; # You can choose a more specific flora, see: /docs/newfloras
    api_endpoint = f"https://my-api.plantnet.org/v2/identify/{PROJECT}?api-key={plantnet_key}"

    data = { 'organs': ['leaf'] }

    files = [
    ('images', (image_path, open(image_path, 'rb'))) for image_path in file_paths
    ]

    req = requests.Request('POST', url=api_endpoint, files=files, data=data)
    prepared = req.prepare()

    s = requests.Session()
    response = s.send(prepared)
    json_result = json.loads(response.text)

    return json_result

"""get weather data"""
def get_weather_data(lat, lon):
    weather_key = os.getenv("WEATHER_API_KEY")  # Your OpenWeatherMap API key here
    api_endpoint = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={weather_key}"
    return requests.get(api_endpoint).json()

if __name__ == "__main__":
    file_paths = [r"C:\Users\yroeh\Documents\Github\plant-map\server\test_img.jpg"]
    plant_data = get_plantnet_data(file_paths)
    pprint(plant_data)
    weather_data = get_weather_data(43.7705, -79.5022)
    pprint(weather_data)