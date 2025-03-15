import axios from 'axios';
import { apiKey } from '../constants';

const forecastEndpoint = (params) => 
    `https://api.openweathermap.org/data/2.5/forecast?q=${params.city}&appid=${apiKey}&units=metric&lang=fr`;

export const getWeather = async (params) => {
    try {
        const response = await axios.get(forecastEndpoint(params));
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de la météo :', error);
        return null;
    }
};