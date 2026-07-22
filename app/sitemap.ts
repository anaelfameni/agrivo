import type { MetadataRoute } from "next";

const BASE = "https://agrivo-io.vercel.app";
const ROUTES = ["", "/methodologie", "/a-propos", "/tarifs", "/faq", "/contact", "/aide", "/verifier-certificat", "/status", "/confidentialite", "/cgu", "/mentions-legales", "/marketplace", "/marketplace/vendre", "/vos-donnees", "/cacao-rdue-cote-divoire", "/application"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({
    url: `${BASE}${r || "/"}`,
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : 0.6,
  }));
}
