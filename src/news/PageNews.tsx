import { useEffect, useState } from "react";
import axios from "axios";
import PaginationPageNews from "./PaginationPageNews";
import { Link } from "react-router-dom";

interface Article {
  id: number;
  url: string;
  title: string;
  published: string;
  author: string;
  content: string;
}

export default function PageNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios
      .get<Article[]>("http://localhost:8000/articles")
      .then((res) => {
        setArticles(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API:", err);
        setError("Không thể tải dữ liệu từ server");
        setLoading(false);
      });
  }, []);

  const paginatedArticles = articles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">📰 Danh sách bài viết</h1>

      {loading && <p className="text-center">⏳ Đang tải dữ liệu...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading &&
        !error &&
        paginatedArticles.map((article) => (
          <div key={article.id} className="mb-4 border-b pb-2">
            <Link
              to={`/article/${article.id}`}
              className="text-lg font-semibold text-blue-600 hover:underline block"
            >
              {article.title}
            </Link>
          </div>
        ))}

      <PaginationPageNews
        currentPage={currentPage}
        totalPages={Math.ceil(articles.length / itemsPerPage)}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
