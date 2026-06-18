import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edel Drive",
  description: "Takımın için sınırsız, hızlı dosya deposu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
