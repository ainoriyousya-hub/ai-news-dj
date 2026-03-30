"use client";

// ユーザー設定を localStorage で永続化するカスタムフック
// SSR 時は localStorage にアクセスできないため、useEffect で遅延読み込みする

import { useState, useEffect, useCallback } from "react";
import type { UserSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";

const STORAGE_KEY = "ai-news-dj:settings";

function loadFromStorage(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    // JSON が壊れていた場合はデフォルトに戻す
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveToStorage(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage が使えない環境（プライベートブラウジング等）は無視
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // SSR と CSR の不一致を避けるため、マウント後に localStorage から読み込む
  useEffect(() => {
    setSettingsState(loadFromStorage());
    setHydrated(true);
  }, []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      saveToStorage(next);
      return next;
    });
  }, []);

  return { settings, updateSettings, hydrated };
}
