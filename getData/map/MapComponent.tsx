import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

interface Props {
  lat: number;
  lon: number;
  onCityIdChange: (id: number) => void;
}

function MapComponent({ lat, lon, onCityIdChange }: Props) {
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function fetchCityId() {
      try {
        const res1 = await axios.get("https://nominatim.openstreetmap.org/reverse", {
          params: { format: "json", lat, lon },
        });

        const cityName = res1.data.address.city || res1.data.address.town || res1.data.address.village || "Không xác định";
        setAddress(cityName);

        if (cityName !== "Không xác định") {
          const res2 = await axios.get("https://api.openweathermap.org/data/2.5/find", {
            params: {
              q: cityName,
              appid: import.meta.env.VITE_APP_ID,
            },
          });

          const cityId = res2.data.list[0]?.id;
          if (cityId) onCityIdChange(cityId);
        }
      } catch (error) {
        console.error("Lỗi khi lấy City ID:", error);
      }
    }

    fetchCityId();
  }, [lat, lon]);

  return (
    <MapContainer center={[lat, lon]} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lon]}>
        <Popup>{address || "Đang tải địa chỉ..."}</Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapComponent;
