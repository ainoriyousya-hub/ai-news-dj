---
name: cron-test
description: Vercel にデプロイされた /api/cron を手動でテストする
---

以下を実行して結果を報告してください。

```bash
curl -s -X POST https://ai-news-dj.vercel.app/api/cron \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s"
```

CRON_SECRET が不明な場合はユーザーに確認してください。
成功（200）なら articleCount と保存 URL を報告し、
失敗なら step と error を分析して修正案を提示してください。
