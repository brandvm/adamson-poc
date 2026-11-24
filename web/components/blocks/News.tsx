"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import type { BlockProps, Link, NewsPost } from "@/lib/types";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Img from "@/components/ui/Img";

/**
 * 11 News "Making Waves" (Figma 463:1137). Light section: section header and
 * the latest posts as square cards. Posts come from `extras.posts` on the page;
 * in the editor preview (no extras) they are fetched from /api/posts.
 */
type Data = {
  eyebrow: string;
  title: string;
  description: string;
  viewAll: Link;
  count: number;
};

// Below lg the cards become a horizontal swipe row that bleeds to the screen
// edges (one card + a peek on phones, two + a peek on tablets).
const ROW = "grid grid-cols-3 gap-x-4 gap-y-12 max-lg:-mx-margin max-lg:flex max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-margin max-lg:gap-3 max-lg:overflow-x-auto max-lg:px-margin no-scrollbar";
const ITEM = "max-lg:w-[80vw] max-lg:max-w-[22rem] max-lg:shrink-0 max-lg:snap-start md:max-lg:w-[44vw]";

function NewsCard({ post }: { post: NewsPost }) {
  return (
    <a href={post.slug ? `/company/news/${post.slug}` : "#"} className={`group flex flex-col gap-4 ${ITEM}`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-page">
        <Img
          media={post.image}
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-b from-transparent from-35% to-black/82" />
        {post.title && <h3 className="absolute inset-x-8 bottom-8 type-h4 text-ink max-lg:inset-x-5 max-lg:bottom-5">{post.title}</h3>}
      </div>
      <div className="flex items-center justify-between gap-4">
        {post.category ? (
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full border border-black/14">
              <img src="/design/news/author-icon.svg" alt="" width={13} height={11} className="h-[0.69921875rem] w-[0.8125rem]" />
            </span>
            <span className="type-body-s-strong text-black">{post.category}</span>
          </div>
        ) : (
          <span />
        )}
        {post.date && <time className="type-body-xs text-secondary">{post.date}</time>}
      </div>
    </a>
  );
}

export default function News({ data, extras }: BlockProps<Data>) {
  const count = Math.min(Math.max(Number(data.count) || 3, 1), 6);
  const provided = extras?.posts;
  const [fetched, setFetched] = useState<NewsPost[] | null>(null);

  // Editor preview: no extras, so load the latest posts from the app's API.
  useEffect(() => {
    if (provided) return;
    let cancelled = false;
    fetch(`/api/posts?count=${count}`)
      .then((res) => (res.ok ? (res.json() as Promise<NewsPost[]>) : []))
      .then((posts) => !cancelled && setFetched(Array.isArray(posts) ? posts : []))
      .catch(() => !cancelled && setFetched([]));
    return () => {
      cancelled = true;
    };
  }, [provided, count]);

  const posts = (provided ?? fetched ?? []).slice(0, count);
  const loading = !provided && fetched === null;

  return (
    <section className="bg-white text-black">
      <div className="site-container flex flex-col gap-16 px-margin py-section">
        <SectionHeader
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
          tone="light"
          action={data.viewAll?.label ? <Button link={data.viewAll} variant="secondary-light" /> : undefined}
        />
        {loading ? (
          <div className={ROW} aria-hidden>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className={`flex flex-col gap-4 ${ITEM}`}>
                <div className="aspect-square w-full animate-pulse rounded-lg bg-black/5" />
                <div className="h-7" />
              </div>
            ))}
          </div>
        ) : (
          posts.length > 0 && (
            <div className={ROW}>
              {posts.map((post) => (
                <NewsCard key={post.id ?? post.slug} post={post} />
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
}
