"use client";

// TTS 再生状態を管理するカスタムフック
// speaker.ts の低レベル API をラップし、プレイリスト的な操作（次へ/停止）を提供する

import { useState, useCallback, useEffect, useRef } from "react";
import { speak, cancel, isTTSSupported } from "@/lib/tts/speaker";
import type { NewsArticle, CharacterId } from "@/types/news";

type PlayState = "idle" | "playing";

export interface UseAudioPlayerResult {
  playState: PlayState;
  // 現在再生中の記事インデックス（再生中でなければ null）
  currentIndex: number | null;
  // TTS が使えるブラウザかどうか
  isSupported: boolean;
  // 単一記事を再生する
  playArticle: (article: NewsArticle, character: CharacterId) => void;
  // プレイリスト全体を先頭から再生する
  playAll: (articles: NewsArticle[], character: CharacterId) => void;
  // 停止
  stop: () => void;
  // 次の記事へスキップ
  skipNext: () => void;
}

export function useAudioPlayer(): UseAudioPlayerResult {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // useRef でプレイリスト情報を保持する。
  // useState だと onEnd コールバック内のクロージャが古い値を参照してしまうため、
  // ref を使って常に最新の値にアクセスできるようにしている。
  const playlistRef = useRef<{
    articles: NewsArticle[];
    character: CharacterId;
    index: number;
  } | null>(null);

  // SSR では window が存在しないため、マウント後に判定する
  useEffect(() => {
    setIsSupported(isTTSSupported());
  }, []);

  const playAt = useCallback((index: number) => {
    const playlist = playlistRef.current;
    if (!playlist || index >= playlist.articles.length) {
      setPlayState("idle");
      setCurrentIndex(null);
      playlistRef.current = null;
      return;
    }

    const article = playlist.articles[index];
    const text = article.summaries[playlist.character];

    if (!text) {
      // 要約がなければスキップして次へ
      playAt(index + 1);
      return;
    }

    playlist.index = index;
    setCurrentIndex(index);
    setPlayState("playing");

    speak({
      text,
      lang: "ja-JP",
      rate: 1.05,
      onEnd: () => {
        const current = playlistRef.current;
        // stop() が呼ばれると playlistRef が null になるため、その場合は何もしない
        if (!current) return;
        if (index >= current.articles.length - 1) {
          setPlayState("idle");
          setCurrentIndex(null);
          playlistRef.current = null;
        } else {
          playAt(index + 1);
        }
      },
      onError: (e) => {
        // "interrupted" は cancel() によるものなので無視する
        if (e.error !== "interrupted") {
          console.error("[TTS] 読み上げエラー:", e.error);
          setPlayState("idle");
          setCurrentIndex(null);
          playlistRef.current = null;
        }
      },
    });
  }, []); // playlistRef は ref なので依存配列不要

  const playArticle = useCallback(
    (article: NewsArticle, character: CharacterId) => {
      playlistRef.current = { articles: [article], character, index: 0 };
      playAt(0);
    },
    [playAt]
  );

  const playAll = useCallback(
    (articles: NewsArticle[], character: CharacterId) => {
      if (articles.length === 0) return;
      playlistRef.current = { articles, character, index: 0 };
      playAt(0);
    },
    [playAt]
  );

  const stop = useCallback(() => {
    playlistRef.current = null; // onEnd が次の記事へ進まないように先にクリア
    cancel();
    setPlayState("idle");
    setCurrentIndex(null);
  }, []);

  const skipNext = useCallback(() => {
    const playlist = playlistRef.current;
    if (!playlist) return;
    const nextIndex = playlist.index + 1;
    cancel(); // onEnd を発火させない（interrupted エラーは onError で無視）
    if (nextIndex >= playlist.articles.length) {
      stop();
    } else {
      playAt(nextIndex);
    }
  }, [playAt, stop]);

  // アンマウント時に再生を止める
  useEffect(() => {
    return () => {
      cancel();
    };
  }, []);

  return {
    playState,
    currentIndex,
    isSupported,
    playArticle,
    playAll,
    stop,
    skipNext,
  };
}
