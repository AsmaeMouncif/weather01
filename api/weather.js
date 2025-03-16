import axios from 'axios';
import { apiKey } from '../constants';

const forecastEndpoint = (params) => 
  `http://api.openweathermap.org/data/2.5/forecast?q=${params.cityName}&cnt=${params.days}&appid=${params.apiKey}`;

const locationsEndpoint = (params) =>
  `http://api.openweathermap.org/data/2.5/find?q=${params.cityName}&appid=${params.apiKey}`;

const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (err) {
        console.log('error:', err);
        return null;
    }
};

export const fetchWeatherForecast = (params) => {
    return apiCall(forecastEndpoint(params));
};

export const fetchLocations = (params) => {
    return apiCall(locationsEndpoint(params));
};