import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edel Drive",
  description: "Edel ekibinin dosya deposu. Yükle, paylaş, birlikte çalış.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-bg font-sans antialiased">{children}</body>
    </html>
  );
}
