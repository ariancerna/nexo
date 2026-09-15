import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexo",
    short_name: "Nexo",
    description: "Hub digital personal para organizar tu vida desde una sola aplicación.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f9fe",
    theme_color: "#4f46e5",
    orientation: "portrait",
    categories: ["productivity", "utilities"],
    lang: "es",
    icons: [
      {
        src: "/icons/nexo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
