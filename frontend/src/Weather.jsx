import React, { useState, useEffect } from "react";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({
    lat: 43.772915,
    lon: -79.499285,
  });

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/weather?lat=${lat}&lon=${lon}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather on component mount
  useEffect(() => {
    fetchWeather(coordinates.lat, coordinates.lon);
  }, []);

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setCoordinates((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(coordinates.lat, coordinates.lon);
  };

  if (loading) return <div>Loading weather data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="weather-component">
      <h2>Weather Information</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Latitude:
            <input
              type="number"
              step="any"
              name="lat"
              value={coordinates.lat}
              onChange={handleCoordinateChange}
            />
          </label>
        </div>
        <div>
          <label>
            Longitude:
            <input
              type="number"
              step="any"
              name="lon"
              value={coordinates.lon}
              onChange={handleCoordinateChange}
            />
          </label>
        </div>
        <button type="submit">Get Weather</button>
      </form>

      {weatherData && (
        <div className="weather-data">
          <h3>Current Weather</h3>
          <p>
            <strong>Location:</strong> {weatherData.name}
          </p>
          <p>
            <strong>Temperature:</strong> {Math.round(weatherData.main.temp)}°C
          </p>
          <p>
            <strong>Feels like:</strong>{" "}
            {Math.round(weatherData.main.feels_like)}°C
          </p>
          <p>
            <strong>Humidity:</strong> {weatherData.main.humidity}%
          </p>
          <p>
            <strong>Conditions:</strong> {weatherData.weather[0].description}
          </p>
          <p>
            <strong>Wind Speed:</strong> {weatherData.wind.speed} m/s
          </p>
        </div>
      )}
    </div>
  );
};

export default Weather;
