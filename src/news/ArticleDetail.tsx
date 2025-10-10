import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

interface Article {
  id: number;
  url: string;
  title: string;
  published: string;
  author: string;
  content: string;
}

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<Article>(`http://localhost:8000/articles/${id}`)
      .then((res) => {
        setArticle(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải bài viết:", err);
        setError("Không thể tải bài viết");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-center mt-10">⏳ Đang tải bài viết...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!article) return <p className="text-center mt-10">Không có dữ liệu bài viết.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">{article.title}</h1>
      <p className="text-sm text-gray-500 mb-2">
        👤 {article.author} | 📅 {article.published}
      </p>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline mb-4 inline-block"
      >
        🔗 Xem bài gốc
      </a>
      <hr className="my-4" />
      <div className="whitespace-pre-line leading-relaxed text-gray-800">
        {article.content}
      </div>
      <Link to="/" className="text-blue-600 underline mt-6 inline-block">
        ← Quay lại danh sách
      </Link>
    </div>
  );
}
