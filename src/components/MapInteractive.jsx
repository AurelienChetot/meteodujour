import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import citiesData from "../data/cities.json";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const { BaseLayer, Overlay } = LayersControl;
const apiKey = import.meta.env.VITE_REACT_APP_WEATHERBIT_API_KEY;

export default function MapInteractive() {
  const position = [46.6034, 1.8883];
  const [weatherData, setWeatherData] = useState({});
  const [showCities, setShowCities] = useState(
    citiesData.cities.reduce((acc, city) => {
      acc[city.name] = true;
      return acc;
    }, {})
  );

  useEffect(() => {
    const fetchWeatherData = async () => {
      const newWeatherData = {};

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
        acc[city.name] = isChecked;
        return acc;
      }, {})
    );
  };

  const allCitiesChecked = Object.values(showCities).every(
    (visible) => visible
  );

  return (
    <div className="map-interactive-container">
      <h1>Carte interactive :</h1>
      <MapContainer center={position} zoom={5} className="map-container">
        <LayersControl position="topright">
          <BaseLayer checked name="Carte de Base">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </BaseLayer>

          <BaseLayer name="Vue Satellite (Esri)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/en-us/home">Esri</a>'
            />
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
          <Overlay name="Précipitations">
            <TileLayer
              url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`}
              opacity={1}
            />
          </Overlay>
        </LayersControl>
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
          Afficher/Masquer les villes
        </label>
      </div>
    </div>
  );
}
