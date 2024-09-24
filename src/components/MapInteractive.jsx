import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const { BaseLayer, Overlay } = LayersControl;

export default function MapInteractive() {
  const position = [46.6034, 1.8883];

  const apiKey = import.meta.env.VITE_REACT_APP_WEATHERBIT_API_KEY;

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
              opacity={0.6}
            />
          </Overlay>
          <Overlay name="Nuages">
            <TileLayer
              url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`}
              opacity={0.6}
            />
          </Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}
