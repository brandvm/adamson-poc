"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { BlockProps, Link, Media } from "@/lib/types";
import Button from "@/components/ui/Button";
import Img from "@/components/ui/Img";
import SectionHeader from "@/components/ui/SectionHeader";

// 10 Featured videos (Figma 463:1072): stage/smoke background with light beams,
// stacked header on the left and "Card / Video" cards on the right. YouTube,
// Vimeo and direct video files play in a modal <dialog>; other links open in a
// new tab (and so does any card when JS is off or opened with a modifier key).

type Video = { thumbnail: Media; title: string; credit: string; duration: string; url: string };
type Data = {
  eyebrow: string;
  title: string;
  description: string;
  button: Link;
  background: Media;
  cardLabel: string;
  videos: Partial<Video>[];
};

type Embed = { kind: "iframe" | "video"; src: string; title: string };

function toEmbed(url: string | undefined, title: string): Embed | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url, "https://example.invalid");
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] ?? null;
  }
  if (id && /^[\w-]{6,}$/.test(id)) {
    return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`, title };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const vid = u.pathname.match(/(\d{5,})/)?.[1];
    if (vid) return { kind: "iframe", src: `https://player.vimeo.com/video/${vid}?autoplay=1`, title };
  }
  if (/\.(mp4|webm|ogv|mov)$/i.test(u.pathname)) return { kind: "video", src: url, title };
  return null;
}

const secondaryText = "type-body-s text-subtle";

export default function Videos({ data }: BlockProps<Data>) {
  const videos = (data.videos ?? []).filter((v) => v && (v.title || v.thumbnail?.url));
  const cardLabel = data.cardLabel ?? "Video";
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Embed | null>(null);

  const open = (e: MouseEvent<HTMLAnchorElement>, embed: Embed | null) => {
    if (!embed || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setActive(embed);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  return (
    <section className="relative overflow-hidden bg-page">
      {/* Background: stage photo at 50%, faded to black, plus mirrored light beams */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="site-container relative h-full">
          {data.background?.url && (
            <div className="absolute top-[-6rem] left-[-31.75rem] h-[71.9375rem] w-[124.125rem] max-lg:inset-0 max-lg:size-full">
              <Img media={data.background} alt="" className="absolute inset-0 size-full object-cover opacity-50" />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgb(0 0 0 / 0) 46.5%, rgb(0 0 0) 100%), linear-gradient(180deg, rgb(0 0 0 / 0.9) 8.11%, rgb(0 0 0 / 0) 74.73%)",
                }}
              />
            </div>
          )}
          <img
            src="/design/videos/lights.svg"
            alt=""
            width={895.672}
            height={1020.22}
            className="absolute top-[-11.7875rem] left-[70.4625rem] h-[63.7638rem] w-[55.9795rem] -scale-x-100 max-lg:top-[-6rem] max-lg:left-[35%] max-lg:h-[36rem] max-lg:w-[31.6rem] md:max-lg:left-[45%]"
          />
        </div>
      </div>

      <div className="site-container relative flex items-start justify-between gap-12 px-margin pt-section pb-[4.9375rem] max-lg:flex-col max-lg:gap-10 max-lg:pb-section">
        {/* Section header (stacked) */}
        <div className="flex w-[27.5rem] shrink-0 flex-col items-start gap-6 max-lg:w-full">
          <div className="flex flex-col gap-4">
            <SectionHeader layout="stacked" size="h2" eyebrow={data.eyebrow} title={data.title} />
            {data.description && <p className={`${secondaryText} w-[20.625rem] max-lg:w-auto max-lg:max-w-[28rem]`}>{data.description}</p>}
          </div>
          <Button link={data.button} variant="secondary" />
        </div>

        {/* Video cards */}
        {videos.length > 0 && (
          <ul className="flex w-[47.25rem] shrink-0 flex-col gap-[1.375rem] max-lg:w-full max-lg:gap-4">
            {videos.map((v, i) => {
              const embed = toEmbed(v.url, v.title ?? "Video");
              const body = (
                <>
                  <div className="relative h-[16.25rem] w-[21.9375rem] shrink-0 overflow-hidden bg-page max-lg:h-auto max-lg:min-h-[12rem] max-lg:w-[45%] max-md:aspect-video max-md:min-h-0 max-md:w-full">
                    <Img
                      media={v.thumbnail}
                      className="absolute top-0 left-0 h-full w-[23.0625rem] object-cover max-lg:w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                    <span className="absolute inset-0 m-auto flex size-[3.25rem] items-center justify-center rounded-full border border-action-secondary-border-hover bg-action-secondary-hover backdrop-blur-[5px] transition-colors duration-200 group-hover:bg-gold/60">
                      <img src="/design/videos/play.svg" alt="" width={18} height={18} className="size-[1.125rem]" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-3 px-7 pt-7 pb-[1.875rem] max-lg:flex-1 max-md:px-5 max-md:pt-5 max-md:pb-6">
                    {cardLabel && <span className="type-eyebrow text-gold">{cardLabel}</span>}
                    {v.title && <h3 className="type-h5 text-ink">{v.title}</h3>}
                    {v.credit && <p className={secondaryText}>{v.credit}</p>}
                    {v.duration && (
                      <div className="pt-2.5">
                        <p className={`${secondaryText} border-t border-line-subtle pt-[1.125rem]`}>
                          <span className="sr-only">Duration: </span>
                          {v.duration}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              );
              const cardClass =
                "group relative flex overflow-hidden rounded-lg border border-line-subtle bg-black transition-colors duration-200 max-md:flex-col";
              return (
                <li key={i}>
                  {v.url ? (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-haspopup={embed ? "dialog" : undefined}
                      onClick={(e) => open(e, embed)}
                      className={`${cardClass} hover:border-action-secondary-border-hover focus-visible:border-action-secondary-border-hover focus-visible:outline-none`}
                    >
                      {body}
                    </a>
                  ) : (
                    <div className={cardClass}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Video modal */}
      <dialog
        ref={dialog}
        aria-label={active?.title}
        data-lenis-prevent
        onClose={() => setActive(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 text-ink backdrop:bg-black/85 backdrop:backdrop-blur-[10px]"
      >
        <div className="relative w-[min(90vw,80rem)] max-lg:w-[min(calc(100vw-2.5rem),calc((100svh-9rem)*16/9))]">
          <button
            type="button"
            onClick={close}
            aria-label="Close video"
            className="absolute -top-14 right-0 flex size-11 items-center justify-center rounded-full border border-line bg-action-secondary backdrop-blur-[5px] transition-colors duration-200 hover:border-action-secondary-border-hover hover:bg-action-secondary-hover"
          >
            <svg viewBox="0 0 14 14" aria-hidden className="size-[0.875rem]" fill="none" stroke="currentColor" strokeWidth="1.3125" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            {active?.kind === "iframe" && (
              <iframe
                src={active.src}
                title={active.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="size-full border-0"
              />
            )}
            {active?.kind === "video" && <video src={active.src} controls autoPlay playsInline className="size-full" />}
          </div>
        </div>
      </dialog>
    </section>
  );
}
