"use client";
// Shows a page (same origin) at the 1680px desktop design width, scaled down to
// fit the docs column, with its real height.
import { useEffect, useRef, useState } from "react";

const DESIGN_WIDTH = 1680;

export default function ScaledFrame({ src, title }: { src: string; title: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(800);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / DESIGN_WIDTH);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onLoad = () => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    const update = () => setHeight(Math.max(200, doc.documentElement.scrollHeight));
    update();
    new ResizeObserver(update).observe(doc.body);
  };

  return (
    <div ref={wrap} className="relative overflow-hidden rounded-lg border border-line-subtle bg-page" style={{ height: height * scale }}>
      <iframe
        ref={frame}
        src={src}
        title={title}
        loading="lazy"
        onLoad={onLoad}
        className="block origin-top-left border-0"
        style={{ width: DESIGN_WIDTH, height, transform: `scale(${scale})` }}
      />
    </div>
  );
}
