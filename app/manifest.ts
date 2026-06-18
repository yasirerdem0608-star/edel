import type { MetadataRoute } from "next";

// Ana Ekrana Ekle / PWA manifest'i. Next bunu otomatik <link rel="manifest"> olarak bağlar.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Edel Drive",
    short_name: "Edel",
    description: "Edel ekibinin dosya deposu.",
    start_url: "/drive",
    display: "standalone",
    background_color: "#fffbf5",
    theme_color: "#ea580c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
