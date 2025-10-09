import React, { useEffect, useState } from "react";
import axios from "axios";

interface Article {
  url: string;
  title: string;
  published: string;
  author: string;
  content: string;
}

export default function ArticleView() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Gọi API GET từ server local (VD: Flask, Node, Django...)
    axios
      .get<Article>("http://localhost:8000/0")
      .then((res) => {
        setArticle(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API:", err);
        setError("Không thể tải dữ liệu từ server");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">⏳ Đang tải dữ liệu...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!article) return <p className="text-center mt-10">Không có dữ liệu.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">{article.title}</h1>

      <p className="text-sm text-gray-500">
        👤 {article.author} &nbsp; | &nbsp; 📅 {article.published}
      </p>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline mt-2 inline-block"
      >
        🔗 Xem bài gốc
      </a>

      <hr className="my-4" />

      <div className="whitespace-pre-line leading-relaxed text-gray-800">
        {article.content}
      </div>
    </div>
  );
}
