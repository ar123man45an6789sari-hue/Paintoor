import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLiveSkill, seed } from "@paintoor/mock-api";
import { nameFromSlug, slugify } from "@/lib/city";
import { isIndianSlug } from "@/lib/india";
import { SITE_URL } from "@/lib/site";
import { CinematicHero, PulseBand } from "@/components/home/HeroMotion";
import { LandingSections } from "@/components/home/LandingSections";
import { SessionGate } from "@/components/home/SessionGate";

type Params = { city: string };

/* Cities Paintoor can actually book today, derived from the seed — the same
   source the hero badge, the marketplace dropdown, the post-job wizard and
   the sitemap read, so the four can never disagree. Pre-rendered at build. */
const SERVED = Array.from(
  new Set(seed.providers.filter((p) => p.skills.some(isLiveSkill)).map((p) => slugify(p.city))),
).sort();

export function generateStaticParams(): Params[] {
  return SERVED.map((city) => ({ city }));
}

/* Any other real Indian city still renders, built on demand. This must stay
   true — flipping it to false would 404 every city we have not seeded. */
export const dynamicParams = true;

const isServed = (slug: string) => SERVED.includes(slug.toLowerCase());

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { city } = await params;
  const slug = city.toLowerCase();

  /* Foreign or nonsense slug. The page calls notFound(), so this branch only
     has to stay harmless. */
  if (!isIndianSlug(slug)) return { robots: { index: false, follow: false } };

  const name = nameFromSlug(slug);

  if (isServed(slug)) {
    const description = `Verified painters in ${name}. Compare itemized quotes, pay safely into escrow, and release the money only after you approve the work.`;
    return {
      title: `Painting services in ${name}`,
      description,
      alternates: { canonical: `/${slug}` },
      openGraph: {
        type: "website",
        title: `Painting services in ${name}`,
        description,
        url: `${SITE_URL}/${slug}`,
      },
    };
  }

  /* India, not live yet. The shared link keeps working — important, because
     most of this traffic arrives over WhatsApp — but the page stays out of
     the index and points crawlers at the homepage instead of letting a
     thousand near-identical city pages compete with each other. */
  const description = `Paintoor is not live in ${name} yet. See the cities where verified painters can be booked today.`;
  return {
    title: `Home painting in ${name}`,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: "/" },
    openGraph: { type: "website", title: `Home painting in ${name}`, description },
  };
}

/** City landing: the marketing page with the visitor's city in the URL, e.g.
    paintoor.in/mumbai. Paintoor is built for all of India, so every real
    Indian city renders — NavSearch adopts the slug on mount and keeps it in
    sync with the detected or picked place. Anything outside India, or a
    nonsense slug, gets a real 404 rather than an indexable duplicate. */
export default async function CityPage({ params }: { params: Promise<Params> }) {
  const { city } = await params;
  if (!isIndianSlug(city)) notFound();

  return (
    <>
      <SessionGate />
      <CinematicHero />
      <PulseBand />
      <LandingSections />
    </>
  );
}