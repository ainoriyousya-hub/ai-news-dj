"use client";

import { GENRES } from "@/config/genres";
import type { GenreId } from "@/types/news";

interface Props {
  selected: GenreId | undefined;
  onChange: (genre: GenreId | undefined) => void;
}

export function GenreFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* "すべて" は undefined で表現する */}
      <button
        onClick={() => onChange(undefined)}
        className={[
          "shrink-0 px-3 py-1 rounded-full border text-xs font-medium transition-colors",
          selected === undefined
            ? "bg-gray-100 border-gray-100 text-gray-900"
            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200",
        ].join(" ")}
      >
        すべて
      </button>
      {GENRES.map((g) => {
        const isActive = selected === g.id;
        return (
          <button
            key={g.id}
            onClick={() => onChange(g.id)}
            className={[
              "shrink-0 flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium transition-colors",
              isActive
                ? "bg-gray-100 border-gray-100 text-gray-900"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200",
            ].join(" ")}
          >
            <span>{g.icon}</span>
            <span>{g.label}</span>
          </button>
        );
      })}
    </div>
  );
}
