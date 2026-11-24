"use client";
import { useEffect, useRef, useState } from "react";
import type { BlockExtras } from "@/lib/types";
import { registry } from "@/components/blocks/registry";
import { isWordPressOrigin, relativeMedia } from "@/lib/media";

type Msg = { type: "adamson:render"; block: string; data: Record<string, unknown> };

/**
 * Live preview for the WordPress editor. WordPress sends the block's current
 * data on every change; we render the real component and report our height.
 */
export default function BlockPreview({ wpOrigin }: { wpOrigin: string }) {
  const [msg, setMsg] = useState<Msg | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // WordPress may be opened as localhost or by its network address (a teammate):
    // accept the editor on any host, as long as it's WordPress's port.
    const onMessage = (e: MessageEvent) => {
      if (!isWordPressOrigin(e.origin, wpOrigin) || e.data?.type !== "adamson:render") return;
      const m = e.data as Msg;
      setMsg({ ...m, data: relativeMedia(m.data) });
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "adamson:ready" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [wpOrigin]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const send = () => window.parent.postMessage({ type: "adamson:height", height: Math.ceil(el.scrollHeight) }, "*");
    send();
    const ro = new ResizeObserver(send);
    ro.observe(el);
    return () => ro.disconnect();
  }, [msg]);

  // Blocks that show products or posts get them from the live site's data.
  const [extras, setExtras] = useState<BlockExtras | undefined>(undefined);
  const needs = (msg ? registry[msg.block]?.needs ?? [] : []).join(",");
  useEffect(() => {
    if (!needs) return;
    let live = true;
    fetch(`/api/block-extras?needs=${needs}`)
      .then((r) => r.json())
      .then((x: BlockExtras) => live && setExtras(x))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [needs]);

  const entry = msg ? registry[msg.block] : null;
  const Component = entry?.component;
  return (
    <div ref={root} className="min-h-24">
      {Component ? <Component data={msg?.data ?? {}} extras={needs ? extras : undefined} preview /> : null}
    </div>
  );
}
