/* One static route per journal post; params come from the content file. */
import type { Metadata } from "next";
import { JournalArticle } from "@/components/journal/JournalArticle";
import { POSTS } from "@/lib/journal";

type Params = { slug: string };

/* Only the slugs in the content file exist; anything else gets the branded 404. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Paintoor Journal" };
  return {
    title: post.title.en + " — Paintoor Journal",
    description: post.excerpt.en,
  };
}

export default async function JournalPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <JournalArticle slug={slug} />;
}