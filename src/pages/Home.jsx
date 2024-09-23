import { useState, useEffect } from "react";
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import CSS du carrousel

function Home() {
  const [weatherData, setWeatherData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const apiKey = "8df23e1645deb051646102affe75b498";
  const cities = ["Paris", "Lyon", "Chalon-sur-Saône"];

  const getWeatherData = async () => {
    try {
      const responses = await Promise.all(
        cities.map((city) =>
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`
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
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`
      );
      setForecastData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des prévisions :", error);
    }
  };

  useEffect(() => {
    getWeatherData();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      getForecastData(selectedCity.name);
    }
  }, [selectedCity]);

  const getColor = (temp) => {
    if (temp < 0) return "#0ff"; // Cyan
    if (temp < 8) return "#00f"; // Bleu
    if (temp < 15) return "#0f0"; // Vert
    if (temp < 20) return "#ff0"; // Jaune
    if (temp < 25) return "#ffa500"; // Orange
    if (temp < 30) return "#f00"; // Rouge
    return "#800080"; // Violet
  };
  const groupedForecasts = forecastData
    ? forecastData.list.reduce((acc, entry) => {
        const date = new Date(entry.dt * 1000).toLocaleDateString("fr-FR");
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
          placeholder="Entrez le nom d’une ville pour obtenir la météo"
          className="input-style"
        />
      </div>
      <div className="cards-container">
        {weatherData.map((data, index) => (
          <div
            key={index}
            className="weather-card"
            onClick={() => setSelectedCity(data)}
          >
            <h2 className="city-name">{data.name}</h2>
            <p style={{ color: getColor(data.main.temp) }}>
              {Math.round(data.main.temp)} °C
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
            infiniteLoop
          >
            {groupedByThreeDays.map((group, index) => (
              <div key={index} className="prevision-days-group">
                {group.map(([date, entries]) => {
                  const tempAvg = Math.round(
                    entries.reduce((sum, entry) => sum + entry.main.temp, 0) /
                      entries.length
                  );
                  const weatherIcon = entries[0].weather[0].icon;
                  const description = entries[0].weather[0].description;

                  return (
                    <div key={date} className="prevision-days-container">
                      <h3>{date}</h3>
                      <p style={{ color: getColor(tempAvg) }}>{tempAvg} °C</p>
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
    </div>
  );
}

export default Home;
