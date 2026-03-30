// ニュース記事の型定義
// Blob に保存・取得するデータ構造の正規化のため、ここで一元管理する

export type GenreId =
  | "technology"
  | "business"
  | "domestic"
  | "entertainment"
  | "sports";

// キャラクターIDごとの要約テキスト
// 新キャラを追加する場合は config/characters.ts と合わせてここを拡張する
export type CharacterId = "analyst" | "friendly" | "energetic";

export type Summaries = Record<CharacterId, string>;

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  source_url: string;
  genre: GenreId;
  summaries: Summaries;
}

// Blob に保存するトップレベルのデータ構造
export interface DailyNews {
  date: string; // YYYY-MM-DD
  generated_at: string; // ISO 8601
  articles: NewsArticle[];
}

// RSS フェッチャーが返す生のアイテム（要約前）
export interface RawNewsItem {
  title: string;
  source: string;
  source_url: string;
  genre: GenreId;
  // RSS から取得した本文・説明（要約の入力に使う）
  description: string;
}
