import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* Metadata file conventions take precedence over the /[city] catch-all, so
   /robots.txt serves this instead of the landing page HTML. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* Session-gated role shells carry no indexable content. */
        disallow: ["/dashboard"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}