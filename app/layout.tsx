import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edel Drive",
  description: "Edel ekibinin dosya deposu. Yükle, paylaş, birlikte çalış.",
  applicationName: "Edel Drive",
  // iOS'ta Ana Ekrana Ekle yapılınca tam ekran "uygulama" gibi açılsın.
  appleWebApp: { capable: true, title: "Edel", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-bg font-sans antialiased">{children}</body>
    </html>
  );
}
