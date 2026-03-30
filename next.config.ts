import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /api/cron は cron-job.org からのみ呼び出されるため最大実行時間を延ばす
  // RSS 取得 + Claude API 呼び出し + Blob 保存で 30 秒以上かかることがある
  serverExternalPackages: ["rss-parser"],
};

export default nextConfig;
