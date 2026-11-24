"use client";
import { useEffect, useState } from "react";
import type { BlockProps, NewsPost } from "@/lib/types";
import SectionHeader from "@/components/ui/SectionHeader";
import Img from "@/components/ui/Img";
import { Pill } from "@/components/ui/FormField";

// News List (Company → News: press releases, launches and tours). Every
// published post, newest first, filterable by type (the post's tag in
// WordPress). The first post of the current filter is a wide feature card.
// Posts come from extras.allPosts; in the editor preview from /api/posts.

type Data = { anchor: string; eyebrow: string; heading: string; description: string; allLabel: string };

export const newsHref = (p: NewsPost) => (p.slug ? `/company/news/${p.slug}` : "#");

function Card({ post, feature = false }: { post: NewsPost; feature?: boolean }) {
  return (
    <a
      href={newsHref(post)}
      className={`group flex min-w-0 flex-col gap-4 ${feature ? "md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-12" : ""}`}
    >
      <div className={`relative w-full overflow-hidden rounded-lg bg-black/5 ${feature ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <Img media={post.image} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      </div>
      <div className={`flex flex-col gap-3 ${feature ? "lg:pb-4" : ""}`}>
        <div className="flex items-center gap-3 type-body-xs text-secondary">
          {post.type && <span className="type-tag rounded-full border border-black/14 px-3 py-[0.4375rem] text-black">{post.type}</span>}
          {post.date && <time>{post.date}</time>}
        </div>
        <h3 className={`${feature ? "type-h3" : "type-h5"} text-black group-hover:text-gold`}>{post.title}</h3>
        {post.excerpt && <p className={`type-body-s text-secondary ${feature ? "" : "line-clamp-2"}`}>{post.excerpt}</p>}
      </div>
    </a>
  );
}

export default function NewsList({ data, extras }: BlockProps<Data>) {
  const provided = extras?.allPosts;
  const [fetched, setFetched] = useState<NewsPost[] | null>(null);
  const all = data.allLabel || "All news";
  const [type, setType] = useState(all);

  useEffect(() => {
    if (provided) return;
    let cancelled = false;
    fetch("/api/posts?count=50")
      .then((r) => (r.ok ? (r.json() as Promise<NewsPost[]>) : []))
      .then((p) => !cancelled && setFetched(Array.isArray(p) ? p : []))
      .catch(() => !cancelled && setFetched([]));
    return () => {
      cancelled = true;
    };
  }, [provided]);

  const posts = provided ?? fetched ?? [];
  const types = [all, ...Array.from(new Set(posts.map((p) => p.type).filter((t): t is string => Boolean(t))))];
  const shown = type === all ? posts : posts.filter((p) => p.type === type);

  return (
    <section id={data.anchor || undefined} className="scroll-mt-24 bg-white text-black">
      <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
        <SectionHeader eyebrow={data.eyebrow} title={data.heading} description={data.description} tone="light" />
        {types.length > 2 && (
          <div className="-mx-margin flex gap-2 overflow-x-auto px-margin no-scrollbar" role="group" aria-label="Filter news">
            {types.map((t) => (
              <Pill key={t} tone="light" active={t === type} onClick={() => setType(t)}>{t}</Pill>
            ))}
          </div>
        )}
        {!provided && fetched === null ? (
          <div className="aspect-[16/7] animate-pulse rounded-lg bg-black/5" aria-hidden />
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((p, i) => <Card key={p.id ?? p.slug} post={p} feature={i === 0} />)}
          </div>
        )}
      </div>
    </section>
  );
}
