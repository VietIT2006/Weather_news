import React, { useEffect, useState } from "react";
import { countryToLang, weatherTranslations } from "../../transalte/vi/translate";
import { countryNames } from "../../transalte/countryName/coutryName";


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

  const getTranslatedDescription = () => {
    const raw = weatherData?.weather[0]?.description?.toLowerCase();
    const countryCode = weatherData?.sys?.country || "US";
    const lang = countryToLang[countryCode] || "en";
    return weatherTranslations[raw]?.[lang] || capitalize(raw);
  };

  const capitalize = (text: string) => {
    if (!text) return "";
    return text
      .split(" ")
      .map((word) => word[0].toUpperCase() + word.substring(1))
      .join(" ");
  };

  return (
    <div>
      {weatherData ? (
        <div>
          <h2>
  Thời tiết tại {weatherData.name},{" "}
  {countryNames[weatherData.sys.country] || weatherData.sys.country}
</h2>

          <p>Nhiệt độ: {weatherData.main.temp}°C</p>
          <p>Trạng thái: {getTranslatedDescription()}</p>
        </div>
      ) : (
        <p>Đang tải dữ liệu thời tiết...</p>
      )}
    </div>
  );
}

export default WeatherLocation;
