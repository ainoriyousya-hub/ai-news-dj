"use client";

import Link from "next/link";
import { CHARACTERS } from "@/config/characters";
import { GENRES } from "@/config/genres";
import { useSettings } from "@/hooks/useSettings";
import type { CharacterId, GenreId } from "@/types/news";

export default function SettingsPage() {
  const { settings, updateSettings, hydrated } = useSettings();

  function toggleGenre(genre: GenreId) {
    const current = settings.subscribedGenres;
    const next = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    // 最低1ジャンルは購読必須とする
    if (next.length === 0) return;
    updateSettings({ subscribedGenres: next });
  }

  function setDefaultCharacter(id: CharacterId) {
    updateSettings({ defaultCharacter: id });
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            aria-label="戻る"
          >
            ←
          </Link>
          <span className="font-semibold">設定</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-10">
        {/* デフォルトDJ設定 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            デフォルトのDJ
          </h2>
          <div className="flex flex-col gap-3">
            {CHARACTERS.map((c) => {
              const isSelected = settings.defaultCharacter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setDefaultCharacter(c.id)}
                  className={[
                    "flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors",
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500"
                      : "bg-gray-900 border-gray-800 hover:border-gray-700",
                  ].join(" ")}
                >
                  <span className="text-3xl">{c.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-100">{c.name}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{c.description}</p>
                  </div>
                  {isSelected && (
                    <span className="text-indigo-400 text-sm font-medium shrink-0">選択中</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 購読ジャンル設定 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            購読するジャンル
          </h2>
          <p className="text-xs text-gray-500">
            ※ ジャンルフィルターには現在この設定は反映されません（将来対応予定）
          </p>
          <div className="flex flex-col gap-2">
            {GENRES.map((g) => {
              const isSubscribed = settings.subscribedGenres.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGenre(g.id)}
                  className={[
                    "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors",
                    isSubscribed
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-900 border-gray-800 opacity-50 hover:opacity-75",
                  ].join(" ")}
                >
                  <span className="text-lg">{g.icon}</span>
                  <span className="text-sm text-gray-200 flex-1">{g.label}</span>
                  <span
                    className={[
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                      isSubscribed
                        ? "bg-indigo-600 border-indigo-500"
                        : "border-gray-600",
                    ].join(" ")}
                  >
                    {isSubscribed && <span className="text-white text-xs">✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
