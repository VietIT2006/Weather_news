import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import MapComponent from "../getData/map/MapComponent";
import WeatherLocation from "./wearther/WeatherLocation";
import PageNews from "./news/PageNews";
import ArticleDetail from "./news/ArticleDetail";

function App() {
  const [cityId, setCityId] = useState<number | null>(null);

  return (
    <Routes>
      {/* Trang chủ: hiển thị bản đồ, thời tiết và danh sách bài viết */}
      <Route
        path="/"
        element={
          <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-blue-700 mb-6">🌤 Thông tin thời tiết</h1>
            <MapComponent onCityIdChange={setCityId} />
            <WeatherLocation cityId={cityId} />
            <hr className="my-6" />
            <PageNews />
          </div>
        }
      />

      {/* Trang chi tiết bài viết */}
      <Route path="/article/:id" element={<ArticleDetail />} />
    </Routes>
  );
}

export default App;
