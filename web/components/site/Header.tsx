/* eslint-disable @next/next/no-img-element */
import NextLink from "next/link";
import type { SiteSettings } from "@/lib/types";
import Button from "@/components/ui/Button";
import Img from "@/components/ui/Img";
import MobileMenu from "./MobileMenu";

/** Figma "Header" (486:218): logo, nav links + search, Login, Contact Us. Content from Site settings. */
export default function Header({ settings }: { settings: SiteSettings }) {
  const nav = settings.nav ?? [];
  return (
    <header className="relative z-20 bg-page">
      <div className="site-container flex h-24 items-center justify-between px-12 max-lg:h-18 max-lg:px-margin">
        <NextLink href="/" className="relative z-[60] flex h-[3.625rem] w-[22.625rem] items-center max-lg:h-12 max-lg:w-auto" aria-label="Home">
          <Img media={settings.logo} eager className="size-[3.6875rem] object-cover max-lg:size-12" />
        </NextLink>

        <nav className="flex items-center gap-8 max-lg:hidden" aria-label="Main">
          {nav.map((item, i) => {
            if (!item.label) return null;
            const kids = (item.children ?? []).filter((c) => c?.label);
            return (
              // Dropdown opens on hover and on keyboard focus (focus-within); no script needed.
              <div key={i} className="group relative">
                <a
                  href={item.url || "#"}
                  aria-haspopup={kids.length ? "true" : undefined}
                  className="flex h-10 items-center gap-1.5 rounded-full px-3.5 type-nav text-ink transition-colors hover:bg-white/5"
                >
                  {item.label}
                  {item.dropdown && (
                    <img src="/icons/chevron-down.svg" alt="" width={12} height={12} className="size-3 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                  )}
                </a>
                {kids.length > 0 && (
                  <div className="invisible absolute left-1/2 top-full z-30 -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="grid w-[22rem] gap-1 rounded-md border border-line-subtle bg-raised/95 p-2 shadow-2xl backdrop-blur-[32px]">
                      {kids.map((c, k) => (
                        <li key={k}>
                          <a href={c.url || "#"} className="flex flex-col rounded-sm px-3.5 py-2.5 transition-colors hover:bg-white/5 focus-visible:bg-white/5">
                            <span className="type-body-s text-ink">{c.label}</span>
                            {c.text && <span className="type-body-xs text-muted">{c.text}</span>}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
          <button
            type="button"
            aria-label="Search"
            className="flex size-[2.375rem] items-center justify-center rounded-full backdrop-blur-[16px] transition-colors hover:bg-white/5"
          >
            <img src="/icons/search.svg" alt="" width={18} height={18} className="size-[1.125rem]" />
          </button>
        </nav>

        <div className="flex w-[22.625rem] items-center justify-end gap-2 max-lg:hidden">
          {settings.login?.label && (
            <a href={settings.login.url || "#"} className="flex h-9 items-center gap-2 rounded-full px-4 type-button text-ink hover:bg-white/5">
              <img src="/icons/user.svg" alt="" width={20} height={20} className="size-5" />
              {settings.login.label}
            </a>
          )}
          <Button link={settings.cta} variant="contrast" />
        </div>
        <MobileMenu settings={settings} />
      </div>
    </header>
  );
}
