"use client";

import { GENRE_MAP } from "@/config/genres";
import { CHARACTER_MAP } from "@/config/characters";
import type { NewsArticle, CharacterId } from "@/types/news";

interface Props {
  article: NewsArticle;
  character: CharacterId;
  onPlay?: () => void;
  isPlaying?: boolean;
}

export function NewsCard({ article, character, onPlay, isPlaying }: Props) {
  const genre = GENRE_MAP[article.genre];
  const char = CHARACTER_MAP[character];
  const summary = article.summaries[character];

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      {/* ジャンルバッジ */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
          {genre?.icon} {genre?.label ?? article.genre}
        </span>
        <span className="text-xs text-gray-600">{article.source}</span>
      </div>

      {/* 記事タイトル */}
      <h2 className="text-sm font-semibold text-gray-200 leading-snug">
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white hover:underline"
        >
          {article.title}
        </a>
      </h2>

      {/* キャラクター要約 */}
      <div className="flex gap-2 items-start">
        <span className="text-xl shrink-0 mt-0.5">{char?.icon ?? "🎙"}</span>
        <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
      </div>

      {/* 個別再生ボタン */}
      {onPlay && (
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onPlay}
            className={[
              "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors",
              isPlaying
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600",
            ].join(" ")}
          >
            {isPlaying ? (
              <>
                <span className="animate-pulse">●</span>
                <span>読み上げ中</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>この記事を読み上げ</span>
              </>
            )}
          </button>

          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            🔗 元記事
          </a>
        </div>
      )}
    </article>
  );
}
