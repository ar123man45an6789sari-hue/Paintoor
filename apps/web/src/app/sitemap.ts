import type { MetadataRoute } from "next";
import { liveProviders } from "@paintoor/mock-api";
import { slugify } from "@/lib/city";
import { POSTS } from "@/lib/journal";
import { SITE_URL } from "@/lib/site";

/** City slugs come from the shared launch list — the same source the city pages,
 *  the hero badge and the partner filters read — so the sitemap can never
 *  advertise a city the app cannot actually serve. */
const CITY_SLUGS = Array.from(new Set(liveProviders.map((p) => slugify(p.city)))).sort();

export default function sitemap(): MetadataRoute.Sitemap {
  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/studio`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/marketplace`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/partners`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refund`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const cities: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const posts: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...statics, ...cities, ...posts];
}