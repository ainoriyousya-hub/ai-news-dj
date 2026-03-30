// RSSフィード定義
// フィードを追加・変更する場合はこのファイルのみ編集する
// ※ URL は実装前に実際にアクセスして有効性を確認すること

import type { GenreId } from "@/types/news";

export interface RssFeed {
  id: string;
  label: string;
  url: string;
  genre: GenreId;
  // 1ジャンルから取得する最大記事数（多すぎると API コストが増える）
  maxItems: number;
}

export const RSS_FEEDS: RssFeed[] = [
  // --- テクノロジー・AI ---
  {
    id: "itmedia-ai",
    label: "ITmedia AI+",
    url: "https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml",
    genre: "technology",
    maxItems: 3,
  },
  {
    id: "techcrunch-jp",
    label: "TechCrunch Japan",
    // TechCrunch JP は 2022 年に閉鎖のため、英語版をフォールバックとして使用
    // 将来的に日本語ソースへ差し替え推奨
    url: "https://techcrunch.com/feed/",
    genre: "technology",
    maxItems: 2,
  },

  // --- ビジネス・経済 ---
  {
    id: "nhk-business",
    label: "NHK 経済",
    url: "https://www.nhk.or.jp/rss/news/cat3.xml",
    genre: "business",
    maxItems: 3,
  },

  // --- 国内ニュース ---
  {
    id: "nhk-domestic",
    label: "NHK 主要ニュース",
    url: "https://www.nhk.or.jp/rss/news/cat0.xml",
    genre: "domestic",
    maxItems: 3,
  },

  // --- エンタメ ---
  {
    id: "nhk-culture",
    label: "NHK 文化・エンタメ",
    url: "https://www.nhk.or.jp/rss/news/cat2.xml",
    genre: "entertainment",
    maxItems: 2,
  },

  // --- スポーツ ---
  {
    id: "nhk-sports",
    label: "NHK スポーツ",
    url: "https://www.nhk.or.jp/rss/news/cat7.xml",
    genre: "sports",
    maxItems: 2,
  },
];

// ジャンルでフィルタするユーティリティ
export function getFeedsByGenre(genre: GenreId): RssFeed[] {
  return RSS_FEEDS.filter((f) => f.genre === genre);
}
