"use client";
import { useEffect, useMemo, useState } from "react";
import type { BlockProps, DocumentItem } from "@/lib/types";
import SectionHeader from "@/components/ui/SectionHeader";
import { Pill } from "@/components/ui/FormField";

// Document Library (Support → Documentation & Downloads; sitemap "one
// searchable library"): search plus filters for product, file type and
// language, and a "Show discontinued" switch (never labelled "Legacy").
// Documents come from WordPress → Documents (extras.documents); in the editor
// preview they are fetched from /api/documents. Each row links to its
// document page (/support/downloads/<slug>).

type Data = {
  anchor: string;
  eyebrow: string;
  heading: string;
  description: string;
  searchPlaceholder: string;
  discontinuedLabel: string;
  emptyText: string;
};

const ALL = "All";

function unique(list: string[]) {
  return [ALL, ...Array.from(new Set(list.filter(Boolean))).sort((a, b) => a.localeCompare(b))];
}

function Dropdown({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="type-body-xs text-secondary">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-full border border-black/14 bg-white pr-10 pl-4 type-body-s text-black outline-none focus:border-gold"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/chevron-down.svg" alt="" width={12} height={12} className="pointer-events-none absolute top-1/2 right-4 size-3 -translate-y-1/2 invert" />
      </div>
    </div>
  );
}

export default function DocumentLibrary({ data, extras }: BlockProps<Data>) {
  const provided = extras?.documents;
  const [fetched, setFetched] = useState<DocumentItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState(ALL);
  const [fileType, setFileType] = useState(ALL);
  const [language, setLanguage] = useState(ALL);
  const [discontinued, setDiscontinued] = useState(false);

  useEffect(() => {
    if (provided) return;
    let cancelled = false;
    fetch("/api/documents")
      .then((r) => (r.ok ? (r.json() as Promise<DocumentItem[]>) : []))
      .then((d) => !cancelled && setFetched(Array.isArray(d) ? d : []))
      .catch(() => !cancelled && setFetched([]));
    return () => {
      cancelled = true;
    };
  }, [provided]);

  const docs = useMemo(() => provided ?? fetched ?? [], [provided, fetched]);
  const pool = docs.filter((d) => discontinued || !d.discontinued);
  const products = unique(pool.map((d) => d.product));
  const types = unique(pool.map((d) => d.fileType));
  const languages = unique(pool.map((d) => d.language));

  const q = query.trim().toLowerCase();
  const results = pool.filter(
    (d) =>
      (product === ALL || d.product === product) &&
      (fileType === ALL || d.fileType === fileType) &&
      (language === ALL || d.language === language) &&
      (!q || [d.title, d.product, d.series, d.fileType, d.summary].join(" ").toLowerCase().includes(q)),
  );

  const reset = () => {
    setQuery("");
    setProduct(ALL);
    setFileType(ALL);
    setLanguage(ALL);
  };
  const filtered = Boolean(q) || product !== ALL || fileType !== ALL || language !== ALL;

  return (
    <section id={data.anchor || undefined} className="scroll-mt-24 bg-white text-black">
      <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
        <SectionHeader eyebrow={data.eyebrow} title={data.heading} description={data.description} size="h2" tone="light" />

        <div className="flex flex-col gap-5 rounded-lg bg-[#f6f6f6] p-6 max-md:p-4">
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="doc-search" className="sr-only">Search documents</label>
            <input
              id="doc-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={data.searchPlaceholder || "Search by product, file or keyword"}
              className="h-12 w-full rounded-full border border-black/14 bg-white px-5 type-body-m text-black outline-none placeholder:text-charcoal-400 focus:border-gold"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Dropdown id="doc-product" label="Product" value={product} options={products} onChange={setProduct} />
            <Dropdown id="doc-type" label="File type" value={fileType} options={types} onChange={setFileType} />
            <Dropdown id="doc-language" label="Language" value={language} options={languages} onChange={setLanguage} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-3 type-body-s text-black">
              <input type="checkbox" checked={discontinued} onChange={(e) => setDiscontinued(e.target.checked)} className="size-4 accent-[#8a6e4b]" />
              {data.discontinuedLabel || "Show discontinued products"}
            </label>
            <div className="flex items-center gap-3">
              <span className="type-body-xs text-secondary" aria-live="polite">
                {results.length} {results.length === 1 ? "file" : "files"}
              </span>
              {filtered && <Pill tone="light" active={false} onClick={reset}>Clear filters</Pill>}
            </div>
          </div>
        </div>

        {fetched === null && !provided ? (
          <div className="h-40 animate-pulse rounded-lg bg-black/5" aria-hidden />
        ) : results.length === 0 ? (
          <p className="rounded-lg border border-black/8 p-10 text-center type-body-m text-secondary">{data.emptyText || "No files match. Try another product or clear the filters."}</p>
        ) : (
          <ul className="flex flex-col border-t border-black/10">
            {results.map((d) => (
              <li key={d.id} className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 border-b border-black/10 py-5 md:grid-cols-[minmax(0,1fr)_10rem_7rem_6rem_auto]">
                <div className="flex min-w-0 flex-col gap-1">
                  <a href={`/support/downloads/${d.slug}`} className="type-h6 after:absolute after:inset-0 group-hover:text-gold">
                    {d.title}
                  </a>
                  <span className="type-body-xs text-secondary">
                    {d.product}
                    {d.discontinued && " · Discontinued"}
                    <span className="md:hidden"> · {d.fileType} · {d.language}</span>
                  </span>
                </div>
                <span className="type-body-s text-secondary max-md:hidden">{d.fileType}</span>
                <span className="type-body-s text-secondary max-md:hidden">{d.language}</span>
                <span className="type-body-xs text-charcoal-400 max-md:hidden">{d.size}</span>
                <span className="flex size-10 items-center justify-center rounded-full border border-black/14 transition-colors group-hover:border-black/40" aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/arrow-right-line.svg" alt="" width={16} height={16} className="size-4 invert" />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
