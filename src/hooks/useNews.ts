"use client";

// ニュースデータをフェッチするカスタムフック
// /api/news エンドポイントからデータを取得し、ローディング・エラー状態を管理する

import { useState, useEffect } from "react";
import type { NewsArticle, CharacterId, GenreId } from "@/types/news";

interface UseNewsOptions {
  character: CharacterId;
  genre?: GenreId;
  date?: string;
}

interface UseNewsResult {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  // 手動でリフェッチするトリガー
  refetch: () => void;
}

export function useNews({
  character,
  genre,
  date,
}: UseNewsOptions): UseNewsResult {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTick, setFetchTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({ character });
      if (genre) params.set("genre", genre);
      if (date) params.set("date", date);

      try {
        const res = await fetch(`/api/news?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }

        if (!cancelled) {
          setArticles(json.articles ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "データ取得に失敗しました");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchNews();
    return () => {
      cancelled = true;
    };
  // character / genre / date / fetchTick のいずれかが変わったら再取得する
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, genre, date, fetchTick]);

  return {
    articles,
    isLoading,
    error,
    refetch: () => setFetchTick((t) => t + 1),
  };
}
