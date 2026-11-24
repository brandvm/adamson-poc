"use client";
import { useState } from "react";
import type { BlockProps } from "@/lib/types";
import SectionHeader from "@/components/ui/SectionHeader";
import { Field, Pill, Select, TextArea } from "@/components/ui/FormField";

// Contact (sitemap: "region map with full names: Americas, Europe Middle East
// and Africa, Asia Pacific. Find a distributor, then a contact form sent to
// the CRM"). Region tabs list offices and distributors as cards; the form below
// submits nowhere yet and shows the editable success message.

type Office = { name: string; kind: string; country: string; address: string; phone: string; email: string; website: string };
type Region = { name: string; offices: Office[] };
type Data = {
  anchor: string;
  eyebrow: string;
  heading: string;
  description: string;
  regions: Region[];
  formEyebrow: string;
  formTitle: string;
  formText: string;
  topics: string;
  successText: string;
};

export default function ContactRegions({ data }: BlockProps<Data>) {
  const regions = (data.regions ?? []).filter((r) => r?.name);
  const [active, setActive] = useState(0);
  const [sent, setSent] = useState(false);
  const region = regions[Math.min(active, regions.length - 1)];
  const topics = (data.topics ?? "").split("\n").map((t) => t.trim()).filter(Boolean);

  return (
    <>
      <section id={data.anchor || undefined} className="scroll-mt-24 bg-white text-black">
        <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
          <SectionHeader eyebrow={data.eyebrow} title={data.heading} description={data.description} size="h2" tone="light" />
          {regions.length > 0 && (
            <div role="tablist" aria-label="Regions" className="-mx-margin flex gap-2 overflow-x-auto px-margin no-scrollbar">
              {regions.map((r, i) => (
                <Pill key={r.name} tone="light" active={i === active} onClick={() => setActive(i)}>
                  {r.name}
                </Pill>
              ))}
            </div>
          )}
          {region && (
            <div role="tabpanel" aria-label={region.name} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(region.offices ?? []).filter((o) => o?.name).map((o, i) => (
                <article key={`${region.name}-${i}`} className="flex min-w-0 flex-col gap-4 rounded-lg border border-black/8 bg-[#f6f6f6] p-8 max-lg:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="type-eyebrow text-gold">{o.kind}</span>
                    {o.country && <span className="type-body-xs text-secondary">{o.country}</span>}
                  </div>
                  <h3 className="type-h5">{o.name}</h3>
                  {o.address && <p className="whitespace-pre-line type-body-s text-secondary">{o.address}</p>}
                  <div className="mt-auto flex flex-col gap-1 border-t border-black/8 pt-4 type-body-s">
                    {o.phone && <a href={`tel:${o.phone.replace(/[^+\d]/g, "")}`} className="hover:text-gold">{o.phone}</a>}
                    {o.email && <a href={`mailto:${o.email}`} className="break-all hover:text-gold">{o.email}</a>}
                    {o.website && <a href={o.website} className="break-all text-gold hover:underline">{o.website.replace(/^https?:\/\//, "")}</a>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="contact-form" className="scroll-mt-24 bg-page text-ink">
        <div className="site-container grid gap-16 px-margin py-section lg:grid-cols-[minmax(0,1fr)_minmax(0,46rem)] max-lg:gap-10">
          <SectionHeader layout="stacked" size="h2" eyebrow={data.formEyebrow} title={data.formTitle} description={data.formText} descriptionWidth={26} />
          {sent ? (
            <div role="status" className="self-start rounded-lg border border-line-subtle bg-raised/60 p-10 max-md:p-6">
              <p className="type-h5">{data.successText || "Thanks — we’ll be in touch."}</p>
              <button type="button" onClick={() => setSent(false)} className="mt-6 type-body-s text-accent hover:underline">Send another message</button>
            </div>
          ) : (
            <form
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Field id="contact-first" label="First name" autoComplete="given-name" required />
              <Field id="contact-last" label="Last name" autoComplete="family-name" required />
              <Field id="contact-email" label="Email" type="email" autoComplete="email" required />
              <Field id="contact-company" label="Company" autoComplete="organization" />
              <Select id="contact-region" label="Region" options={regions.map((r) => r.name)} value={region?.name} onChange={(e) => setActive(Math.max(0, regions.findIndex((r) => r.name === e.target.value)))} />
              <Select id="contact-topic" label="Topic" options={topics.length ? topics : ["General enquiry"]} />
              <TextArea id="contact-message" label="Message" className="md:col-span-2" required />
              <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
                <label className="flex items-center gap-2 type-body-xs text-subtle">
                  <input type="checkbox" className="size-4 accent-[#8a6e4b]" /> Send me the Adamson newsletter
                </label>
                <button type="submit" className="h-[2.625rem] rounded-full bg-white px-5 type-button-l text-black transition-colors hover:bg-gold-50">Send message</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
