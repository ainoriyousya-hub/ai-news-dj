// 環境変数バリデーション
// サーバー起動時・cron 実行時に呼び出し、必須変数が揃っているか確認する
// 不足時は具体的なエラーメッセージを出すことでデバッグを容易にする

const REQUIRED_ENV_VARS = [
  "ANTHROPIC_API_KEY",
  "BLOB_READ_WRITE_TOKEN",
  "CRON_SECRET",
] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

export function validateEnv(): void {
  const missing: RequiredEnvVar[] = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `必須の環境変数が設定されていません: ${missing.join(", ")}\n` +
        "Vercel ダッシュボードの Environment Variables から設定してください。"
    );
  }
}

// 型安全に環境変数を取得する
// validateEnv() 後に呼ぶことで undefined にならないことを保証できる
export function getEnv(key: RequiredEnvVar): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`);
  }
  return value;
}
