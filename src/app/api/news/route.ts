// GET /api/news
// フロントエンドが今日のニュースデータを取得するエンドポイント
//
// クエリパラメータ：
//   character: CharacterId（省略時は全キャラ分を返す）
//   genre: GenreId（省略時は全ジャンル）
//   date: YYYY-MM-DD（省略時は今日 JST）

import { NextRequest, NextResponse } from "next/server";
import { loadDailyNews, getTodayJST } from "@/lib/storage/blob";
import type { CharacterId, GenreId, NewsArticle } from "@/types/news";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const characterId = searchParams.get("character") as CharacterId | null;
  const genre = searchParams.get("genre") as GenreId | null;
  const date = searchParams.get("date") ?? getTodayJST();

  try {
    const data = await loadDailyNews(date);

    if (!data) {
      // 当日のデータがまだ生成されていない（cron 未実行）
      return NextResponse.json(
        {
          error: "本日のニュースはまだ準備中です。しばらくお待ちください。",
          date,
        },
        { status: 404 }
      );
    }

    // ジャンルフィルター
    let articles: NewsArticle[] = data.articles;
    if (genre) {
      articles = articles.filter((a) => a.genre === genre);
    }

    // character が指定された場合、そのキャラの要約のみに絞って返す
    // 通信量削減のため、不要なキャラの要約データを除去する
    const responseArticles = characterId
      ? articles.map((a) => ({
          ...a,
          summaries: { [characterId]: a.summaries[characterId] } as typeof a.summaries,
        }))
      : articles;

    return NextResponse.json({
      date: data.date,
      generated_at: data.generated_at,
      articles: responseArticles,
    });
  } catch (error) {
    console.error("[news] データ取得エラー:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
