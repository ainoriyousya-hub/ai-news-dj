// RSSフィード取得・パースモジュール
// このファイルはデータ取得のみに責任を持つ。AI 要約やストレージは扱わない。
// rss-parser ライブラリを使うことで XML パースの複雑さを隠蔽している

import Parser from "rss-parser";
import { RSS_FEEDS } from "@/config/rss-feeds";
import type { RawNewsItem } from "@/types/news";
import type { GenreId } from "@/types/news";

// カスタムフィールドは使わないが、型を明示して any を避ける
type FeedItem = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
};

const parser = new Parser<Record<string, unknown>, FeedItem>();

// 1つのフィードから記事を取得する
// ネットワークエラーや不正な XML はここで吸収し、呼び出し元には空配列を返す
async function fetchFeed(
  feedId: string,
  url: string,
  genre: GenreId,
  sourceName: string,
  maxItems: number
): Promise<RawNewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, maxItems).map((item) => ({
      title: item.title ?? "(タイトルなし)",
      source: sourceName,
      source_url: item.link ?? url,
      genre,
      // contentSnippet は HTML タグを除去した本文。なければ content か空文字
      description: item.contentSnippet ?? item.content ?? "",
    }));
  } catch (error) {
    // 1フィードの失敗で全体を止めないよう、エラーをログに出して空配列を返す
    console.error(`[RSS] フィード取得失敗: ${feedId} (${url})`, error);
    return [];
  }
}

// 全フィードから記事を取得してフラットな配列として返す
export async function fetchAllFeeds(): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) =>
      fetchFeed(feed.id, feed.url, feed.genre, feed.label, feed.maxItems)
    )
  );

  const items: RawNewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
    // rejected は fetchFeed 内でログ済みなので無視
  }

  console.log(`[RSS] 合計 ${items.length} 件の記事を取得`);
  return items;
}

// 特定ジャンルのフィードのみ取得する（開発・デバッグ用）
export async function fetchFeedsByGenre(
  genre: GenreId
): Promise<RawNewsItem[]> {
  const targetFeeds = RSS_FEEDS.filter((f) => f.genre === genre);
  const results = await Promise.allSettled(
    targetFeeds.map((feed) =>
      fetchFeed(feed.id, feed.url, feed.genre, feed.label, feed.maxItems)
    )
  );

  const items: RawNewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }
  return items;
}
