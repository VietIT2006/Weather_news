import React, { useEffect, useState } from "react";

interface Props {
  cityId: number | null;
}

function WeatherLocation({ cityId }: Props) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const apiKey = import.meta.env.VITE_APP_ID;

  useEffect(() => {
    if (!cityId) return;

    const URL = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}&units=metric`;

    fetch(URL)
      .then((res) => res.json())
      .then((data) => setWeatherData(data))
      .catch((err) => console.error("Lỗi khi lấy thời tiết:", err));
  }, [cityId]);

  return (
    <div>
      {weatherData ? (
        <div>
          <h2>Thời tiết tại {weatherData.name}</h2>
          <p>Nhiệt độ: {weatherData.main.temp}°C</p>
          <p>Trạng thái: {weatherData.weather[0].description}</p>
        </div>
      ) : (
        <p>Đang tải dữ liệu thời tiết...</p>
      )}
    </div>
  );
}

export default WeatherLocation;
