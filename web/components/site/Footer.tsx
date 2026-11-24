/* eslint-disable @next/next/no-img-element */
import { Fragment } from "react";
import NextLink from "next/link";
import type { Media, SiteSettings } from "@/lib/types";
import Img from "@/components/ui/Img";

/**
 * Figma "Footer" (486:399): logo + address, link columns, newsletter sign-up,
 * social buttons, copyright and legal links. Content from Site settings → Footer.
 * Below lg everything stacks: logo + contact, link columns (2 per row, 3 on
 * tablets), newsletter full width, social row, then copyright and wrapped legal
 * links. Links get ≥ 40px tap height there.
 */
type FooterLink = { label?: string; url?: string };
type SocialPlatform = "linkedin" | "instagram" | "facebook" | "youtube";

export type FooterSettings = {
  logo?: Media;
  address?: string;
  phone?: string;
  columns?: { title?: string; links?: FooterLink[] }[];
  newsletter?: { title?: string; text?: string; placeholder?: string; button?: string; action?: string };
  social?: { platform?: SocialPlatform | string; url?: string }[];
  copyright?: string;
  legal?: FooterLink[];
};

const SOCIAL: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};
const isPlatform = (p?: string): p is SocialPlatform => !!p && p in SOCIAL;
const external = (url?: string) => (url && /^https?:\/\//.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {});

const accent = "type-footer text-accent";
const linkClass = "type-body-s text-subtle transition-colors duration-200 hover:text-ink max-lg:py-2.5";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const f = (settings.footer ?? {}) as FooterSettings;
  const columns = f.columns ?? [];
  const social = (f.social ?? []).filter((s) => isPlatform(s.platform) && s.url);
  const legal = (f.legal ?? []).filter((l) => l.label);
  const nl = f.newsletter ?? {};
  const tel = f.phone?.replace(/[^\d+]/g, "");

  return (
    <footer className="border-t border-line bg-page">
      <div className="site-container flex flex-col gap-20 px-margin pt-20 pb-10 max-lg:gap-12 max-lg:pt-14 max-lg:pb-8">
        <div className="flex items-start justify-between pt-9 max-lg:flex-col max-lg:gap-10 max-lg:pt-0">
          {/* Logo + address */}
          <div className="flex w-[21.25rem] flex-col gap-[0.875rem] max-lg:w-full max-lg:max-w-[21.25rem]">
            <NextLink href="/" aria-label="Home" className="block size-[7.0625rem] max-lg:size-24">
              <Img media={f.logo} className="size-full object-cover" />
            </NextLink>
            {(f.address || f.phone) && (
              <address className="type-body-s whitespace-pre-line text-muted not-italic">
                {f.address}
                {f.address && f.phone && "\n"}
                {f.phone && (
                  <a href={`tel:${tel}`} className="transition-colors duration-200 hover:text-ink max-lg:inline-block max-lg:py-2.5">
                    {f.phone}
                  </a>
                )}
              </address>
            )}
          </div>

          {/* Link columns */}
          {columns.length > 0 && (
            <nav aria-label="Footer" className="flex items-start gap-16 max-lg:grid max-lg:w-full max-lg:grid-cols-2 max-lg:gap-x-6 max-lg:gap-y-8 md:max-lg:grid-cols-3">
              {columns.map((col, i) => (
                <div key={i} className="flex flex-col gap-3 max-lg:gap-0">
                  {col.title && <p className={`${accent} max-lg:mb-1.5`}>{col.title}</p>}
                  {(col.links ?? []).map((link, j) =>
                    link.label ? (
                      <a key={j} href={link.url || "#"} className={linkClass} {...external(link.url)}>
                        {link.label}
                      </a>
                    ) : null,
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Newsletter + social */}
          <div className="flex w-[21.5rem] flex-col gap-10 self-stretch max-lg:w-full max-lg:max-w-[36rem]">
            {(nl.title || nl.text || nl.button) && (
              <div className="flex flex-col gap-6">
                {(nl.title || nl.text) && (
                  <div className="flex flex-col gap-3">
                    {nl.title && <p className={accent}>{nl.title}</p>}
                    {nl.text && <p className="type-body-s text-muted">{nl.text}</p>}
                  </div>
                )}
                {nl.button && (
                  <form
                    action={nl.action || undefined}
                    method="post"
                    className="flex h-12 items-center justify-between gap-2 rounded-full border border-line py-[0.3125rem] pr-[0.3125rem] pl-5 transition-colors max-lg:h-[3.25rem] duration-200 focus-within:border-action-secondary-border-hover"
                  >
                    <label className="sr-only" htmlFor="footer-newsletter-email">
                      {nl.placeholder || "Email address"}
                    </label>
                    <input
                      id="footer-newsletter-email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder={nl.placeholder}
                      className="min-w-0 flex-1 bg-transparent type-body-s text-ink outline-none placeholder:text-muted max-lg:self-stretch max-lg:text-base"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-9 shrink-0 items-center max-lg:h-10 max-lg:px-5 justify-center rounded-full bg-white px-4 type-button text-black transition-colors duration-200 hover:bg-gold-50"
                    >
                      {nl.button}
                    </button>
                  </form>
                )}
              </div>
            )}

            {social.length > 0 && (
              <div className="flex items-start gap-[0.8125rem]">
                {social.map((s, i) => {
                  const platform = s.platform as SocialPlatform;
                  return (
                    <a
                      key={i}
                      href={s.url}
                      aria-label={SOCIAL[platform]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-11 items-center justify-center rounded-full border border-line bg-action-secondary backdrop-blur-[5px] transition-colors duration-200 hover:border-action-secondary-border-hover hover:bg-action-secondary-hover"
                    >
                      <img src={`/design/footer/${platform}.svg`} alt="" width={20} height={20} className="size-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-start justify-between gap-8 type-body-xs text-muted max-lg:flex-col max-lg:gap-3">
          {f.copyright ? <p>{f.copyright}</p> : <span />}
          {legal.length > 0 && (
            <p className="max-lg:-my-[0.6875rem] max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:gap-x-5">
              {legal.map((l, i) => (
                <Fragment key={i}>
                  {i > 0 && <span aria-hidden className="max-lg:hidden"> · </span>}
                  <a href={l.url || "#"} className="transition-colors duration-200 hover:text-ink max-lg:py-[0.6875rem]" {...external(l.url)}>
                    {l.label}
                  </a>
                </Fragment>
              ))}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
