require('dotenv').config();
const axios = require('axios');

const COLLECT_API_KEY = process.env.COLLECT_API_KEY;

export const fetchWeatherData = async (city) => {
  try {
    const response = await axios.get(
      `https://api.collectapi.com/weather/getWeather?data.lang=tr&data.city=${city}`,
      {
        headers: {
          'content-type': 'application/json',
          authorization: `apikey ${COLLECT_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};
