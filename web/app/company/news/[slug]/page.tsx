import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/site/Shell";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import { getPost, getPosts } from "@/lib/wp";
import Link from "next/link";

// News article TEMPLATE (sitemap: "46 articles move over as they are").
// Content: WordPress → Posts (title, featured image, content, tag = type).

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: `${post.title} · Adamson`, description: post.excerpt } : { title: "News · Adamson" };
}

export default async function NewsArticle({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const more = (await getPosts(4).catch(() => [])).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <Shell>
      <article className="bg-white text-black">
        <header className="site-container flex flex-col gap-6 px-margin pt-section pb-12">
          <nav aria-label="Breadcrumb" className="type-body-xs text-secondary">
            <Link href="/company" className="hover:text-black">Company</Link> / <Link href="/company/news" className="hover:text-black">News</Link>
          </nav>
          <div className="flex items-center gap-3 type-body-xs text-secondary">
            {post.type && <span className="type-tag rounded-full border border-black/14 px-3 py-[0.4375rem] text-black">{post.type}</span>}
            <time dateTime={post.dateIso}>{post.date}</time>
          </div>
          <h1 className="max-w-[60rem] type-h1">{post.title}</h1>
          {post.excerpt && <p className="max-w-[44rem] type-body-l text-secondary">{post.excerpt}</p>}
        </header>
        {post.image?.url && (
          <div className="site-container px-5 max-lg:px-3">
            <div className="relative aspect-[16/8] overflow-hidden rounded-lg bg-black/5 max-md:aspect-[4/3]">
              <Img media={post.image} eager className="absolute inset-0 size-full object-cover" />
            </div>
          </div>
        )}
        <div className="site-container px-margin py-section">
          <div
            className="mx-auto flex max-w-[44rem] flex-col gap-6 type-body-l text-secondary [&_a]:text-gold [&_a]:underline [&_h2]:type-h4 [&_h2]:text-black [&_h3]:type-h5 [&_h3]:text-black [&_img]:rounded-md [&_li]:ml-5 [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
          />
          <div className="mx-auto mt-12 flex max-w-[44rem] border-t border-black/10 pt-8">
            <Button href="/company/news" label="All news" variant="secondary-light" />
          </div>
        </div>
      </article>
      {more.length > 0 && (
        <section className="bg-page text-ink">
          <div className="site-container flex flex-col gap-10 px-margin py-section">
            <h2 className="type-h3">More news</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {more.map((p) => (
                <a key={p.id} href={`/company/news/${p.slug}`} className="group flex min-w-0 flex-col gap-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-raised">
                    <Img media={p.image} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105" />
                  </div>
                  <span className="type-body-xs text-muted">{[p.type, p.date].filter(Boolean).join(" · ")}</span>
                  <h3 className="type-h5 group-hover:text-accent">{p.title}</h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </Shell>
  );
}

export const instant = false;
