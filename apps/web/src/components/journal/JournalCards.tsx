/* Journal cards: horizontal featured variant and vertical grid variant,
   shared by the listing page and the related-posts row. */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n";
import type { Lang } from "@/i18n";
import type { Post } from "@/lib/journal";

const DATE_LOCALE: Record<Lang, string> = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };

export function formatDate(date: string, lang: Lang): string {
  return new Date(date + "T00:00:00").toLocaleDateString(DATE_LOCALE[lang], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function CategoryPill({ category }: { category: Post["category"] }) {
  const { t } = useI18n();
  return (
    <span className="inline-block w-fit rounded-pill bg-saffron/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-saffron">
      {t("jn.cat." + category)}
    </span>
  );
}

export function PostMeta({ post }: { post: Post }) {
  const { t, lang } = useI18n();
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
      <span>{formatDate(post.date, lang)}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1.5">
        <ClockIcon />
        {t("jn.min", { mins: post.readMins })}
      </span>
    </p>
  );
}

export function PostCard({ post }: { post: Post }) {
  const { lang } = useI18n();
  return (
    <Link
      href={"/blog/" + post.slug}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-chuna">
        <Image
          src={post.cover}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <CategoryPill category={post.category} />
        <h3 className="text-lg font-extrabold leading-snug text-navy transition-colors group-hover:text-saffron">
          {post.title[lang]}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt[lang]}</p>
        <div className="mt-auto pt-2">
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  );
}

export function FeaturedCard({ post }: { post: Post }) {
  const { lang } = useI18n();
  return (
    <Link
      href={"/blog/" + post.slug}
      className="group grid overflow-hidden rounded-card border border-line bg-white shadow-card transition-transform hover:-translate-y-1 md:grid-cols-2"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-chuna md:aspect-auto md:min-h-[300px]">
        <Image
          src={post.cover}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <CategoryPill category={post.category} />
        <h3 className="text-2xl font-black leading-tight text-navy transition-colors group-hover:text-saffron">
          {post.title[lang]}
        </h3>
        <p className="text-sm leading-relaxed text-muted">{post.excerpt[lang]}</p>
        <div className="mt-auto pt-2">
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  );
}