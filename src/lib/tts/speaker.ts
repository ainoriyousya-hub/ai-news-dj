// Web Speech API (SpeechSynthesis) ラッパー
// このファイルはブラウザ API の差異を吸収することのみに責任を持つ。
// 将来的に外部 TTS API へ差し替える場合はこのファイルの中身だけ置き換える。
// インターフェース（speak / cancel / getVoices）は維持すること。
//
// 注意：Web Speech API はブラウザ・OS によって挙動が異なる。
// 特に Chrome は日本語音声のロードが非同期になるため、voiceschanged イベントを待つ必要がある。

export interface SpeakOptions {
  text: string;
  // 言語コード。日本語は "ja-JP"
  lang?: string;
  // 読み上げ速度（0.1 〜 10、デフォルト 1.0）
  rate?: number;
  // 音程（0 〜 2、デフォルト 1.0）
  pitch?: number;
  // 読み上げ完了コールバック
  onEnd?: () => void;
  // エラーコールバック
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

// SpeechSynthesis が利用可能かチェック
export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// 日本語音声を取得する
// Chrome は初回ロード時に音声リストが空のことがあるため、voiceschanged を待つ
export async function getJapaneseVoice(): Promise<SpeechSynthesisVoice | null> {
  if (!isTTSSupported()) return null;

  const synth = window.speechSynthesis;

  const findJaVoice = () =>
    synth.getVoices().find((v) => v.lang.startsWith("ja")) ?? null;

  // 既に音声リストがあればすぐ返す
  if (synth.getVoices().length > 0) return findJaVoice();

  // 音声リストが空の場合は voiceschanged イベントを待つ（最大 3 秒）
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 3000);

    synth.addEventListener(
      "voiceschanged",
      () => {
        clearTimeout(timer);
        resolve(findJaVoice());
      },
      { once: true }
    );
  });
}

// テキストを読み上げる
// 既に読み上げ中の場合は先にキャンセルしてから開始する
export async function speak(options: SpeakOptions): Promise<void> {
  if (!isTTSSupported()) {
    console.warn("[TTS] Web Speech API は未対応のブラウザです");
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(options.text);
  utterance.lang = options.lang ?? "ja-JP";
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;

  // 日本語音声を優先設定する（見つからなければブラウザのデフォルトを使用）
  const jaVoice = await getJapaneseVoice();
  if (jaVoice) utterance.voice = jaVoice;

  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  synth.speak(utterance);
}

// 読み上げを停止する
export function cancel(): void {
  if (!isTTSSupported()) return;
  window.speechSynthesis.cancel();
}

// 現在読み上げ中かどうか
export function isSpeaking(): boolean {
  if (!isTTSSupported()) return false;
  return window.speechSynthesis.speaking;
}
