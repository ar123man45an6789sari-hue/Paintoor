/* Journal article: back link, header, author row, cover banner, structured
   body blocks, a dark CTA card mid-article and a related-posts row. */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { POSTS } from "@/lib/journal";
import type { Block } from "@/lib/journal";
import { CategoryPill, PostCard, PostMeta } from "./JournalCards";

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function BodyBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "h2") {
          return (
            <h2 key={i} className="pt-5 text-2xl font-black text-navy">
              {b.text}
            </h2>
          );
        }
        if (b.kind === "h3") {
          return (
            <h3 key={i} className="pt-3 text-lg font-extrabold text-navy">
              {b.text}
            </h3>
          );
        }
        if (b.kind === "quote") {
          return (
            <blockquote
              key={i}
              className="rounded-r-card border-l-4 border-saffron bg-chuna px-6 py-5 font-serif text-lg italic leading-relaxed text-ink"
            >
              {b.text}
            </blockquote>
          );
        }
        if (b.kind === "ul") {
          return (
            <ul key={i} className="space-y-3">
              {b.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 leading-relaxed text-ink">
                  <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-saffron" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.kind === "ol") {
          return (
            <ol key={i} className="space-y-3">
              {b.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 leading-relaxed text-ink">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-saffron text-[11px] font-black text-snow">
                    {j + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-ink">
            {b.text}
          </p>
        );
      })}
    </>
  );
}

function CtaCard() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden rounded-sheet bg-raatri px-6 py-12 text-center md:px-10 md:py-14">
      <span
        className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-saffron/25 blur-3xl"
        aria-hidden="true"
      />
      <h2 className="relative text-2xl font-black text-snow md:text-3xl">{t("jn.ctaH")}</h2>
      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-transform hover:-translate-y-0.5 hover:shadow-lift"
        >
          {t("jn.cta1")}
        </Link>
        <Link
          href="/partners"
          className="rounded-control border-2 border-snow/40 px-6 py-3 text-sm font-extrabold text-snow transition-colors hover:border-snow"
        >
          {t("jn.cta2")}
        </Link>
      </div>
    </section>
  );
}

export function JournalArticle({ slug }: { slug: string }) {
  const { t, lang } = useI18n();
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return null;

  const written = post.body[lang].length > 0 ? post.body[lang] : post.body.en;
  const splitAt = Math.ceil(written.length / 2);
  const related = [
    ...POSTS.filter((p) => p.slug !== slug && p.category === post.category),
    ...POSTS.filter((p) => p.slug !== slug && p.category !== post.category),
  ].slice(0, 3);

  return (
    <div className="px-4 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-muted transition-colors hover:text-saffron"
        >
          <ArrowLeftIcon />
          {t("jn.back")}
        </Link>

        <header className="mx-auto mt-8 max-w-3xl">
          <CategoryPill category={post.category} />
          <h1 className="mt-4 text-3xl font-black leading-tight text-navy md:text-5xl">
            {post.title[lang]}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt[lang]}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-line py-4">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full bg-saffron/10 text-sm font-black text-saffron"
              aria-hidden="true"
            >
              PS
            </span>
            <span>
              <span className="block text-sm font-extrabold text-navy">
                {t("jn.by")} {t("jn.author")}
              </span>
              <span className="block text-xs font-semibold text-muted">{t("jn.role")}</span>
            </span>
            <span className="ml-auto">
              <PostMeta post={post} />
            </span>
          </div>
        </header>

        <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden rounded-sheet bg-chuna">
          <Image src={post.cover} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>

        <article className="mx-auto mt-10 max-w-3xl space-y-5 text-[15px] md:text-base">
          <BodyBlocks blocks={written.slice(0, splitAt)} />
          <div className="pt-4">
            <CtaCard />
          </div>
          <BodyBlocks blocks={written.slice(splitAt)} />
        </article>

        <section className="mt-16 md:mt-24">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
            {t("jn.more")}
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}