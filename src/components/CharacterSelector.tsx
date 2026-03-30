"use client";

import { CHARACTERS } from "@/config/characters";
import type { CharacterId } from "@/types/news";

interface Props {
  selected: CharacterId;
  onChange: (id: CharacterId) => void;
}

export function CharacterSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CHARACTERS.map((c) => {
        const isActive = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={[
              "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors",
              isActive
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500 hover:text-white",
            ].join(" ")}
          >
            <span className="text-base">{c.icon}</span>
            <span>{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}
