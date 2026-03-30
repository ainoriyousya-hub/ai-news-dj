// POST /api/cron
// cron-job.org から毎日 UTC 22:00（JST 07:00）に呼び出されるエンドポイント
// Bearer Token 認証で不正アクセスを防ぐ
//
// 処理フロー：
//   1. 認証チェック
//   2. RSS 全フィード取得
//   3. 記事を 5〜8 本に絞り込み
//   4. 全キャラクター分の AI 要約生成
//   5. Vercel Blob に保存

// Vercel Serverless Function の最大実行時間（秒）
// RSS 取得 + Claude API 呼び出し + Blob 保存で時間がかかるため延長する
// Vercel 無料プランの上限は 60 秒
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { validateEnv, getEnv } from "@/lib/env";
import { fetchAllFeeds } from "@/lib/rss/fetcher";
import { summarizeArticles } from "@/lib/ai/summarizer";
import { saveDailyNews, getTodayJST } from "@/lib/storage/blob";
import type { DailyNews } from "@/types/news";

// 1回の配信でピックアップする記事数（仕様：5〜8本）
const ARTICLES_PER_DELIVERY = 6;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 起動時に環境変数を確認する
  try {
    validateEnv();
  } catch (error) {
    console.error("[cron] 環境変数エラー:", error);
    return NextResponse.json(
      { error: "サーバー設定エラー" },
      { status: 500 }
    );
  }

  // Bearer Token 認証
  // 総当たりを防ぐため、秘密トークンが一致しない場合は 401 を返す
  const authHeader = request.headers.get("authorization");
  const cronSecret = getEnv("CRON_SECRET");
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[cron] 認証失敗: 不正な Authorization ヘッダー");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const date = getTodayJST();
    console.log(`[cron] 処理開始: ${date}`);

    // RSS 全フィードから記事取得
    const rawItems = await fetchAllFeeds();
    if (rawItems.length === 0) {
      console.warn("[cron] RSS から記事を取得できませんでした");
      return NextResponse.json(
        { error: "記事が取得できませんでした" },
        { status: 500 }
      );
    }

    // ジャンルが偏らないように均等にサンプリングする
    // 単純に先頭から取ると特定ジャンルに偏るため、ジャンルごとに1件ずつ取る
    const picked = pickBalancedItems(rawItems, ARTICLES_PER_DELIVERY);
    console.log(`[cron] ${picked.length} 件を要約対象に選定`);

    // AI 要約生成（全キャラクター分）
    const articles = await summarizeArticles(picked);

    // Blob に保存
    const payload: DailyNews = {
      date,
      generated_at: new Date().toISOString(),
      articles,
    };
    const url = await saveDailyNews(payload);

    console.log(`[cron] 処理完了: ${articles.length} 件保存 → ${url}`);
    return NextResponse.json({
      success: true,
      date,
      articleCount: articles.length,
      url,
    });
  } catch (error) {
    console.error("[cron] 処理中にエラーが発生しました:", error);
    return NextResponse.json(
      { error: "処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// ジャンルごとに均等に記事を選ぶ
// 偏りが出るとユーザー体験が低下するため、ラウンドロビン方式で選出する
function pickBalancedItems<T extends { genre: string }>(
  items: T[],
  count: number
): T[] {
  // ジャンルごとにグループ化
  const byGenre = new Map<string, T[]>();
  for (const item of items) {
    const group = byGenre.get(item.genre) ?? [];
    group.push(item);
    byGenre.set(item.genre, group);
  }

  const genres = Array.from(byGenre.keys());
  const result: T[] = [];
  let i = 0;

  // ラウンドロビンで各ジャンルから1件ずつ取り出す
  while (result.length < count) {
    const genre = genres[i % genres.length];
    const group = byGenre.get(genre)!;
    if (group.length > 0) {
      result.push(group.shift()!);
    }
    i++;
    // 全ジャンルが空になったら終了
    if (genres.every((g) => (byGenre.get(g)?.length ?? 0) === 0)) break;
  }

  return result;
}
