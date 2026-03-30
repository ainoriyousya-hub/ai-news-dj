import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI News DJ",
  description: "お気に入りのDJキャラがニュースを読み上げてくれるアプリ",
  // モバイルホーム画面追加時のアイコン・テーマ設定
  appleWebApp: {
    title: "AI News DJ",
    statusBarStyle: "black-translucent",
  },
};

// viewport は metadata から分離して定義する（Next.js 14+ の推奨）
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // ダークテーマに合わせてブラウザのアドレスバーを黒く
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
