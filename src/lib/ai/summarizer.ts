// AI要約モジュール
// Claude API を呼び出してニュースをキャラクター口調に変換する
// このファイルは AI 処理のみに責任を持つ。RSS 取得やストレージは扱わない。

import Anthropic from "@anthropic-ai/sdk";
import { CHARACTERS } from "@/config/characters";
import type { RawNewsItem, NewsArticle, Summaries, CharacterId } from "@/types/news";

// クライアントはモジュールレベルでシングルトンとして保持
// （毎回インスタンス化するのを避けるため）
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    // 環境変数チェックは validateEnv() で起動時に行う想定だが、
    // 念のためここでも確認する
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY が設定されていません");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// 1記事を1キャラクターで要約する
// エラー時はフォールバックテキストを返し、処理全体を止めない
async function summarizeWithCharacter(
  item: RawNewsItem,
  characterId: CharacterId
): Promise<string> {
  const character = CHARACTERS.find((c) => c.id === characterId);
  if (!character) {
    throw new Error(`キャラクター ID が不正です: ${characterId}`);
  }

  const userPrompt = `以下のニュース記事を、あなたのキャラクターで語り直してください。

【記事タイトル】${item.title}
【記事概要】${item.description || "（概要なし）"}
【出典】${item.source}`;

  try {
    const message = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      // haiku を使うことでコストを抑える。品質が不足した場合は sonnet に変更可
      max_tokens: 256,
      system: character.systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      throw new Error("予期しないレスポンス形式");
    }
    return block.text;
  } catch (error) {
    console.error(
      `[AI] 要約失敗: characterId=${characterId}, title=${item.title}`,
      error
    );
    // 失敗時は元タイトルをそのまま返してユーザー体験を損なわないようにする
    return `${item.title}（要約を取得できませんでした）`;
  }
}

// 1記事を全キャラクター分まとめて要約する
// 並列実行でレイテンシを削減する
async function summarizeArticle(
  item: RawNewsItem,
  articleId: string
): Promise<NewsArticle> {
  const characterIds = CHARACTERS.map((c) => c.id);

  // 全キャラ分を並列で API 呼び出し
  const summaryResults = await Promise.all(
    characterIds.map((id) => summarizeWithCharacter(item, id))
  );

  const summaries = Object.fromEntries(
    characterIds.map((id, index) => [id, summaryResults[index]])
  ) as Summaries;

  return {
    id: articleId,
    title: item.title,
    source: item.source,
    source_url: item.source_url,
    genre: item.genre,
    summaries,
  };
}

// 複数記事をバッチ処理する
// API レート制限を避けるため、記事間に少し間隔を空けている
export async function summarizeArticles(
  items: RawNewsItem[]
): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const articleId = `article-${String(i + 1).padStart(3, "0")}`;

    console.log(
      `[AI] 要約中 (${i + 1}/${items.length}): ${item.title}`
    );

    const article = await summarizeArticle(item, articleId);
    articles.push(article);

    // 連続リクエストによるレート制限を避けるため 500ms 待機
    // （claude-haiku は 1分あたりのリクエスト数に制限がある）
    if (i < items.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return articles;
}
