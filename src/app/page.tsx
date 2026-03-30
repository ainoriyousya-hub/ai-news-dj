"use client";

import { useState } from "react";
import Link from "next/link";
import { CharacterSelector } from "@/components/CharacterSelector";
import { GenreFilter } from "@/components/GenreFilter";
import { NewsCard } from "@/components/NewsCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useSettings } from "@/hooks/useSettings";
import { useNews } from "@/hooks/useNews";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { CharacterId, GenreId } from "@/types/news";

export default function HomePage() {
  const { settings, updateSettings, hydrated } = useSettings();
  const [selectedGenre, setSelectedGenre] = useState<GenreId | undefined>(undefined);

  const character = settings.defaultCharacter;

  const { articles, isLoading, error, refetch } = useNews({
    character,
    genre: selectedGenre,
  });

  const player = useAudioPlayer();

  function handleCharacterChange(id: CharacterId) {
    // キャラ切替時に再生中なら停止する（別キャラの音声が混在するのを防ぐ）
    player.stop();
    updateSettings({ defaultCharacter: id });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙</span>
            <span className="font-bold text-lg tracking-tight">AI News DJ</span>
          </div>
          <Link
            href="/settings"
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-gray-800"
          >
            設定
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6 pb-24">
        {/* キャラクター選択 */}
        <section>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">DJ を選ぶ</p>
          {hydrated ? (
            <CharacterSelector selected={character} onChange={handleCharacterChange} />
          ) : (
            <div className="h-10 bg-gray-800 rounded-full w-48 animate-pulse" />
          )}
        </section>

        {/* ジャンルフィルター */}
        <section>
          <GenreFilter selected={selectedGenre} onChange={setSelectedGenre} />
        </section>

        {/* 再生コントロール */}
        {!isLoading && !error && articles.length > 0 && (
          <section>
            <AudioPlayer
              articles={articles}
              character={character}
              player={player}
            />
          </section>
        )}

        {/* ニュース一覧 */}
        <section className="flex flex-col gap-4">
          {isLoading && (
            <div className="flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
                  <div className="h-3 bg-gray-800 rounded w-24 mb-3" />
                  <div className="h-4 bg-gray-800 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-4" />
                  <div className="h-12 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-16 flex flex-col items-center gap-4">
              <p className="text-gray-400">{error}</p>
              <button
                onClick={refetch}
                className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                再読み込み
              </button>
            </div>
          )}

          {!isLoading && !error && articles.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p>記事がありません</p>
            </div>
          )}

          {!isLoading && !error && articles.map((article, index) => (
            <div
              key={article.id}
              className={[
                "rounded-2xl transition-all",
                // 現在再生中のカードをハイライト
                player.currentIndex === index
                  ? "ring-2 ring-indigo-500"
                  : "",
              ].join(" ")}
            >
              <NewsCard
                article={article}
                character={character}
                onPlay={() => player.playArticle(article, character)}
                isPlaying={player.currentIndex === index && player.playState === "playing"}
              />
            </div>
          ))}
        </section>
      </main>

      {/* フッター（再生バーが被るので少し上に余白を取っている） */}
      <footer className="border-t border-gray-800 px-4 py-4 text-center text-xs text-gray-600">
        AI News DJ — ニュースはAIが要約しています
      </footer>
    </div>
  );
}
