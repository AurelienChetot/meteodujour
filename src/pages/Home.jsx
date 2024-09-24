import { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import axios from "axios";

import MapInteractive from "../components/MapInteractive";

function Home() {
  const [weatherData, setWeatherData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;

  const getInitialCities = () => {
    const savedCities = JSON.parse(localStorage.getItem("favoriteCities"));
    return savedCities
      ? savedCities
      : [
          { name: "Lyon", lat: 45.764043, lon: 4.835659, postalCode: "69000" },
          { name: "Paris", lat: 48.8566, lon: 2.3522, postalCode: "75000" },
          {
            name: "Chalon-sur-Saône",
            lat: 46.783329,
            lon: 4.85,
            postalCode: "71100",
          },
        ];
  };

  const [cities, setCities] = useState(getInitialCities());

  const getWeatherData = async () => {
    try {
      const responses = await Promise.all(
        cities.map((city) =>
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${apiKey}&units=metric&lang=fr`
          )
        )
      );
      setWeatherData(responses.map((response) => response.data));
      setSelectedCity(responses[0].data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données météo :",
        error
      );
    }
  };

  const getForecastData = async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city.name}&appid=${apiKey}&units=metric&lang=fr`
      );
      setForecastData(response.data);
      setSelectedCity((prev) => ({
        ...prev,
        timezone: response.data.city.timezone,
      })); // Ajout du fuseau horaire
    } catch (error) {
      console.error("Erreur lors de la récupération des prévisions :", error);
    }
  };

  const getCitySuggestions = async (query) => {
    if (!query) {
      setCitySuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${apiKey}&units=metric&lang=fr`
      );
      const suggestions = await Promise.all(
        response.data.list.map(async (city) => {
          const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${apiKey}&units=metric&lang=fr`
          );
          return {
            ...city,
            currentTemp: Math.round(weatherResponse.data.main.temp),
            weatherDescription: weatherResponse.data.weather[0].description,
          };
        })
      );
      setCitySuggestions(suggestions);
    } catch (error) {
      console.error("Erreur lors de la récupération des villes :", error);
    }
  };

  useEffect(() => {
    getWeatherData();
  }, [cities]);

  useEffect(() => {
    if (selectedCity) {
      getForecastData(selectedCity);
    }
  }, [selectedCity]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    getCitySuggestions(e.target.value);
  };

  const handleCitySelect = (city) => {
    const newCities = [...cities];
    if (newCities.length >= 3) {
      newCities.shift();
    }
    newCities.push({
      name: city.name,
      country: city.sys.country,
      postalCode: city.postalCode,
    });
    setCities(newCities);
    setInputValue(`${city.name}, ${city.sys.country}`);
    setCitySuggestions([]);
    localStorage.setItem("favoriteCities", JSON.stringify(newCities));
  };

  const handleRemoveCity = (cityToRemove) => {
    const newCities = cities.filter((city) => city.name !== cityToRemove.name);
    setCities(newCities);
    localStorage.setItem("favoriteCities", JSON.stringify(newCities));
  };

  const getColor = (temp) => {
    if (temp < 0) return "#0ff"; // Cyan
    if (temp < 8) return "#00f"; // Bleu
    if (temp < 15) return "#0f0"; // Vert
    if (temp < 20) return "#ff0"; // Jaune
    if (temp < 28) return "#ffa500"; // Orange
    if (temp < 32) return "#f00"; // Rouge
    return "#800080"; // Violet
  };

  const groupedForecasts = forecastData
    ? forecastData.list.reduce((acc, entry) => {
        const date = new Date(
          (entry.dt + forecastData.city.timezone) * 1000
        ).toLocaleDateString("fr-FR");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(entry);
        return acc;
      }, {})
    : {};

  const groupedByThreeDays = Object.entries(groupedForecasts).reduce(
    (acc, curr, index) => {
      if (index % 2 === 0) acc.push([]);
      acc[acc.length - 1].push(curr);
      return acc;
    },
    []
  );

  return (
    <div className="home-container">
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Entrez le nom d’une ville pour obtenir la météo"
          className="input-style"
        />

        {citySuggestions.length > 0 && (
          <ul className="suggestions-list">
            {citySuggestions.slice(0, 5).map((city) => (
              <li
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className="suggestion-item"
              >
                <strong>{city.name}</strong> <em>({city.sys.country})</em>
                <p>
                  Temp: {city.currentTemp} °C - {city.weatherDescription}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="cards-container">
        {weatherData.map((data, index) => (
          <div
            key={index}
            className="weather-card"
            onClick={() => setSelectedCity(data)}
          >
            <FontAwesomeIcon
              className="icone-empty-storage"
              icon={faTimes}
              size="1x"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveCity(data);
              }}
            />
            <h2 className="city-name">{data.name}</h2>
            <p style={{ color: getColor(data.main.temp) }}>
              {Math.floor(data.main.temp)} °C
            </p>
            <img
              className="icon-weather"
              src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
              alt={data.weather[0].description}
            />
            <p className="text-sky">{data.weather[0].description}</p>
          </div>
        ))}
      </div>
      {forecastData && (
        <div className="prevision-container">
          <p className="text-prevision">
            Prévisions sur 5 jours pour{" "}
            <span className="city-style">{selectedCity.name}</span> :
          </p>
          <Carousel
            showArrows={true}
            showStatus={false}
            showIndicators={false}
            showThumbs={false}
            infiniteLoop
          >
            {groupedByThreeDays.map((group, index) => (
              <div key={index} className="prevision-days-group">
                {group.map(([date, entries]) => {
                  const temps = entries.map((entry) => entry.main.temp);
                  const tempMax = Math.round(Math.max(...temps));
                  const tempMin = Math.floor(Math.min(...temps));
                  const weatherIcon = entries[0].weather[0].icon;
                  const description = entries[0].weather[0].description;

                  return (
                    <div key={date} className="prevision-days-container">
                      <h3>{date}</h3>
                      <p style={{ color: getColor(tempMax) }}>
                        <span className="style-max-min">Max:</span> {tempMax} °C
                      </p>
                      <p style={{ color: getColor(tempMin) }}>
                        <span className="style-max-min">Min:</span> {tempMin} °C
                      </p>
                      <img
                        className="icon-prevision"
                        src={`http://openweathermap.org/img/wn/${weatherIcon}@2x.png`}
                        alt={description}
                      />
                      <p className="text-sky">{description}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </Carousel>
        </div>
      )}
      <MapInteractive />
    </div>
  );
}

export default Home;
