import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 1 });
  }, [lat, lng, map]);
  return null;
}

function ClickMarker({ position, onMove }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMove(lat, lng);
    },
  });
  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          onMove(lat, lng);
        },
      }}
    />
  ) : null;
}

export default function LocationPicker({ value, onChange, error }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [marker, setMarker] = useState(null);
  const [reverseLoading, setReverseLoading] = useState(false);
  const debounceRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    if (!marker) return;
    const { lat, lng } = marker;
    if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return;
    setReverseLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    )
      .then((r) => r.json())
      .then((data) => {
        const name = data.display_name || query;
        setQuery(name);
        onChange(name);
      })
      .catch(() => {})
      .finally(() => setReverseLoading(false));
  }, [marker?.lat, marker?.lng]);

  const search = useCallback((q) => {
    if (!q || q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    fetch(
      `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`
    )
      .then((r) => r.json())
      .then((data) => {
        setSuggestions(data || []);
        setShowSuggestions(data?.length > 0);
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const selectSuggestion = (item) => {
    const name = item.display_name;
    setQuery(name);
    onChange(name);
    setShowSuggestions(false);
    setSuggestions([]);
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setMarker({ lat, lng });
  };

  const handleMapClick = (lat, lng) => {
    setMarker({ lat, lng });
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border ${
    error
      ? "border-red-400 bg-red-50"
      : "border-gray-200 bg-white"
  } text-sm text-gray-800 placeholder-gray-400 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200`;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Location
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search for a location..."
          className={inputClass}
        />
        {showSuggestions && (
          <ul
            ref={suggestionsRef}
            className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto"
          >
            {suggestions.map((item, i) => (
              <li
                key={i}
                onMouseDown={() => selectSuggestion(item)}
                className="px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium">
                  {item.name || item.display_name?.split(",")[0]}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">
                  {item.display_name}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200" style={{ height: 250, zIndex: 0 }}>
        <MapContainer
          center={marker || [11.5564, 104.9282]}
          zoom={marker ? 15 : 12}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickMarker position={marker} onMove={handleMapClick} />
          {marker && <FlyTo lat={marker.lat} lng={marker.lng} />}
        </MapContainer>
      </div>
      {reverseLoading && (
        <p className="mt-1 text-xs text-gray-400">Getting location name...</p>
      )}
      <p className="mt-1 text-xs text-gray-400">
        Click on the map or drag the marker to set location
      </p>
    </div>
  );
}
