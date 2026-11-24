"use client";
// Style guide sidebar (wf-template webflow-style-guide layout): numbered links
// to the sections, the one being read highlighted. Below 1024px it becomes a
// strip of links that scrolls sideways.
import { useEffect, useState } from "react";

export type NavItem = { id: string; label: string };

export default function DocsNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -75% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Style guide sections">
      <ol className="flex gap-1 max-lg:overflow-x-auto max-lg:no-scrollbar lg:flex-col">
        {items.map((item, i) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={`flex items-baseline gap-3 rounded-sm px-3 py-2 type-body-s transition-colors max-lg:whitespace-nowrap ${
                active === item.id ? "bg-white/8 text-ink" : "text-muted hover:text-subtle"
              }`}
            >
              <span className={`w-5 type-body-xs ${active === item.id ? "text-accent" : "text-secondary"}`}>{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
