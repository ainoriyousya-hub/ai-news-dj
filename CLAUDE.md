# AI News DJ — Claude Code 指示書

## プロジェクト概要
Next.js App Router + Vercel Blob + Claude API を使ったニュース読み上げアプリ。
毎日 JST 07:00 に cron で RSS 取得→AI要約→Blob 保存し、Web Speech API で読み上げる。

## ディレクトリ責務（必ず守ること）
- `src/config/` — キャラ・RSS・ジャンルの設定。ビジネスロジックを書かない
- `src/lib/` — ビジネスロジック。UI を import しない
- `src/components/` — UI のみ。API 呼び出しや Blob 操作をしない
- `src/hooks/` — React hooks。サーバーサイドコードを書かない
- `src/app/api/` — APIルート。薄くする（lib/ に処理を委譲する）
- `src/types/` — 型定義のみ。ロジックを書かない

## コーディング規則
- `any` 型は禁止。`unknown` を使って型ガードする
- コメントは「なぜそうするか」を書く。何をするかはコードから読める
- エラーは呼び出し元で処理する（ライブラリ層でハンドリングしすぎない）
- 環境変数は必ず `src/lib/env.ts` の `getEnv()` 経由で取得する
- `console.log` は `[モジュール名]` プレフィックス付きで書く（例: `[Blob] 保存完了`）

## 変更してはいけないもの
- `.env.local` — Git にコミットしない（`.gitignore` 済み）
- Vercel 環境変数 — ダッシュボードからのみ変更する
- `CRON_SECRET` の値 — コード内に書かない

## よく使うコマンド
```bash
npm run dev       # 開発サーバー起動
npm run build     # ビルド（デプロイ前に必ず確認）
npx tsc --noEmit  # 型チェックのみ
```

## 新機能追加のパターン
- DJキャラ追加: `src/config/characters.ts` + `src/types/news.ts` の `CharacterId`
- RSSフィード追加: `src/config/rss-feeds.ts`
- ジャンル追加: `src/config/genres.ts` + `src/types/news.ts` の `GenreId`

## Vercel / デプロイ
- `npm run build` が通ることを確認してから push する
- `maxDuration = 60` は Pro プランが必要
- Blob は `private` モードで運用中（`access: "private"` + `allowOverwrite: true`）
