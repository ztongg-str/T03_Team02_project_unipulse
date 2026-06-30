import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const parseCoords = (str) => {
    if (!str) return null;
    const parts = str.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return null;
  };

  const center = parseCoords(value) || { lat: 14.5995, lng: 120.9842 };
  const [position, setPosition] = useState(parseCoords(value));

  const handleMapClick = useCallback(
    ({ lat, lng }) => {
      const str = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      setPosition({ lat, lng });
      onChange(str);
    },
    [onChange]
  );

  return (
    <div>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "250px", width: "100%", borderRadius: "12px", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={handleMapClick} />
        {position && <Marker position={[position.lat, position.lng]} />}
      </MapContainer>
      <p className="mt-1 text-xs text-gray-400">
        Click on the map to set the location
      </p>
    </div>
  );
}
