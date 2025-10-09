import React, { useState } from "react";
import MapComponent from "../getData/map/MapComponent";
import WeatherLocation from "../src/whearther/WeatherLocation";
import NewsFromLocation from "../getData/getNews/NewsFromLocation";
import PageNews from "./news/pageNews";

function App() {
  const [cityId, setCityId] = useState<number | null>(null);

  return (
    <div>
      <h1>Thông tin thời tiết</h1>
      <MapComponent onCityIdChange={setCityId} />
      <WeatherLocation cityId={cityId} />
      <PageNews/>
    </div>
  );
}

export default App;
