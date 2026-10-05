/**
 * Mirrors evaluations/weather_api.py::fetch_weather_data.
 * Returns the raw OpenWeather /forecast JSON, or null if the request
 * failed or no API key is configured (caller tolerates this).
 */
async function fetchWeatherData(latitude, longitude) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
  url.searchParams.set("lat", latitude);
  url.searchParams.set("lon", longitude);
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");

  try {
    const response = await fetch(url.toString());
    return await response.json();
  } catch (err) {
    return null;
  }
}

module.exports = { fetchWeatherData };
