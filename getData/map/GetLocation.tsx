import { useEffect, useState } from "react";
import MapComponent from "./MapComponent";

function GetLocation() {
  const [location, setLocation] = useState({ lat: null, lon: null });
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Lỗi khi lấy vị trí:", err.message);
        }
      );
    }
  }, []);

  return (
    <div>
      <h3>Vị trí của bạn:</h3>
      <p>Vĩ độ: {location.lat}</p>
      <p>Kinh độ: {location.lon}</p>
      {location.lat && location.lon && (
        <MapComponent lat={location.lat} lon={location.lon} />
      )}
    </div>
  );
}

export default GetLocation;
