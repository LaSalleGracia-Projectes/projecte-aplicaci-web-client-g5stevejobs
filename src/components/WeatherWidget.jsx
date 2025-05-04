"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Barcelona coordinates
        const lat = 41.3851;
        const lon = 2.1734;
        
        // Fetch current weather data from Open-Meteo API
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, []);

  // Function to interpret weather code
  const getWeatherDescription = (code) => {
    // Weather code mapping based on WMO codes used by Open-Meteo
    const weatherCodes = {
      0: { icon: '☀️', description: t.clearSky || 'Cielo despejado' },
      1: { icon: '🌤️', description: t.mainlyClear || 'Principalmente despejado' },
      2: { icon: '⛅', description: t.partlyCloudy || 'Parcialmente nublado' },
      3: { icon: '☁️', description: t.overcast || 'Nublado' },
      45: { icon: '🌫️', description: t.fog || 'Niebla' },
      48: { icon: '🌫️', description: t.depositingRimeFog || 'Niebla con escarcha' },
      51: { icon: '🌦️', description: t.lightDrizzle || 'Llovizna ligera' },
      53: { icon: '🌦️', description: t.moderateDrizzle || 'Llovizna moderada' },
      55: { icon: '🌧️', description: t.denseDrizzle || 'Llovizna densa' },
      61: { icon: '🌧️', description: t.slightRain || 'Lluvia ligera' },
      63: { icon: '🌧️', description: t.moderateRain || 'Lluvia moderada' },
      65: { icon: '🌧️', description: t.heavyRain || 'Lluvia intensa' },
      71: { icon: '🌨️', description: t.slightSnow || 'Nevada ligera' },
      73: { icon: '🌨️', description: t.moderateSnow || 'Nevada moderada' },
      75: { icon: '❄️', description: t.heavySnow || 'Nevada intensa' },
      80: { icon: '🌦️', description: t.slightShowers || 'Chubascos ligeros' },
      81: { icon: '🌧️', description: t.moderateShowers || 'Chubascos moderados' },
      82: { icon: '⛈️', description: t.violentShowers || 'Chubascos violentos' },
      95: { icon: '⛈️', description: t.thunderstorm || 'Tormenta' },
      96: { icon: '⛈️', description: t.thunderstormWithHail || 'Tormenta con granizo' },
      99: { icon: '⛈️', description: t.thunderstormWithHeavyHail || 'Tormenta con granizo fuerte' }
    };
    
    return weatherCodes[code] || { icon: '❓', description: t.unknown || 'Desconocido' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {t.errorLoadingWeather || 'Error al cargar el clima'}: {error}
      </div>
    );
  }

  if (!weatherData || !weatherData.current) {
    return (
      <div className="text-center p-4">
        {t.noWeatherData || 'No hay datos de clima disponibles'}
      </div>
    );
  }

  const { current } = weatherData;
  const weather = getWeatherDescription(current.weather_code);

  return (
    <div className="bg-gray-700 rounded-lg p-4 shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <span className="text-5xl mr-4">{weather.icon}</span>
          <div>
            <p className="text-2xl font-bold">{current.temperature_2m}°C</p>
            <p className="text-sm text-gray-300">{weather.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">{t.feelsLike || 'Sensación'}: </span>
            <span>{current.apparent_temperature}°C</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">{t.humidity || 'Humedad'}: </span>
            <span>{current.relative_humidity_2m}%</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">{t.wind || 'Viento'}: </span>
            <span>{current.wind_speed_10m} km/h</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">{t.precipitation || 'Precipitación'}: </span>
            <span>{current.precipitation} mm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget; 