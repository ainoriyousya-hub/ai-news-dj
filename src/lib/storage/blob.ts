// Vercel Blob ストレージ読み書きモジュール
// このファイルはストレージ操作のみに責任を持つ。AI 処理や RSS 取得は扱わない。
//
// Blob のキー設計：
//   news/YYYY-MM-DD.json
// 日付単位で1ファイルにまとめることで、GET /api/news の読み込みコストを最小化する

import { put, head, BlobNotFoundError } from "@vercel/blob";
import type { DailyNews } from "@/types/news";

// 日付文字列（YYYY-MM-DD）から Blob のキーを生成する
function blobKey(date: string): string {
  return `news/${date}.json`;
}

// 今日のニュースデータを Blob に保存する
// 既存データは上書きされる（毎日の cron で最新に更新するため）
export async function saveDailyNews(data: DailyNews): Promise<string> {
  const key = blobKey(data.date);
  const json = JSON.stringify(data, null, 2);

  try {
    const result = await put(key, json, {
      access: "public",
      contentType: "application/json",
      // addRandomSuffix を false にすることで同じキーで上書きできる
      addRandomSuffix: false,
    });
    console.log(`[Blob] 保存完了: ${result.url}`);
    return result.url;
  } catch (error) {
    throw new Error(`[Blob] 保存失敗 (key=${key}): ${String(error)}`);
  }
}

// 指定日のニュースデータを Blob から読み込む
// データが存在しない場合は null を返す（404 は正常系として扱う）
export async function loadDailyNews(date: string): Promise<DailyNews | null> {
  const key = blobKey(date);

  try {
    // head() で存在確認してから URL を取得し fetch する
    // @vercel/blob は get() を提供しないため、この2ステップが必要
    const blob = await head(key);
    const response = await fetch(blob.url, {
      // Vercel のエッジキャッシュを無視して常に最新を取得する
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as DailyNews;
    return data;
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      // 当日のデータがまだ生成されていない場合は null を返す（正常系）
      return null;
    }
    throw new Error(`[Blob] 読み込み失敗 (date=${date}): ${String(error)}`);
  }
}

// 今日の日付文字列を返すヘルパー（JST）
// サーバーのタイムゾーンに依存しないよう明示的に JST で計算する
export function getTodayJST(): string {
  const now = new Date();
  // UTC+9 のオフセットを加算
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}
