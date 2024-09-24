import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import citiesData from "../data/cities.json"; // Importation des données des villes

const { BaseLayer, Overlay } = LayersControl;
const apiKey = import.meta.env.VITE_REACT_APP_WEATHERBIT_API_KEY;

export default function MapInteractive() {
  const position = [46.6034, 1.8883];
  const [weatherData, setWeatherData] = useState({});
  const [showCities, setShowCities] = useState(
    citiesData.cities.reduce((acc, city) => {
      acc[city.name] = true; // Initialisez chaque ville à "visible"
      return acc;
    }, {})
  );

  useEffect(() => {
    const fetchWeatherData = async () => {
      const newWeatherData = {};

      // Récupération des données météo pour chaque ville
      for (const city of citiesData.cities) {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${apiKey}&units=metric`
          );
          newWeatherData[city.name] = response.data.main.temp;
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des données pour ${city.name}:`,
            error
          );
        }
      }

      setWeatherData(newWeatherData);
    };

    fetchWeatherData();
  }, []);

  const toggleAllCitiesVisibility = (isChecked) => {
    setShowCities(
      citiesData.cities.reduce((acc, city) => {
        acc[city.name] = isChecked; // Met à jour chaque ville selon la case principale
        return acc;
      }, {})
    );
  };

  const allCitiesChecked = Object.values(showCities).every(
    (visible) => visible
  );

  return (
    <div className="map-interactive-container">
      <MapContainer center={position} zoom={5} className="map-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <LayersControl position="topright">
          <BaseLayer checked name="Carte de Base">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </BaseLayer>

          <Overlay checked name="Température">
            <TileLayer
              url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`}
              opacity={1}
            />
          </Overlay>
          <Overlay name="Nuages">
            <TileLayer
              url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`}
              opacity={1}
            />
          </Overlay>
        </LayersControl>

        {/* Ajoutez les marqueurs pour chaque ville visible */}
        {citiesData.cities.map(
          (city) =>
            showCities[city.name] && (
              <Marker key={city.name} position={city.coords}>
                <Popup>
                  <strong>{city.name}</strong>
                  <br />
                  Température:{" "}
                  {weatherData[city.name]
                    ? `${weatherData[city.name]} °C`
                    : "Chargement..."}
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
      <div className="city-controls">
        <label>
          <input
            type="checkbox"
            checked={allCitiesChecked}
            onChange={(e) => toggleAllCitiesVisibility(e.target.checked)}
          />
          Afficher/Tous masquer les villes
        </label>
      </div>
    </div>
  );
}
