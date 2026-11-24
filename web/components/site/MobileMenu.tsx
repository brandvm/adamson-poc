"use client";
/* eslint-disable @next/next/no-img-element */
// Header on tablets and phones (< 1024px): a menu button that opens a
// full-screen menu with the same links as the desktop navigation.
import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import Button from "@/components/ui/Button";

export default function MobileMenu({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const nav = (settings.nav ?? []).filter((n) => n.label);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.classList.add("lenis-stopped");
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <Button link={settings.cta} variant="contrast" />
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="relative z-[60] flex size-10 items-center justify-center rounded-full border border-line"
      >
        <span className="relative block h-3 w-4" aria-hidden>
          <span className={`absolute left-0 h-px w-4 bg-ink transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-1.5 h-px w-4 bg-ink transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 h-px w-4 bg-ink transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
        </span>
      </button>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-50 flex flex-col bg-page/95 px-margin pb-10 pt-24 backdrop-blur-[32px] transition-[opacity,visibility] duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        inert={!open}
      >
        <nav aria-label="Main" className="-mx-margin flex flex-col overflow-y-auto px-margin" data-lenis-prevent>
          {nav.map((item, i) => {
            const kids = (item.children ?? []).filter((c) => c?.label);
            return kids.length ? (
              <details key={i} className="group border-b border-line-subtle">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 type-h4 text-ink [&::-webkit-details-marker]:hidden">
                  {item.label}
                  <img src="/icons/chevron-down.svg" alt="" width={12} height={12} className="size-3 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="flex flex-col gap-1 pb-4">
                  {kids.map((c, k) => (
                    <li key={k}>
                      <a href={c.url || "#"} onClick={() => setOpen(false)} className="block py-1.5 type-body-l text-subtle hover:text-ink">
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <a
                key={i}
                href={item.url || "#"}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-line-subtle py-4 type-h4 text-ink"
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        {settings.login?.label && (
          <a href={settings.login.url || "#"} className="mt-8 flex items-center gap-2 type-button-l text-ink">
            <img src="/icons/user.svg" alt="" width={20} height={20} className="size-5" />
            {settings.login.label}
          </a>
        )}
        <div className="mt-auto">
          <Button link={settings.cta} variant="contrast" size="m" className="w-full" />
        </div>
      </div>
    </div>
  );
}
