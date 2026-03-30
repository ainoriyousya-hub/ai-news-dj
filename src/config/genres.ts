// ジャンル定義
// ジャンルを追加・変更する場合はこのファイルのみ編集する

import type { GenreId } from "@/types/news";

export interface GenreDefinition {
  id: GenreId;
  label: string;
  // UI 表示用アイコン（絵文字）
  icon: string;
}

export const GENRES: GenreDefinition[] = [
  { id: "technology", label: "テクノロジー・AI", icon: "💻" },
  { id: "business", label: "ビジネス・経済", icon: "📈" },
  { id: "domestic", label: "国内ニュース", icon: "🗾" },
  { id: "entertainment", label: "エンタメ", icon: "🎬" },
  { id: "sports", label: "スポーツ", icon: "⚽" },
];

// ID から定義を引くユーティリティ
export const GENRE_MAP = Object.fromEntries(
  GENRES.map((g) => [g.id, g])
) as Record<GenreId, GenreDefinition>;
