/* eslint-disable @next/next/no-img-element */
// Adamson style guide, in the fixed layout of brandvm/wf-template's
// webflow-style-guide skill: a numbered sidebar, ten sections in a fixed
// order, every item a row (Designer name, class, note | live specimen).
// Names follow wf-template conventions §3–4 (Title Case, component then part,
// "Is …" combos, G | / C | prefixes, D0–D6 type roles, Group/Name roles).
// Figma source: "◆ Design System" (node 480:2). Specimens are the site's real
// components with live WordPress content.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import SectionHeader, { Eyebrow } from "@/components/ui/SectionHeader";
import { SliderArrows, SliderCounter } from "@/components/ui/SliderControls";
import ArrowLink from "@/components/ui/ArrowLink";
import DocsNav from "@/components/docs/DocsNav";
import ScaledFrame from "@/components/docs/ScaledFrame";
import { getPage, getProducts } from "@/lib/wp";
import type { BlockInstance } from "@/lib/types";

export const metadata: Metadata = { title: "Style guide · Adamson", robots: { index: false, follow: false } };

/* ============================================================== data */

const GOLD = [["Premium Gold", "#8A6E4B"], ["50", "#F4F2EF"], ["100", "#E8E3DC"], ["200", "#DCD4CA"], ["300", "#CFC4B7"], ["400", "#C4B6A5"], ["500", "#B7A793"], ["600", "#AB9981"], ["700", "#9D896F"], ["800", "#937D5E"]];
const CHARCOAL = [["Charcoal Black", "#232323"], ["50", "#F1F2F2"], ["100", "#D6D7D8"], ["200", "#C0C1C2"], ["300", "#AAACAE"], ["400", "#949698"], ["500", "#7E8182"], ["600", "#686B6D"], ["700", "#525557"], ["800", "#3C3E3F"]];

/** Colors Semantic roles: wf-template name (Group/Name), Figma token, value per mode, class here. */
const ROLES: [wf: string, figma: string, dark: string, light: string, cls: string][] = [
  ["Background/Page", "bg/page", "#000000", "#FFFFFF", "bg-page · bg-white"],
  ["Background/Raised", "bg/raised", "#232323", "#F1F2F2", "bg-raised"],
  ["Background/Glass", "bg/glass", "rgb(0 0 0 / .24)", "rgb(0 0 0 / .04)", "bg-glass"],
  ["Background/Overlay", "bg/overlay", "rgb(0 0 0 / .6)", "rgb(0 0 0 / .6)", "bg-black/60"],
  ["Text/Primary", "text/primary", "#FFFFFF", "#000000", "text-ink · text-black"],
  ["Text/Secondary", "text/secondary", "#C0C1C2", "#686B6D", "text-subtle · text-secondary"],
  ["Text/Muted", "text/muted", "#7E8182", "#949698", "text-muted"],
  ["Text/Accent", "text/accent", "#AB9981", "#8A6E4B", "text-accent · text-gold"],
  ["Text/Inverse", "text/inverse", "#000000", "#FFFFFF", "—"],
  ["Border/Subtle", "border/subtle", "rgb(255 255 255 / .1)", "rgb(0 0 0 / .08)", "border-line-subtle"],
  ["Border/Default", "border/default", "rgb(255 255 255 / .2)", "rgb(0 0 0 / .14)", "border-line"],
  ["Button/Primary", "action/primary", "#8A6E4B", "#8A6E4B", "bg-gold"],
  ["Button/Primary Hover", "action/primary-hover", "#937D5E", "#937D5E", "—"],
  ["Button/Contrast", "action/contrast", "#FFFFFF", "#000000", "bg-white · bg-black"],
  ["Button/Contrast Hover", "action/contrast-hover", "#F1F2F2", "#232323", "bg-gold-50 · bg-raised"],
  ["Button/Secondary", "action/secondary", "rgb(157 137 111 / .04)", "transparent", "bg-action-secondary"],
  ["Button/Secondary Hover", "action/secondary-hover", "rgb(157 137 111 / .1)", "rgb(0 0 0 / .04)", "bg-action-secondary-hover"],
  ["Button/Secondary Border Hover", "action/secondary-border-hover", "rgb(157 137 111 / .4)", "rgb(0 0 0 / .14)", "border-action-secondary-border-hover"],
  ["Brand/Gold", "brand/gold", "#8A6E4B", "#8A6E4B", "text-gold · bg-gold"],
];

