// DJキャラクターの型定義
// キャラの追加・変更は config/characters.ts のみで完結させる

import type { CharacterId } from "./news";

export interface DJCharacter {
  id: CharacterId;
  name: string;
  // Claude に渡すシステムプロンプト
  systemPrompt: string;
  // UI 表示用の短い説明
  description: string;
  // アイコン（絵文字で代替）
  icon: string;
}
