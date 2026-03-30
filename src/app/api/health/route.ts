// GET /api/health
// Blob 接続・環境変数の確認用エンドポイント（デバッグ専用）
// 本番でも公開状態だが、機密情報は返さない

import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(): Promise<NextResponse> {
  const checks: Record<string, string> = {};

  // 環境変数の存在チェック（値は返さない）
  checks.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ? "set" : "MISSING";
  checks.BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN ? "set" : "MISSING";
  checks.CRON_SECRET = process.env.CRON_SECRET ? "set" : "MISSING";

  // Blob 接続テスト
  try {
    await list({ prefix: "health-check/", limit: 1 });
    checks.blob_connection = "ok";
  } catch (error) {
    checks.blob_connection = `error: ${String(error)}`;
  }

  const allOk = Object.values(checks).every((v) => v === "ok" || v === "set");

  return NextResponse.json(
    { status: allOk ? "ok" : "degraded", checks },
    { status: allOk ? 200 : 500 }
  );
}