/** Type roles: wf-template name, class, Figma style, desktop spec, below-1024 spec, sample. */
const TYPE: [name: string, cls: string, figma: string, desk: string, mobile: string, sample: string][] = [
  ["D0", "d0", "Display/Wordmark", "296 / 0.86 · 400", "23vw", "ADAMSON"],
  ["Display XL", "display-xl", "Display/Number XL", "300 / 236 · 500 · −5%", "96 / 80", "2003"],
  ["Display L", "display-l", "Display/Number L", "200 / 180 · 400 · −5%", "80 / 72", "40"],
  ["Display M", "display-m", "Display/Number M", "100 / 110 · 400 · −5%", "52 / 56", "45+ Years"],
  ["D1", "d1", "Heading/H1", "96 / 90 · 400 · −3%", "44 / 46", "Products"],
  ["D2", "d2", "Heading/H2", "56 / 60 · 400 · −3%", "36 / 40", "Let’s connect"],
  ["D3", "d3", "Heading/H3", "40 / 46 · 400 · −2.5%", "28 / 34", "L’auditorium de la Maison"],
  ["D4", "d4", "Heading/H4", "32 / 38 · 400 · −2.5%", "24 / 30", "Applications"],
  ["D5", "d5", "Heading/H5", "24 / 30 · 400 · −2%", "20 / 26", "Professional Loudspeaker Systems"],
  ["D6", "d6", "Heading/H6", "20 / 26 · 400 · −1%", "18 / 24", "XG Integration Amplifiers"],
  ["Quote", "quote", "Body/Quote", "22 / 30 · 400", "18 / 26", "“The best delivery of high-mid I hear today.”"],
  ["Body L", "body-l", "Body/L", "18 / 26 · 400", "same", "Engineered in-house, from transducer to software."],
  ["Body", "body", "Body/M", "16 / 24 · 400", "same", "Designed and Manufactured in Canada."],
  ["Body S", "body-s", "Body/S", "14 / 20 · 400", "same", "Building loudspeakers since 1983."],
  ["Body XS", "body-xs", "Body/XS", "13 / 18 · 400", "same", "Oct 15, 2026 · Max peak SPL"],
  ["Label Text", "label-text", "Label/Eyebrow", "12 / 16 · 500 · +10% · caps", "same", "Loudspeakers"],
  ["Chip Text", "chip-text", "Label/Tag", "12 / 16 · 500 · −2%", "same", "Line Source"],
  ["Button Text", "button-text", "Label/Button", "14 / 1.1 · 500 · −2%", "same", "Explore Product"],
  ["Nav Link Text", "nav-link-text", "Label/Nav", "14 / 20 · 400 · −1%", "same", "Applications"],
];

const SPACE = [4, 8, 12, 16, 24, 32, 48, 64, 80, 120];

/* ============================================================== Sg frame */

const SECTIONS = [
  ["overview", "Overview", "What this page is and how to use it."],
  ["colors", "Colors", "Every brand color. Use them through the theme roles, not directly."],
  ["themes", "Themes", "Sections set the color mode; everything inside reads the roles and follows."],
  ["typography", "Typography", "Every type role, with its values per breakpoint. Use the class, never a raw size."],
  ["utilities", "Utilities", "Single-purpose classes that mirror a variable."],
  ["spacing", "Spacing, radius and layout", "The space scale, corner radii and page rhythm."],
  ["buttons", "Buttons and links", "Every button variant and link style, with its states."],
  ["form-elements", "Forms", "Inputs and the buttons that go with them."],
  ["components", "Components", "Shared components. Reuse one before you add a new class."],
  ["other-classes", "Other classes", "Classes not shown anywhere above, and what they are for."],
] as const;

function SgSection({ index, id, children }: { index: number; id: string; children: ReactNode }) {
  const [, title, intro] = SECTIONS[index];
  return (
    <section id={id} className="scroll-mt-6 border-t border-white/10 pt-14 first:border-t-0 first:pt-0">
      <p className="type-body-xs text-accent">{String(index + 1).padStart(2, "0")}</p>
      <h2 className="mt-2 type-h3 text-ink">{title}</h2>
      <p className="mt-3 max-w-[44rem] type-body-m text-subtle">{intro}</p>
      <div className="mt-8 flex flex-col">{children}</div>
    </section>
  );
}

