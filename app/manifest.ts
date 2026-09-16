import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexo",
    short_name: "Nexo",
    description: "Hub digital personal para organizar tu vida desde una sola aplicación.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f7f9fe",
    theme_color: "#4f46e5",
    orientation: "portrait",
    categories: ["productivity", "utilities"],
    lang: "es",
    icons: [
      {
        src: "/icons/nexo-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/nexo-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
