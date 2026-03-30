"use client";

// 画面下部に固定表示する再生コントロールバー
// 再生中のみ表示される（idle 時は非表示）

import type { NewsArticle, CharacterId } from "@/types/news";
import type { UseAudioPlayerResult } from "@/hooks/useAudioPlayer";

interface Props {
  articles: NewsArticle[];
  character: CharacterId;
  player: UseAudioPlayerResult;
}

export function AudioPlayer({ articles, character, player }: Props) {
  const { playState, currentIndex, isSupported, playAll, stop, skipNext } =
    player;

  if (!isSupported) return null;

  const isPlaying = playState === "playing";
  const currentArticle =
    currentIndex !== null ? articles[currentIndex] : null;

  return (
    <>
      {/* まとめて再生ボタン（ニュース一覧の上部） */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => (isPlaying ? stop() : playAll(articles, character))}
          disabled={articles.length === 0}
          className={[
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
            isPlaying
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {isPlaying ? (
            <>
              <span>⏹</span>
              <span>停止</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>まとめて再生</span>
            </>
          )}
        </button>

        {isPlaying && (
          <button
            onClick={skipNext}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <span>⏭</span>
            <span>次へ</span>
          </button>
        )}
      </div>

      {/* 再生中バー（画面下部固定） */}
      {isPlaying && currentArticle && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-t border-gray-700 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {/* アニメーション波形：各バーに位相差をつけて音声波形らしく見せる */}
            <div className="flex items-end gap-0.5 h-5 shrink-0" aria-hidden="true">
              {[0.0, 0.15, 0.05, 0.2].map((delay, i) => (
                <span
                  key={i}
                  className="w-1 bg-indigo-400 rounded-sm"
                  style={{
                    height: `${50 + i * 12}%`,
                    animation: `wave 0.8s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-indigo-400 mb-0.5">
                {currentIndex !== null ? `${currentIndex + 1} / ${articles.length}` : ""}
              </p>
              <p className="text-sm text-gray-200 truncate">
                {currentArticle.title}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={skipNext}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="次の記事へ"
              >
                ⏭
              </button>
              <button
                onClick={stop}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="停止"
              >
                ⏹
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
