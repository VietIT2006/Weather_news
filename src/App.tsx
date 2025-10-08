import React, { useState } from "react";
import MapComponent from "../getData/map/MapComponent";
import WeatherLocation from "../src/whearther/WeatherLocation";

function App() {
  const [cityId, setCityId] = useState<number | null>(null);

  return (
    <div>
      <h1>Thông tin thời tiết</h1>
      <MapComponent lat={10.762622} lon={106.660172} onCityIdChange={setCityId} />
      <WeatherLocation cityId={cityId} />
    </div>
  );
}

export default App;
