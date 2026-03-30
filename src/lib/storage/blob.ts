// Vercel Blob ストレージ読み書きモジュール
// このファイルはストレージ操作のみに責任を持つ。AI 処理や RSS 取得は扱わない。
//
// Blob のキー設計：
//   news/YYYY-MM-DD.json
// 日付単位で1ファイルにまとめることで、GET /api/news の読み込みコストを最小化する

import {
  put,
  list,
  BlobNotFoundError,
  BlobStoreNotFoundError,
  BlobAccessError,
  BlobUnknownError,
} from "@vercel/blob";
import type { DailyNews } from "@/types/news";

// 日付文字列（YYYY-MM-DD）から Blob のパスを生成する
function blobPath(date: string): string {
  return `news/${date}.json`;
}

// 今日のニュースデータを Blob に保存する
// 既存データは上書きされる（毎日の cron で最新に更新するため）
export async function saveDailyNews(data: DailyNews): Promise<string> {
  const path = blobPath(data.date);
  const json = JSON.stringify(data, null, 2);

  try {
    const result = await put(path, json, {
      access: "public",
      contentType: "application/json",
      // addRandomSuffix を false にすることで同じパスで上書きできる
      addRandomSuffix: false,
    });
    console.log(`[Blob] 保存完了: ${result.url}`);
    return result.url;
  } catch (error) {
    // エラー型を明示してログに出す（Vercel ログで原因を追いやすくする）
    const detail = classifyBlobError(error);
    console.error(`[Blob] 保存失敗 (${detail}):`, error);
    throw new Error(`[Blob] 保存失敗 (path=${path}, reason=${detail})`);
  }
}

// 指定日のニュースデータを Blob から読み込む
// データが存在しない場合は null を返す（404 は正常系として扱う）
//
// head() ではなく list() を使う理由：
// head() は Blob の完全 URL を要求するが、put() 後の URL はストアごとに異なる。
// list({ prefix }) はパスのプレフィックスで検索できるため、パスだけで確実に URL を取得できる。
export async function loadDailyNews(date: string): Promise<DailyNews | null> {
  const path = blobPath(date);

  try {
    // list() でパスに一致するBlobを検索し、URL を取得する
    const { blobs } = await list({ prefix: path, limit: 1 });

    if (blobs.length === 0) {
      // 当日のデータがまだ生成されていない（cron 未実行）は正常系
      return null;
    }

    const response = await fetch(blobs[0].url, {
      // Vercel のエッジキャッシュを無視して常に最新を取得する
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as DailyNews;
  } catch (error) {
    const detail = classifyBlobError(error);
    console.error(`[Blob] 読み込み失敗 (${detail}):`, error);
    throw new Error(`[Blob] 読み込み失敗 (date=${date}, reason=${detail})`);
  }
}

// Blob エラーを分類して原因を文字列で返す
// Vercel ログでエラー種別が一目でわかるようにする
function classifyBlobError(error: unknown): string {
  if (error instanceof BlobNotFoundError) return "not_found";
  if (error instanceof BlobStoreNotFoundError) return "store_not_found（Blobストアが未接続の可能性）";
  if (error instanceof BlobAccessError) return "access_denied（BLOB_READ_WRITE_TOKENが無効な可能性）";
  if (error instanceof BlobUnknownError) return "unknown_blob_error";
  return String(error);
}

// 今日の日付文字列を返すヘルパー（JST）
// サーバーのタイムゾーンに依存しないよう明示的に JST で計算する
export function getTodayJST(): string {
  const now = new Date();
  // UTC+9 のオフセットを加算
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}
