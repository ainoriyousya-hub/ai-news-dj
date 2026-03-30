# AI News DJ

キャラクター性のある語り口でニュースを届けるパーソナルAIニュースアプリ。

## 機能

- RSS フィードからニュースを自動収集（毎日 JST 07:00）
- 3種類のDJキャラクターがニュースを読み上げ
- ジャンルフィルター（テクノロジー・ビジネス・国内・エンタメ・スポーツ）
- Web Speech API による音声読み上げ

## 開発環境のセットアップ

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 環境変数ファイルを作成
cp .env.local.example .env.local
# .env.local を編集して API キーを設定

# 3. 開発サーバーを起動
npm run dev
```

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `ANTHROPIC_API_KEY` | Anthropic API キー |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob トークン |
| `CRON_SECRET` | cron-job.org 認証用シークレット |

**本番環境では Vercel ダッシュボードから設定すること（コードには絶対に書かない）。**

## Vercel へのデプロイ

1. GitHub リポジトリを作成してプッシュ
2. Vercel でプロジェクトを新規作成（GitHub 連携）
3. Vercel ダッシュボード → Settings → Environment Variables で環境変数を設定
4. Vercel ダッシュボード → Storage → Blob でストレージを作成・接続
5. デプロイ確認

## cron-job.org の設定

1. cron-job.org でアカウント作成
2. 新規ジョブを作成：
   - URL: `https://your-app.vercel.app/api/cron`
   - Method: `POST`
   - Schedule: `0 22 * * *`（UTC 22:00 = JST 07:00）
   - Headers: `Authorization: Bearer <CRON_SECRET の値>`

## ディレクトリ構造

```
src/
├── app/            # Next.js App Router
├── components/     # UI コンポーネント（ロジックなし）
├── hooks/          # カスタムフック
├── lib/            # ビジネスロジック
│   ├── ai/         # Claude API 要約
│   ├── rss/        # RSS フェッチ
│   ├── storage/    # Vercel Blob
│   └── tts/        # Web Speech API
├── config/         # 設定ファイル（キャラ・フィード・ジャンル）
└── types/          # TypeScript 型定義
```

## キャスト・フィードの追加方法

| やりたいこと | 触るファイル |
|-------------|-------------|
| DJキャラを追加 | `src/config/characters.ts` + `src/types/news.ts` の `CharacterId` |
| RSSフィードを追加 | `src/config/rss-feeds.ts` |
| ジャンルを追加 | `src/config/genres.ts` + `src/types/news.ts` の `GenreId` |
