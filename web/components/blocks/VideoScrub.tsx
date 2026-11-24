"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { BlockProps, Media } from "@/lib/types";
import { Eyebrow } from "@/components/ui/SectionHeader";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useMedia } from "@/components/motion/useMedia";

type Overlay = { title?: string; text?: string; start?: number; end?: number; position?: "left" | "right" | "center" | "top-left" | "bottom-right" };
type Data = { video: Media; mobileVideo: Media; videoFallback?: Media; poster: Media; length: number; eyebrow: string; overlays: Overlay[] };

const FADE = 4; // % of scroll used to fade an overlay in/out

function overlayOpacity(o: Overlay, progress: number) {
  const s = Number(o.start ?? 0);
  const e = Number(o.end ?? 100);
  if (progress < s - FADE || progress > e + FADE) return 0;
  if (progress < s) return (progress - (s - FADE)) / FADE;
  if (progress > e) return 1 - (progress - e) / FADE;
  return 1;
}

const place: Record<string, string> = {
  left: "bottom-24 left-margin items-start text-left",
  right: "bottom-24 right-margin items-end text-right",
  center: "bottom-24 inset-x-0 mx-auto items-center text-center",
  // Corners keep the text clear of a product centred in the video.
  "top-left": "top-32 left-margin items-start text-left",
  "bottom-right": "bottom-24 right-margin items-end text-right",
};

// Below lg every overlay stacks centred, narrower, whatever its desktop position.
const overlaySm = "max-lg:top-auto max-lg:inset-x-margin max-lg:bottom-20 max-lg:mx-auto max-lg:max-w-[22rem] max-lg:items-center max-lg:text-center";

/**
 * Video scrub: the video's playback position follows the scroll position.
 * The section is `length` screens tall; the video stays pinned (sticky) while
 * GSAP ScrollTrigger maps scroll progress to video time. Text overlays fade in
 * and out at the scroll percentages editors set. Reduced motion and the editor
 * preview show the poster with the first overlay instead.
 */
export default function VideoScrub({ data, preview }: BlockProps<Data>) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const mobile = useMedia("(max-width: 768px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const src = mobile && data.mobileVideo?.url ? data.mobileVideo.url : data.video?.url;
  const still = Boolean(preview) || reduced || !data.video?.url; // poster-only resting state
  const overlays = (data.overlays ?? []).filter((o) => o?.title || o?.text);
  const length = Math.max(1.5, Number(data.length) || 3);

  useEffect(() => {
    const el = section.current;
    const v = video.current;
    if (still || !el || !v) return;

    // iOS Safari only allows seeking after the video has been "played" once.
    const unlock = () => v.play().then(() => v.pause()).catch(() => {});
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    const target = { time: 0 };
    let trigger: ScrollTrigger | undefined;
    const setup = () => {
      trigger?.kill();
      trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          setProgress(self.progress * 100);
          // Ease towards the target time so seeking looks smooth between keyframes.
          gsap.to(target, {
            time: self.progress * (v.duration || 0),
            duration: 0.15,
            ease: "none",
            overwrite: true,
            onUpdate: () => {
              if (Math.abs(v.currentTime - target.time) > 0.01) v.currentTime = target.time;
            },
          });
        },
      });
      // Start on the frame that matches the current scroll position (e.g. after a reload mid-section).
      if (trigger && v.duration) v.currentTime = trigger.progress * v.duration;
    };
    if (v.readyState >= 1) setup();
    else v.addEventListener("loadedmetadata", setup, { once: true });

    return () => {
      window.removeEventListener("touchstart", unlock);
      v.removeEventListener("loadedmetadata", setup);
      trigger?.kill();
    };
  }, [still, src]);

  if (!data.video?.url && !data.poster?.url) {
    return preview ? (
      <section className="flex h-[30rem] items-center justify-center bg-raised text-muted type-body-m">
        Video scrub: upload a video in the block settings.
      </section>
    ) : null;
  }

  // Resting state: poster + overlays, no scroll animation.
  if (still) {
    if (!preview && !data.video?.url) return null; // nothing to scrub on the live site yet
    const first = overlays[0];
    return (
      <section className="relative h-screen min-h-[40rem] overflow-hidden bg-page max-lg:h-[100svh] max-lg:min-h-[32rem]">
        {data.poster?.url && (
          <img src={data.poster.url} alt={data.poster.alt ?? ""} className="absolute inset-0 size-full object-contain" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        {data.eyebrow && <Eyebrow className="absolute left-margin top-16 max-lg:top-10">{data.eyebrow}</Eyebrow>}
        {first && (
          <div className={`absolute flex max-w-[28rem] flex-col gap-3 ${place[first.position ?? "left"]} ${overlaySm}`}>
            {first.title && <h2 className="type-h3 text-ink">{first.title}</h2>}
            {first.text && <p className="type-body-l text-muted max-lg:type-body-m">{first.text}</p>}
          </div>
        )}
        {preview && !data.video?.url && (
          <p className="absolute right-margin top-16 rounded-full max-lg:top-20 bg-black/60 px-4 py-2 type-body-xs text-ink">
            No video yet: showing the poster
          </p>
        )}
      </section>
    );
  }

  return (
    <section ref={section} className="relative bg-page" style={{ height: `${length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden max-lg:h-[100svh]">
        {/* key: reload when the source changes (mobile/desktop). A transparent WebM comes first;
            the MP4 fallback (product on black) is for browsers without WebM. */}
        <video
          key={src}
          ref={video}
          // No poster here: the poster is the final (exploded) frame for the reduced-motion still,
          // so showing it before the video loads made the section jump back to frame 0.
          muted
          playsInline
          preload="auto"
          aria-label={data.poster?.alt || "Product animation"}
          className="absolute inset-0 size-full object-contain"
        >
          {src && <source src={src} type={/\.webm($|\?)/i.test(src) ? "video/webm" : "video/mp4"} />}
          {data.videoFallback?.url && <source src={data.videoFallback.url} type="video/mp4" />}
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        {data.eyebrow && <Eyebrow className="absolute left-margin top-16 max-lg:top-10">{data.eyebrow}</Eyebrow>}
        {overlays.map((o, i) => {
          const opacity = overlayOpacity(o, progress);
          return (
            <div
              key={i}
              className={`absolute flex max-w-[28rem] flex-col gap-3 transition-transform duration-500 ${place[o.position ?? "left"]} ${overlaySm}`}
              style={{ opacity, transform: `translateY(${(1 - opacity) * 1.5}rem)`, pointerEvents: opacity > 0.5 ? "auto" : "none" }}
              aria-hidden={opacity < 0.5}
            >
              {o.title && <h2 className="type-h3 text-ink">{o.title}</h2>}
              {o.text && <p className="type-body-l text-muted max-lg:type-body-m">{o.text}</p>}
            </div>
          );
        })}
        <div className="absolute bottom-10 left-margin right-margin h-px bg-line-subtle">
          <div className="h-px bg-gold" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
