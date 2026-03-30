// ユーザー設定の型定義
// localStorage に保存する構造

import type { CharacterId, GenreId } from "./news";

export interface UserSettings {
  // デフォルトで表示するDJキャラ
  defaultCharacter: CharacterId;
  // 購読するジャンルの一覧
  subscribedGenres: GenreId[];
}

// 設定のデフォルト値
// 初回起動時・設定が壊れた場合のフォールバックとして使う
export const DEFAULT_SETTINGS: UserSettings = {
  defaultCharacter: "friendly",
  subscribedGenres: ["technology", "business"],
};
