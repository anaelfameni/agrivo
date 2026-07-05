import type { MetadataRoute } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} · Conformité RDUE`,
    short_name: BRAND_NAME,
    description: BRAND_TAGLINE,
    lang: "fr",
    start_url: "/app/dashboard",
    display: "standalone",
    background_color: "#0a1f14",
    theme_color: "#0a1f14",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