/** One Sg Row: name, class and note on the left; the live specimen on the right. */
function SgRow({ name, cls, note, children }: { name: string; cls?: string | string[]; note?: ReactNode; children?: ReactNode }) {
  const classes = cls ? (Array.isArray(cls) ? cls : [cls]) : [];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-4 border-t border-white/8 py-7 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-2">
        <p className="type-body-s-strong text-ink">{name}</p>
        {classes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {classes.map((c) => <Chip key={c}>{c}</Chip>)}
          </div>
        )}
        {note && <div className="type-body-xs text-muted">{note}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-white/8 px-2.5 py-0.5 type-body-xs text-subtle">{children}</span>;
}

/** Specimens of controls sit on a panel; `light` shows the light theme. */
function Panel({ children, light = false, className = "" }: { children: ReactNode; light?: boolean; className?: string }) {
  return <div className={`flex min-h-24 flex-wrap items-center gap-4 rounded-md border p-6 ${light ? "border-black/10 bg-white text-black" : "border-white/10 bg-white/[0.03]"} ${className}`}>{children}</div>;
}

/** Sg Table: a sticky name column, then a column per mode or value. */
function SgTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-white/10">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-white/[0.04]">
            {head.map((h, i) => <th key={h} className={`px-4 py-3 type-body-xs font-medium text-muted ${i === 0 ? "sticky left-0 bg-[#0a0a0a]" : ""}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/8">
              {r.map((c, j) => <td key={j} className={`whitespace-nowrap px-4 py-2.5 type-body-s text-subtle ${j === 0 ? "sticky left-0 bg-page text-ink" : ""}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Dot = ({ color }: { color: string }) => <span className="inline-block size-4 shrink-0 rounded-full border border-white/20 align-middle" style={{ background: color }} />;

/* ============================================================== page */

export default async function StyleGuide() {
  const [page, products] = await Promise.all([getPage({ slug: "home" }).catch(() => null), getProducts().catch(() => [])]);
  const blocks: BlockInstance[] = page?.blocks ?? [];
  const photo = (blocks.find((b) => b.name === "adamson/products-in-action")?.data as { slides?: { background?: { url?: string } }[] } | undefined)?.slides?.[0]?.background?.url;

  return (
    <div className="bg-page">
      <div className="site-container grid grid-cols-[minmax(0,1fr)] gap-x-14 px-margin lg:grid-cols-[14rem_minmax(0,1fr)]">
        {/* Sidebar (Sg Sidebar) */}
        <aside className="z-10 min-w-0 max-lg:sticky max-lg:top-0 max-lg:-mx-margin max-lg:border-b max-lg:border-white/10 max-lg:bg-page/95 max-lg:px-margin max-lg:py-3 max-lg:backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:py-10 no-scrollbar" data-lenis-prevent>
          <div className="mb-8 flex items-center gap-3 max-lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-full bg-gold type-button text-white">A</span>
            <span className="flex flex-col">
              <span className="type-body-s-strong text-ink">Adamson</span>
              <span className="type-body-xs text-muted">Style guide</span>
            </span>
          </div>
          <DocsNav items={SECTIONS.map(([id, label]) => ({ id, label }))} />
        </aside>

        <main className="flex min-w-0 flex-col gap-16 py-10 lg:py-14">
          {/* 01 Overview */}
          <SgSection index={0} id="overview">
            <h1 className="sr-only">Adamson style guide</h1>
            <p className="max-w-[46rem] type-body-l text-subtle">
              Every color, type role, utility, component and page section of the Adamson website, each shown live. It’s rendered from the site’s
              own code with live content from WordPress, so it always matches what visitors see. Names follow the BrandVM wf-template conventions.
            </p>
            <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Find it", "Use the numbered sections on the left; the one you’re reading is highlighted."],
                ["Read a row", "Left: the name, its class and a note. Right: the real thing, live."],
                ["Reuse before you add", "Look for an existing class or component first. A new one needs a reason."],
                ["Add it here", "A new class or component gets its row on this page in the same piece of work."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-md border border-white/10 bg-white/[0.03] p-5">
                  <p className="type-body-s-strong text-ink">{t}</p>
                  <p className="mt-1.5 type-body-xs text-muted">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <SgRow name="At a glance">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {[[GOLD.length + CHARCOAL.length, "colors"], [ROLES.length, "theme roles"], [TYPE.length, "type roles"], [products.length, "products"]].map(([n, l]) => (
                    <div key={l as string} className="rounded-md border border-white/10 p-4">
                      <p className="type-h4 text-ink">{n}</p>
                      <p className="type-body-xs text-muted">{l}</p>
                    </div>
                  ))}
                </div>
              </SgRow>
              <SgRow name="Fonts" note="Loaded with next/font, self-hosted.">
                <p className="type-h4 text-ink">Outfit <span className="type-body-s text-muted">Light 300 · Regular 400 · Medium 500</span></p>
              </SgRow>
              <SgRow name="Variable collections" note="Tokens in app/globals.css (@theme).">
                <SgTable
                  head={["Collection", "Holds", "Modes"]}
                  rows={[
                    ["Colors", "Premium Gold and Charcoal Black scales", "Base"],
                    ["Colors Semantic", "Color roles (Background, Text, Border, Button, Brand)", "Dark (default), Light"],
                    ["Typography Role", "D0–D6, Display, Body, Label roles", "Desktop, below 1024px"],
                    ["Layout", "Section padding, container width, nav and button heights", "Desktop, below 1024px"],
                    ["Spacing / Radius", "Space scale, corner radii", "Base"],
                  ]}
                />
              </SgRow>
              <SgRow name="Breakpoints" note="The desktop design scales; small screens stack.">
                <SgTable
                  head={["Range", "Behaviour"]}
                  rows={[
                    ["≥ 1024px", "The 1680px design scales with the window (all sizes in rem), up to 2560px."],
                    ["< 1024px", "Fixed 16px base; sections stack; type roles and layout take their small values."],
                  ]}
                />
              </SgRow>
            </div>
          </SgSection>

          {/* 02 Colors */}
          <SgSection index={1} id="colors">
            {[["Premium Gold", GOLD, "Brand gold. Base is the primary action and the logo; 600 is the accent on dark."], ["Charcoal Black", CHARCOAL, "Neutrals. Base is the raised surface; 200–600 are text greys."]].map(([name, scale, note]) => (
              <SgRow key={name as string} name={name as string} cls={`Colors/${name as string}`} note={note as string}>
                <div className="grid grid-cols-5 gap-2 xl:grid-cols-10">
                  {(scale as string[][]).map(([step, hex]) => (
                    <div key={step} className="flex flex-col gap-1.5">
                      <div className="h-14 rounded-sm border border-white/10" style={{ background: hex }} />
                      <span className="type-body-xs text-ink">{step}</span>
                      <span className="type-body-xs text-muted">{hex}</span>
                    </div>
                  ))}
                </div>
              </SgRow>
            ))}
          </SgSection>

          {/* 03 Themes */}
          <SgSection index={2} id="themes">
            <SgRow name="Section" cls={[".section", "bg-page"]} note="Default mode: Dark. Every page section is a Section; its theme combo sets the mode.">
              <Panel><p className="type-h5 text-ink">Dark surface</p><p className="type-body-s text-subtle">Text/Secondary on Background/Page</p></Panel>
            </SgRow>
            <SgRow name="Section Is Light" cls={[".section.is-light", "bg-white text-black"]} note="Light mode for white sections (Products, Technology, News).">
              <Panel light><p className="type-h5">Light surface</p><p className="type-body-s text-secondary">Text/Secondary on Background/Page</p></Panel>
            </SgRow>
            <SgRow name="Roles per mode" note="Colors Semantic. Name is the wf-template role; Figma shows the design token.">
              <SgTable
                head={["Role", "Figma token", "Dark", "Light", "Class here"]}
                rows={ROLES.map(([wf, figma, dark, light, cls]) => [
                  wf,
                  figma,
                  <span key="d" className="flex items-center gap-2"><Dot color={dark} />{dark}</span>,
                  <span key="l" className="flex items-center gap-2"><Dot color={light} />{light}</span>,
                  cls,
                ])}
              />
            </SgRow>
          </SgSection>

          {/* 04 Typography */}
          <SgSection index={3} id="typography">
            {TYPE.map(([name, cls, figma, desk, mobile, sample]) => (
              <SgRow key={cls} name={name} cls={[`.${cls}`, `type-${cls === "d0" ? "wordmark" : ""}`].filter((c) => !c.endsWith("-"))} note={<>{figma}<br />Desktop {desk}<br />Below 1024px {mobile}</>}>
                <p className={`${cls} min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-ink ${["d0", "display-xl", "display-l"].includes(cls) ? "!text-[clamp(3rem,8vw,8rem)] !leading-none" : ""}`}>{sample}</p>
              </SgRow>
            ))}
            <SgRow name="Type scale" note="Display rows above are shown reduced; the scale has the real sizes (Figma px at 1680).">
              <SgTable head={["Role", "Class", "Figma", "Desktop", "Below 1024px"]} rows={TYPE.map(([n, c, f, d, m]) => [n, `.${c}`, f, d, m])} />
            </SgRow>
          </SgSection>

          {/* 05 Utilities */}
          <SgSection index={4} id="utilities">
            {[
              ["Text Secondary", ["text-subtle", "text-secondary"], "Text/Secondary: body copy. text-subtle on dark, text-secondary on light.", <p key="s" className="type-body-m text-subtle">Designed and Manufactured in Canada.</p>],
              ["Text Muted", ["text-muted"], "Text/Muted: meta such as dates and counters.", <p key="m" className="type-body-s text-muted">Oct 15, 2026</p>],
              ["Text Accent", ["text-accent", "text-gold"], "Text/Accent: eyebrows. text-accent on dark, text-gold on light.", <p key="a" className="label-text text-accent">Loudspeakers</p>],
              ["Text Uppercase", ["uppercase"], "Already part of Label Text.", <p key="u" className="type-body-s uppercase text-ink">Adamson</p>],
              ["Weight Light", ["font-light"], "300.", <p key="wl" className="type-h5 font-light text-ink">Weight Light</p>],
              ["Weight Medium", ["font-medium"], "500. Body S + Weight Medium = Figma Body/S Strong.", <p key="wm" className="body-s font-medium text-ink">Paul (PAB) Boothroyd</p>],
              ["Max Width Text", ["max-w-[46rem]"], "Keeps paragraphs readable.", <p key="mw" className="max-w-[46rem] type-body-s text-subtle">Long paragraphs stay within about 70 characters per line so they are comfortable to read on wide screens.</p>],
            ].map(([n, c, note, specimen]) => (
              <SgRow key={n as string} name={n as string} cls={c as string[]} note={note as string}>{specimen as ReactNode}</SgRow>
            ))}
          </SgSection>

          {/* 06 Spacing, radius and layout */}
          <SgSection index={5} id="spacing">
            <SgRow name="Spacing" cls="Spacing/4 … Spacing/120" note="Paddings and gaps snap to this scale. Tailwind: n ÷ 4 (p-6 = 24px).">
              <SgTable
                head={["Variable", "Value", "Bar", "Class"]}
                rows={SPACE.map((n) => [`Spacing/${n}`, `${n}px`, <span key="b" className="inline-block h-2 rounded-full bg-gold" style={{ width: `${n / 16}rem` }} />, `p-${n / 4} · gap-${n / 4}`])}
              />
            </SgRow>
            <SgRow name="Radius" cls={["rounded-sm", "rounded-md", "rounded-lg", "rounded-full"]} note="Radius/SM 12 thumbnails · MD 16 cards · LG 20 sections and hero · Pill buttons and avatars.">
              <div className="grid grid-cols-4 gap-3">
                {["rounded-sm", "rounded-md", "rounded-lg", "rounded-full"].map((r) => <div key={r} className={`h-20 border border-white/20 bg-raised ${r}`} />)}
              </div>
            </SgRow>
            <SgRow name="Effects" cls={["backdrop-blur-[10px]", "[32px]", "[64px]"]} note="Blur/Glass S buttons and tags · M glass cards (with Background/Glass and Border/Subtle) · L large panels.">
              <div className="grid grid-cols-3 gap-3">
                {[10, 32, 64].map((b) => (
                  <div key={b} className="relative h-28 overflow-hidden rounded-md bg-raised">
                    {photo && <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />}
                    <div className="absolute inset-x-[15%] inset-y-[22%] flex items-center justify-center rounded-sm border border-white/10 bg-glass type-body-xs text-ink" style={{ backdropFilter: `blur(${b}px)` }}>{b}px</div>
                  </div>
                ))}
              </div>
            </SgRow>
            <SgRow name="Layout" note="Page rhythm. Desktop values scale with the window from 1024px up.">
              <SgTable
                head={["Variable", "Desktop", "Below 1024px", "Class"]}
                rows={[
                  ["Section/Padding V", "120px", "72px", "py-section"],
                  ["Section/Padding H", "68px", "20px", "px-margin"],
                  ["Container/Max Width", "1680px", "100%", "site-container"],
                  ["Grid", "12 columns · 16px gutter · 1544px content", "single column", "grid-cols-12 gap-4"],
                  ["Nav/Height", "96px", "72px", "h-24"],
                  ["Button/Height", "36px (S) · 42px (M)", "same", "Button size"],
                ]}
              />
            </SgRow>
          </SgSection>

          {/* 07 Buttons and links */}
          <SgSection index={6} id="buttons">
            {[
              ["C | Button · Is Primary", ".button.is-primary", 'Gold. One per view. <Button variant="primary" />', () => <Button href="#" label="Products" variant="primary" />, false],
              ["C | Button · Is Contrast", ".button.is-contrast", 'Main CTA: white on dark, black on light. variant="contrast" / "contrast-light".', (light: boolean) => <Button href="#" label="Contact Us" variant={light ? "contrast-light" : "contrast"} />, true],
              ["C | Button · Is Secondary", ".button.is-secondary", 'Outline for supporting actions. variant="secondary" / "secondary-light".', (light: boolean) => <Button href="#" label="Technology" variant={light ? "secondary-light" : "secondary"} />, true],
              ["Button Size · Is Medium", ".button.is-medium", 'Size M (42px). Default S is 36px. size="m".', (light: boolean) => <Button href="#" label="Contact Us" variant={light ? "contrast-light" : "contrast"} size="m" />, true],
            ].map(([name, cls, note, render, both]) => (
              <SgRow key={name as string} name={name as string} cls={cls as string} note={<>{note as string}<br />States: hover, focus-visible.</>}>
                <div className={`grid gap-3 ${both ? "md:grid-cols-2" : ""}`}>
                  <Panel>{(render as (l: boolean) => ReactNode)(false)}</Panel>
                  {both && <Panel light>{(render as (l: boolean) => ReactNode)(true)}</Panel>}
                </div>
              </SgRow>
            ))}
            <SgRow name="C | Icon Button" cls={[".icon-button", "SliderArrows"]} note="44px round glass button with an arrow. Disabled at 30% opacity.">
              <div className="grid gap-3 md:grid-cols-2">
                <Panel><SliderArrows onPrev={undefined as never} onNext={undefined as never} canPrev={false} /></Panel>
                <Panel light><SliderArrows tone="light" onPrev={undefined as never} onNext={undefined as never} canPrev={false} /></Panel>
              </div>
            </SgRow>
            <SgRow name="Arrow Link" cls={[".arrow-link", "ArrowLink"]} note="60px glass link with an arrow; makes a whole card clickable.">
              <Panel><ArrowLink href="#" label="Example arrow link" /></Panel>
            </SgRow>
            <SgRow name="Nav Link" cls={[".nav-link", ".nav-link.is-dropdown"]} note="Header navigation item; Is Dropdown adds the chevron. Nav Link Text.">
              <Panel>
                <span className="flex h-10 items-center gap-1.5 rounded-full px-3.5 nav-link-text text-ink">Products<img src="/icons/chevron-down.svg" alt="" width={12} height={12} className="size-3" /></span>
                <span className="flex h-10 items-center rounded-full px-3.5 nav-link-text text-ink">Technology</span>
              </Panel>
            </SgRow>
          </SgSection>

          {/* 08 Forms */}
          <SgSection index={7} id="form-elements">
            <SgRow name="Form Input" cls=".form-input" note="Pill field: Border/Default, gold on focus. Placeholder in Text/Muted.">
              <div className="grid gap-3 md:grid-cols-2">
                {[false, true].map((light) => (
                  <Panel key={String(light)} light={light}>
                    <label className="sr-only" htmlFor={`sg-email-${light}`}>Email address</label>
                    <input id={`sg-email-${light}`} type="email" placeholder="Email address" className={`h-9 w-full rounded-full border bg-transparent px-4 body-s outline-none focus:border-gold ${light ? "border-black/14 text-black placeholder:text-charcoal-400" : "border-line text-ink placeholder:text-muted"}`} />
                  </Panel>
                ))}
              </div>
            </SgRow>
            <SgRow name="Form Row" cls={[".form-row", ".form-input", ".button.is-contrast"]} note="Input with its submit button (newsletter).">
              <Panel>
                <form className="flex w-full max-w-[26rem] items-center gap-2" action="#">
                  <label className="sr-only" htmlFor="sg-news">Email address</label>
                  <input id="sg-news" type="email" placeholder="Email address" className="h-9 min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 body-s text-ink outline-none placeholder:text-muted focus:border-gold" />
                  <button type="button" className="h-9 rounded-full bg-white px-4 button-text text-black">Subscribe</button>
                </form>
              </Panel>
            </SgRow>
          </SgSection>

          {/* 09 Components */}
          <SgSection index={8} id="components">
            <SgRow name="Label Text" cls={[".label-text", "Eyebrow"]} note="Section label above a heading. Text/Accent.">
              <div className="grid gap-3 md:grid-cols-2">
                <Panel><Eyebrow>Loudspeakers</Eyebrow></Panel>
                <Panel light><Eyebrow tone="light">Loudspeakers</Eyebrow></Panel>
              </div>
            </SgRow>
            <SgRow name="Chip" cls=".chip" note="Glass pill for categories over imagery. Chip Text.">
              <Panel>
                <span className="chip-text rounded-full border border-line bg-glass px-3 py-[0.4375rem] text-ink backdrop-blur-[5px]">Line Source</span>
                <span className="chip-text rounded-full border border-line px-3 py-[0.4375rem] text-ink">Subwoofer</span>
              </Panel>
            </SgRow>
            <SgRow name="Slider Counter" cls={[".slider-counter", "SliderCounter"]} note="Current slide (Label/Counter) over the total (Body XS).">
              <div className="grid gap-3 md:grid-cols-2">
                <Panel><SliderCounter index={0} total={6} /></Panel>
                <Panel light><SliderCounter index={0} total={6} tone="light" /></Panel>
              </div>
            </SgRow>
            <SgRow name="Section Head" cls={[".section-head", "SectionHeader"]} note="Label Text, D1 or D2, Body and an optional action. Layouts: row (stacks below 1024px), Is Stacked, Is Center; Is Light.">
              <div className="flex flex-col gap-3">
                <Panel className="block"><SectionHeader eyebrow="Row · D1" title="Section title" description="One short line that explains the section." action={<Button href="#" label="See all" variant="secondary" />} /></Panel>
                <div className="grid gap-3 md:grid-cols-2">
                  <Panel className="block"><SectionHeader layout="stacked" size="h2" eyebrow="Is Stacked · D2" title="Section title" description="One short line that explains the section." action={<Button href="#" label="About Adamson" variant="secondary" />} /></Panel>
                  <Panel className="block"><SectionHeader layout="center" size="h2" eyebrow="Is Center · D2" title="Section title" description="One short line that explains the section." /></Panel>
                </div>
                <Panel light className="block"><SectionHeader tone="light" eyebrow="Is Light" title="Products" description="Designed and Manufactured in Canada." action={<SliderArrows tone="light" onPrev={undefined as never} onNext={undefined as never} canPrev={false} />} /></Panel>
              </div>
            </SgRow>
            <SgRow name="G | Nav" cls={[".g-nav", "Header"]} note="Global header from WordPress → Site settings. Below 1024px: menu button and full-screen menu.">
              <ScaledFrame src="/design/style-guide/block/header" title="Header" />
            </SgRow>
            <SgRow name="G | Footer" cls={[".g-footer", "Footer"]} note="Global footer from WordPress → Site settings.">
              <ScaledFrame src="/design/style-guide/block/footer" title="Footer" />
            </SgRow>
          </SgSection>

          {/* 10 Other classes */}
          <SgSection index={9} id="other-classes">
            <SgTable
              head={["Class", "What it’s for"]}
              rows={[
                ["site-container", "S Wrapper: content width (max 1680px at design scale), centred."],
                ["px-margin · py-section", "Section/Padding H and V."],
                ["no-scrollbar", "Hides the scrollbar on sideways rows (product track, mobile nav)."],
                ["type-* (type-h1 …)", "The original style names; .d1 … .label-text are wf-template aliases of them."],
                ["StudioBackdrop", "CSS studio light behind product cut-outs (hero, featured products)."],
                ["Marquee · CountUp", "Motion: scroll-driven artist strip; count-up numbers."],
                ["data-move · data-scroll · data-parallax", "Hooks for the slider transition and scroll parallax (GSAP)."],
                ["lenis · lenis-stopped", "Smooth scrolling state (Lenis), set by script."],
              ]}
            />
          </SgSection>
        </main>
      </div>
    </div>
  );
}
