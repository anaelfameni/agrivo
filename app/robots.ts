import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/api/"] },
    sitemap: "https://agrivo-io.vercel.app/sitemap.xml",
  };
}
